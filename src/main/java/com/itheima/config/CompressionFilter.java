package com.itheima.config;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.WriteListener;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.util.Locale;
import java.util.zip.GZIPOutputStream;

/**
 * HTTP 响应 GZIP 压缩（零依赖，WAR 内自带）
 *
 * 目标：在不改变 JSON 协议的前提下极致压缩带宽，并保持浏览器原生支持。
 */
@WebFilter(filterName = "compressionFilter", urlPatterns = "/*")
public class CompressionFilter implements Filter {
    private static final int MIN_SIZE_BYTES = 512;

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {
        if (!(servletRequest instanceof HttpServletRequest) || !(servletResponse instanceof HttpServletResponse)) {
            chain.doFilter(servletRequest, servletResponse);
            return;
        }

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        if (!acceptsGzip(request) || isAlreadyEncoded(response) || isBinaryAsset(request)) {
            chain.doFilter(servletRequest, servletResponse);
            return;
        }

        BufferingResponseWrapper wrapper = new BufferingResponseWrapper(response);
        chain.doFilter(servletRequest, wrapper);
        wrapper.flushBuffer();

        byte[] raw = wrapper.getBody();
        if (raw.length < MIN_SIZE_BYTES || !isCompressible(wrapper.getContentType())) {
            // 回写原文
            response.setContentType(wrapper.getContentType());
            response.setCharacterEncoding(wrapper.getCharacterEncoding());
            response.getOutputStream().write(raw);
            return;
        }

        byte[] gzipped = gzip(raw);
        response.setHeader("Content-Encoding", "gzip");
        response.setHeader("Vary", "Accept-Encoding");
        response.setContentType(wrapper.getContentType());
        response.setCharacterEncoding(wrapper.getCharacterEncoding());
        response.setContentLength(gzipped.length);
        response.getOutputStream().write(gzipped);
    }

    @Override
    public void destroy() {}

    private boolean acceptsGzip(HttpServletRequest request) {
        String ae = request.getHeader("Accept-Encoding");
        return ae != null && ae.toLowerCase(Locale.ROOT).contains("gzip");
    }

    private boolean isAlreadyEncoded(HttpServletResponse response) {
        String encoding = response.getHeader("Content-Encoding");
        return encoding != null && !encoding.isEmpty();
    }

    private boolean isBinaryAsset(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri == null) {
            return false;
        }
        String lower = uri.toLowerCase(Locale.ROOT);
        return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif")
                || lower.endsWith(".webp") || lower.endsWith(".ico") || lower.endsWith(".woff")
                || lower.endsWith(".woff2") || lower.endsWith(".ttf") || lower.endsWith(".zip")
                || lower.endsWith(".gz") || lower.endsWith(".br");
    }

    private boolean isCompressible(String contentType) {
        if (contentType == null) {
            return true;
        }
        String lower = contentType.toLowerCase(Locale.ROOT);
        return lower.startsWith("text/") || lower.contains("application/json") || lower.contains("application/javascript")
                || lower.contains("application/xml") || lower.contains("image/svg+xml");
    }

    private byte[] gzip(byte[] raw) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream(Math.max(256, raw.length / 2));
        try (GZIPOutputStream gzip = new GZIPOutputStream(baos, true)) {
            gzip.write(raw);
        }
        return baos.toByteArray();
    }

    private static final class BufferingResponseWrapper extends HttpServletResponseWrapper {
        private final ByteArrayOutputStream buffer = new ByteArrayOutputStream(4096);
        private ServletOutputStream outputStream;
        private PrintWriter writer;

        BufferingResponseWrapper(HttpServletResponse response) {
            super(response);
        }

        @Override
        public ServletOutputStream getOutputStream() {
            if (writer != null) {
                throw new IllegalStateException("Writer already obtained");
            }
            if (outputStream == null) {
                outputStream = new ServletOutputStream() {
                    @Override
                    public void write(int b) {
                        buffer.write(b);
                    }

                    @Override
                    public boolean isReady() {
                        return true;
                    }

                    @Override
                    public void setWriteListener(WriteListener writeListener) {}
                };
            }
            return outputStream;
        }

        @Override
        public PrintWriter getWriter() throws IOException {
            if (outputStream != null) {
                throw new IllegalStateException("OutputStream already obtained");
            }
            if (writer == null) {
                Charset charset = Charset.forName(getCharacterEncoding() == null ? "UTF-8" : getCharacterEncoding());
                writer = new PrintWriter(new OutputStreamWriter(buffer, charset));
            }
            return writer;
        }

        byte[] getBody() {
            return buffer.toByteArray();
        }

        @Override
        public void flushBuffer() throws IOException {
            if (writer != null) {
                writer.flush();
            }
            if (outputStream != null) {
                outputStream.flush();
            }
        }
    }
}

