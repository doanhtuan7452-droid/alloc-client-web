import axios from "axios";
import {
  clearAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveAuthTokens,
  TEST_TOKEN_HEADER,
  TEST_TOKEN_VALUE,
} from "./authTokens";

const apiBaseURL = import.meta.env.DEV
  ? "/api/v1"
  : import.meta.env.VITE_API_BASE_URL || "https://localhost:7198/api/v1";

const axiosClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Danh sách các API không cần đính kèm Token hoặc xử lý Refresh Token khi lỗi 401
const authBypassPaths = [
  "auth/login",
  "auth/register",
  "auth/refresh-token",
  "auth/request-otp",
  "auth/verify-otp",
];

function normalizeHeaders(config) {
  if (!config.headers) {
    config.headers = {};
  }
  return config.headers;
}

// Kiểm tra xem API hiện tại có thuộc luồng Auth bypass hay không
function shouldSkipRefresh(config) {
  if (!config || !config.url) return false;
  const url = `${config.url}`.toLowerCase();
  return authBypassPaths.some((path) => url.includes(path.toLowerCase()));
}

axiosClient.interceptors.request.use(
  (config) => {
    const headers = normalizeHeaders(config);
    headers[TEST_TOKEN_HEADER] = TEST_TOKEN_VALUE;

    const token = getStoredAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error?.config;
    const isAuthRoute = shouldSkipRefresh(originalRequest);

    // Kiểm tra xem trình duyệt hiện tại có đang ở sẵn các trang login/register hay không
    const isAlreadyAtAuthPage =
      typeof window !== "undefined" &&
      (window.location.pathname.includes("/login") ||
        window.location.pathname.includes("/register"));

    // 1. Cố gắng refresh token (Chỉ áp dụng cho các route thông thường cần bảo mật)
    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      const refreshToken = getStoredRefreshToken();

      if (refreshToken) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await refreshClient.post(
            "/auth/refresh-token",
            { refreshToken },
          );

          saveAuthTokens(refreshResponse.data);

          const updatedHeaders = normalizeHeaders(originalRequest);
          if (refreshResponse.data?.accessToken) {
            updatedHeaders.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          }

          return axiosClient(originalRequest);
        } catch (refreshError) {
          clearAuthTokens();
          // Chỉ chuyển hướng nếu chưa ở trang Auth để tránh lặp F5
          if (typeof window !== "undefined" && !isAlreadyAtAuthPage) {
            window.location.href = "/login/email";
          }
          return Promise.reject(refreshError);
        }
      }
    }

    // 2. SỬA ĐỔI CHÍNH: Chỉ ép F5 về trang login nếu lỗi 401 KHÔNG thuộc luồng Auth 
    // VÀ người dùng KHÔNG ở sẵn các trang Login/Register
    if (
      error?.response?.status === 401 &&
      typeof window !== "undefined" &&
      !isAuthRoute &&
      !isAlreadyAtAuthPage
    ) {
      clearAuthTokens();
      window.location.href = "/login/email";
    }

    return Promise.reject(error);
  },
);

export default axiosClient;