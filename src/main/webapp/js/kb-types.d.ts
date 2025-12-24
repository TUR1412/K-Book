declare namespace Kb {
  type ToastType = 'success' | 'error' | 'info';

  interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    actionableSuggestion?: string;
    data?: T;
  }

  interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
    body?: BodyInit | null;
    timeoutMs?: number;
    retries?: number;
    retryDelayMs?: number;
    dedupeKey?: string;
    cacheKey?: string;
    cacheTtlMs?: number;
    expectJson?: boolean;
    idempotent?: boolean;
  }

  interface NetState {
    pendingCount: number;
    online: boolean;
    rttMs?: number;
    lastError?: string;
    lastUpdatedAt?: number;
  }

  type NetListener = (state: NetState) => void;

  interface InterceptorContext {
    url: string;
    resolvedUrl: string;
    options: RequestInit;
    attempt: number;
    startedAt: number;
  }

  type RequestInterceptor = (ctx: InterceptorContext) => void;
  type ResponseInterceptor = (ctx: InterceptorContext, response: Response) => void;
  type ErrorInterceptor = (ctx: InterceptorContext, error: unknown) => void;

  interface Api {
    state: NetState;
    url: (path: string) => string;
    subscribe: (listener: NetListener) => () => void;
    use: (hooks: {
      onRequest?: RequestInterceptor;
      onResponse?: ResponseInterceptor;
      onError?: ErrorInterceptor;
    }) => void;
    request: <T = unknown>(path: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
    get: <T = unknown>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
    postForm: <T = unknown>(
      path: string,
      form: HTMLFormElement,
      options?: Omit<RequestOptions, 'method' | 'body'>
    ) => Promise<ApiResponse<T>>;
  }
}

declare interface Window {
  kbApi?: Kb.Api;
  kbToast?: (message: string, type?: Kb.ToastType) => void;
  __ctx?: string;
}

