package com.itheima.config;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Locale;

@WebFilter(filterName = "encodingFilter",urlPatterns = "/*")
public class EncodingFilter  implements Filter {
    private static final String CSP_NONCE_ATTR = "cspNonce";
    private final SecureRandom random = new SecureRandom();

    @Override
    public void init(FilterConfig filterConfig) {}
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        servletRequest.setCharacterEncoding("UTF-8");
        servletResponse.setCharacterEncoding("UTF-8");
        if (servletRequest instanceof HttpServletRequest && servletResponse instanceof HttpServletResponse) {
            HttpServletRequest request = (HttpServletRequest) servletRequest;
            HttpServletResponse response = (HttpServletResponse) servletResponse;
            String nonce = newCspNonce();
            request.setAttribute(CSP_NONCE_ATTR, nonce);
            applySecurityHeaders(response, nonce);
            applyCacheHeaders(request, response);
        }
        filterChain.doFilter(servletRequest,servletResponse);
    }
    @Override
    public void destroy() {}

    private void applySecurityHeaders(HttpServletResponse response, String nonce) {
        response.setHeader("X-Frame-Options", "SAMEORIGIN");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
        response.setHeader("Content-Security-Policy", buildCsp(nonce));
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

    private String newCspNonce() {
        byte[] bytes = new byte[18];
        random.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private String buildCsp(String nonce) {
        String safeNonce = nonce == null ? "" : nonce.replace("\r", "").replace("\n", "");
        return "default-src 'self'; "
                + "base-uri 'self'; "
                + "form-action 'self'; "
                + "frame-ancestors 'self'; "
                + "object-src 'none'; "
                + "script-src 'self' 'nonce-" + safeNonce + "'; "
                + "style-src 'self'; "
                + "img-src 'self' data:; "
                + "font-src 'self' data:; "
                + "connect-src 'self'";
    }
}
