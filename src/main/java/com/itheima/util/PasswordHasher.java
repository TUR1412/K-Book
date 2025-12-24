package com.itheima.util;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * 轻量级口令哈希工具：PBKDF2(HmacSHA256) + 随机盐。
 *
 * 存储格式：
 * pbkdf2_sha256$<iterations>$<saltBase64>$<hashBase64>
 */
public final class PasswordHasher {
    private static final String PREFIX = "pbkdf2_sha256";
    private static final String DELIMITER = "\\$";
    private static final int ITERATIONS = 210_000;
    private static final int SALT_BYTES = 16;
    private static final int KEY_BITS = 256;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private PasswordHasher() {}

    public static String hash(String rawPassword) {
        if (rawPassword == null) {
            throw new IllegalArgumentException("password is null");
        }
        byte[] salt = new byte[SALT_BYTES];
        SECURE_RANDOM.nextBytes(salt);
        byte[] derived = pbkdf2(rawPassword.toCharArray(), salt, ITERATIONS, KEY_BITS);
        return PREFIX + "$" + ITERATIONS + "$" + Base64.getEncoder().encodeToString(salt) + "$" + Base64.getEncoder().encodeToString(derived);
    }

    public static boolean matches(String rawPassword, String stored) {
        if (rawPassword == null || stored == null) {
            return false;
        }
        String trimmed = stored.trim();
        if (trimmed.isEmpty()) {
            return false;
        }
        if (!trimmed.startsWith(PREFIX + "$")) {
            return rawPassword.equals(trimmed);
        }
        String[] parts = trimmed.split(DELIMITER);
        if (parts.length != 4) {
            return false;
        }
        int iterations;
        try {
            iterations = Integer.parseInt(parts[1]);
        } catch (NumberFormatException ex) {
            return false;
        }
        byte[] salt;
        byte[] expected;
        try {
            salt = Base64.getDecoder().decode(parts[2]);
            expected = Base64.getDecoder().decode(parts[3]);
        } catch (IllegalArgumentException ex) {
            return false;
        }
        byte[] actual = pbkdf2(rawPassword.toCharArray(), salt, iterations, expected.length * 8);
        return MessageDigest.isEqual(expected, actual);
    }

    private static byte[] pbkdf2(char[] password, byte[] salt, int iterations, int keyBits) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, keyBits);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } catch (Exception ex) {
            throw new IllegalStateException("PBKDF2 计算失败", ex);
        }
    }
}

