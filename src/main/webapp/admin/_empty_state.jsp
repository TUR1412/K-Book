<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<div class="empty-state">
    <div class="empty-illustration" aria-hidden="true">
        <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#dbeafe"/>
                    <stop offset="100%" stop-color="#dcfce7"/>
                </linearGradient>
            </defs>
            <rect x="22" y="30" width="156" height="100" rx="18" fill="url(#glass)" stroke="#cbd5f5"/>
            <rect x="40" y="50" width="60" height="16" rx="8" fill="rgba(37,99,235,0.2)"/>
            <rect x="40" y="76" width="96" height="10" rx="5" fill="rgba(15,23,42,0.12)"/>
            <rect x="40" y="94" width="80" height="10" rx="5" fill="rgba(15,23,42,0.12)"/>
            <circle cx="150" cy="58" r="18" fill="rgba(34,197,94,0.2)"/>
        </svg>
    </div>
    <div class="empty-title"><c:out value="${param.title}"/></div>
    <div class="empty-desc"><c:out value="${param.desc}"/></div>
    <c:if test="${not empty param.actionText}">
        <a class="btn btn-ghost btn-sm" href="${param.actionHref}"><c:out value="${param.actionText}"/></a>
    </c:if>
</div>
