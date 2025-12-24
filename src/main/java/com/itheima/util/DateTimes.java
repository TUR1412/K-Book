package com.itheima.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public final class DateTimes {
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private DateTimes() {}

    public static String todayIsoDate() {
        return formatIsoDate(LocalDate.now());
    }

    public static String formatIsoDate(LocalDate date) {
        if (date == null) {
            return null;
        }
        return date.format(ISO_DATE);
    }

    public static LocalDate parseIsoDateOrNull(String value) {
        String trimmed = InputSanitizers.trimToNull(value);
        if (trimmed == null) {
            return null;
        }
        try {
            return LocalDate.parse(trimmed, ISO_DATE);
        } catch (Exception ex) {
            return null;
        }
    }
}

