package com.itheima.config;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Locale;

@WebFilter(filterName = "encodingFilter",urlPatterns = "/*")
public class EncodingFilter  implements Filter {
    @Override
    public void init(FilterConfig filterConfig) {}
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        servletRequest.setCharacterEncoding("UTF-8");
        servletResponse.setCharacterEncoding("UTF-8");
        if (servletRequest instanceof HttpServletRequest && servletResponse instanceof HttpServletResponse) {
            HttpServletRequest request = (HttpServletRequest) servletRequest;
            HttpServletResponse response = (HttpServletResponse) servletResponse;
            applySecurityHeaders(response);
            applyCacheHeaders(request, response);
        }
        filterChain.doFilter(servletRequest,servletResponse);
    }
    @Override
    public void destroy() {}

    private void applySecurityHeaders(HttpServletResponse response) {
        response.setHeader("X-Frame-Options", "SAMEORIGIN");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
        response.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
    }

    private void applyCacheHeaders(HttpServletRequest request, HttpServletResponse response) {
        String uri = request.getRequestURI();
        if (isStaticAsset(uri)) {
            return;
        }
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
    }

    private boolean isStaticAsset(String uri) {
        if (uri == null) {
            return false;
        }
        String lower = uri.toLowerCase(Locale.ROOT);
        if (lower.contains("/css/") || lower.contains("/js/") || lower.contains("/img/") || lower.contains("/fonts/")) {
            return true;
        }
        return lower.endsWith(".css") || lower.endsWith(".js") || lower.endsWith(".png") || lower.endsWith(".jpg")
                || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".svg") || lower.endsWith(".ico")
                || lower.endsWith(".woff") || lower.endsWith(".woff2") || lower.endsWith(".ttf");
    }
}
