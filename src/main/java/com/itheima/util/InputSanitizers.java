package com.itheima.util;

public final class InputSanitizers {
    private InputSanitizers() {}

    public static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public static String normalizeText(String value, int maxLen) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            return null;
        }
        String collapsed = trimmed.replaceAll("\\s+", " ");
        if (collapsed.length() > maxLen) {
            return collapsed.substring(0, maxLen);
        }
        return collapsed;
    }

    public static int normalizePageNum(Integer pageNum) {
        int num = pageNum == null ? 1 : pageNum;
        return Math.max(num, 1);
    }

    public static int normalizePageSize(Integer pageSize, int defaultSize, int maxSize) {
        int size = pageSize == null ? defaultSize : pageSize;
        if (size < 1) {
            return defaultSize;
        }
        return Math.min(size, maxSize);
    }
}

