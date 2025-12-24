package com.itheima.config;

import entity.Result;
import entity.Results;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;

/**
 * 轻量 CSRF 防护：
 * - 为所有请求注入 csrfToken（request attribute），便于 JSP/JS 使用
 * - 对关键状态变更接口执行 token 校验（Header 或表单字段）
 */
@WebFilter(filterName = "csrfFilter", urlPatterns = "/*")
public class CsrfFilter implements Filter {
    private static final String SESSION_KEY = "KB_CSRF_TOKEN";
    private static final String REQUEST_ATTR = "csrfToken";
    private static final String HEADER_NAME = "X-CSRF-Token";
    private static final String PARAM_NAME = "_csrf";

    private static final Set<String> PROTECTED_PATHS = new HashSet<String>() {{
        add("/login");
        add("/logout");
        add("/book/borrowBook");
        add("/book/addBook");
        add("/book/editBook");
        add("/book/returnBook");
        add("/book/returnConfirm");
    }};

    private final SecureRandom random = new SecureRandom();

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

        HttpSession session = request.getSession(true);
        String token = (String) session.getAttribute(SESSION_KEY);
        if (token == null || token.isEmpty()) {
            token = generateToken();
            session.setAttribute(SESSION_KEY, token);
        }
        request.setAttribute(REQUEST_ATTR, token);

        String path = normalizePath(request);
        if (requiresCheck(path)) {
            String provided = headerOrParam(request);
            if (provided == null || !provided.equals(token)) {
                reject(request, response);
                return;
            }
        }

        chain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {}

    private boolean requiresCheck(String path) {
        return path != null && PROTECTED_PATHS.contains(path);
    }

    private String headerOrParam(HttpServletRequest request) {
        String header = trimToNull(request.getHeader(HEADER_NAME));
        if (header != null) {
            return header;
        }
        return trimToNull(request.getParameter(PARAM_NAME));
    }

    private void reject(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        if (isAjax(request)) {
            response.setContentType("application/json; charset=UTF-8");
            Result<Void> body = Results.fail("请求已被拒绝。", "请刷新页面后重试。");
            response.getWriter().write(toJson(body));
            return;
        }

        response.setContentType("text/plain; charset=UTF-8");
        response.getWriter().write("Forbidden");
    }

    private boolean isAjax(HttpServletRequest request) {
        String xhr = request.getHeader("X-Requested-With");
        if (xhr != null && xhr.equalsIgnoreCase("XMLHttpRequest")) {
            return true;
        }
        String accept = request.getHeader("Accept");
        return accept != null && accept.contains("application/json");
    }

    private String normalizePath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri == null) {
            return "";
        }
        String ctx = request.getContextPath();
        if (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx)) {
            return uri.substring(ctx.length());
        }
        return uri;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String generateToken() {
        byte[] bytes = new byte[18];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String toJson(Result<?> result) {
        // 本项目不引入 JSON 库时的最小化安全输出（仅用于 CSRF 拒绝响应）
        String message = escapeJson(result.getMessage());
        String suggestion = escapeJson(result.getActionableSuggestion());
        return "{\"success\":false,\"message\":\"" + message + "\",\"actionableSuggestion\":\"" + suggestion + "\"}";
    }

    private String escapeJson(String raw) {
        if (raw == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder(raw.length() + 16);
        for (int i = 0; i < raw.length(); i++) {
            char c = raw.charAt(i);
            switch (c) {
                case '"':
                    sb.append("\\\"");
                    break;
                case '\\':
                    sb.append("\\\\");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                case '\t':
                    sb.append("\\t");
                    break;
                default:
                    sb.append(c);
            }
        }
        return sb.toString();
    }
}

