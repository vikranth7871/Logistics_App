import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@store/auth.store';
import toast from 'react-hot-toast';

/**
 * ─────────────────────────────────────────────────────────────────
 *  SINGLETON AXIOS INSTANCE
 *  This is the ONLY place we create an axios instance.
 *  Import and use `apiClient` everywhere in the app — never create
 *  new axios instances or call axios.get() directly.
 * ─────────────────────────────────────────────────────────────────
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────
// Automatically attaches the access token to every request.
// No manual headers needed in feature code.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────
// Handles:
//   401 → auto-refresh token, then retry the original request once
//   403 → permission denied toast
//   5xx → server error toast
//   Network errors → offline toast
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── 401: Try token refresh once ──────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request until the ongoing refresh completes
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await useAuthStore.getState().refreshAccessToken();
        onTokenRefreshed(newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        // Refresh failed → force logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403: Permission denied ───────────────────────────────────
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    }

    // ── 5xx: Server error ────────────────────────────────────────
    if (error.response && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // ── Network error ────────────────────────────────────────────
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  },
);

export default apiClient;

/**
 * Typed error extractor.
 * Usage: catch (err) { toast.error(getErrorMessage(err)); }
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    // Handle both array and string messages from NestJS validation
    if (Array.isArray(data?.message)) return data.message.join(', ');
    return data?.message || error.message || 'Something went wrong';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

/**
 * Get machine-readable error code from API response.
 * Usage: if (getErrorCode(err) === 'TRIP_VEHICLE_UNAVAILABLE') { ... }
 */
export function getErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.code;
  }
  return undefined;
}

/**
 * File upload helper — multipart/form-data with progress tracking.
 */
export async function uploadFile(
  endpoint: string,
  file: File,
  metadata: Record<string, string> = {},
  onProgress?: (percent: number) => void,
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(metadata).forEach(([k, v]) => formData.append(k, v));

  const response = await apiClient.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percent);
      }
    },
  });

  return response.data;
}
