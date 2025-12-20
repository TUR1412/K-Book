package entity;
import java.io.Serializable;
/**
 * 用于向页面传递信息的类
 */
public class Result<T> implements Serializable{
	private boolean success; //是否成功操作成功
	private String message; //需要传递的信息
	private T data;         //需要传递的数据
	private String actionableSuggestion; //可执行的改进建议
	public Result(boolean success, String message) {
		super();
		this.success=success;
		this.message = message;
	}
	public Result(boolean success, String message, String actionableSuggestion) {
		this.success = success;
		this.message = message;
		this.actionableSuggestion = actionableSuggestion;
	}
	public Result(boolean success, String message, T data) {
		this.success = success;
		this.message = message;
		this.data = data;
	}
	public Result(boolean success, String message, String actionableSuggestion, T data) {
		this.success = success;
		this.message = message;
		this.actionableSuggestion = actionableSuggestion;
		this.data = data;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public boolean isSuccess() {
		return success;
	}
	public void setSuccess(boolean success) {
		this.success = success;
	}
	public T getData() {
		return data;
	}
	public void setData(T data) {
		this.data = data;
	}
	public String getActionableSuggestion() {
		return actionableSuggestion;
	}
	public void setActionableSuggestion(String actionableSuggestion) {
		this.actionableSuggestion = actionableSuggestion;
	}
	public Result<T> withActionableSuggestion(String suggestion) {
		this.actionableSuggestion = suggestion;
		return this;
	}
}
