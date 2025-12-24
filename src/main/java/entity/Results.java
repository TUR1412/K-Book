package entity;

/**
 * Result 工厂方法集合（避免在调用方显式写泛型参数）。
 */
public final class Results {
    private Results() {}

    public static <T> Result<T> ok(String message) {
        return new Result<T>(true, message);
    }

    public static <T> Result<T> ok(String message, T data) {
        return new Result<T>(true, message, data);
    }

    public static <T> Result<T> fail(String message) {
        return new Result<T>(false, message);
    }

    public static <T> Result<T> fail(String message, String actionableSuggestion) {
        return new Result<T>(false, message, actionableSuggestion);
    }
}

