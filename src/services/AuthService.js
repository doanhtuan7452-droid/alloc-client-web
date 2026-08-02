import axiosClient from "../utils/axiosClient";
import {
  clearAuthTokens,
  getStoredRefreshToken,
  saveAuthTokens,
} from "../utils/authTokens";

function getDeviceInfo() {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return `${navigator.userAgent}`.slice(0, 200);
}

function extractErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData?.errorMessage) {
    return responseData.errorMessage;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.title) {
    return responseData.title;
  }

  return fallbackMessage;
}

async function persistAuthResponse(response) {
  const accessToken = response?.accessToken;
  const refreshToken = response?.refreshToken;

  if (accessToken || refreshToken) {
    saveAuthTokens({ accessToken, refreshToken });
  }

  return response;
}

const AuthService = {
  login: async ({ email, password }) => {
    try {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
        deviceInfo: getDeviceInfo(),
      });

      return await persistAuthResponse(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Đăng nhập thất bại."), { cause: error });
    }
  },

  registerLocal: async ({ fullName, email, password, confirmPassword }) => {
    try {
      const response = await axiosClient.post("/auth/register/local", {
        fullName,
        email,
        password,
        confirmPassword,
        deviceInfo: getDeviceInfo(),
      });

      return await persistAuthResponse(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Đăng ký thất bại."), { cause: error });
    }
  },

  registerGoogle: async ({ idToken }) => {
    try {
      const response = await axiosClient.post("/auth/register/google", {
        idToken,
        deviceInfo: getDeviceInfo(),
      });

      return await persistAuthResponse(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Đăng nhập Google thất bại."), { cause: error });
    }
  },

  refreshToken: async (refreshToken = getStoredRefreshToken()) => {
    if (!refreshToken) {
      throw new Error("Không tìm thấy refresh token.");
    }

    try {
      const response = await axiosClient.post("/auth/refresh-token", {
        refreshToken,
        deviceInfo: getDeviceInfo(),
      });

      return await persistAuthResponse(response);
    } catch (error) {
      clearAuthTokens();
      throw new Error(
        extractErrorMessage(error, "Phiên đăng nhập đã hết hạn."),
        { cause: error }
      );
    }
  },

  requestOtp: async ({ email }) => {
    try {
      return await axiosClient.post("/auth/request-otp", { email });
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể gửi OTP."), { cause: error });
    }
  },

  verifyOtp: async ({ email, code }) => {
    try {
      return await axiosClient.post("/auth/verify-otp", {
        email,
        code,
      });
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Xác thực OTP thất bại."), { cause: error });
    }
  },

  logoutLocal: async () => {
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      clearAuthTokens();
      return;
    }

    try {
      await axiosClient.post("/auth/revoke/local", { refreshToken });
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Đăng xuất thất bại."), { cause: error });
    } finally {
      clearAuthTokens();
    }
  },

  logoutGlobal: async () => {
    try {
      await axiosClient.post("/auth/revoke/global");
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Đăng xuất thất bại."), { cause: error });
    } finally {
      clearAuthTokens();
    }
  },

  getCurrentUser: async () => {
    try {
      return await axiosClient.get("/accounts/me"); 
    } catch (error) {
      console.error("Không thể lấy thông tin người dùng:", error);
      return null;
    }
  },

  clearSession: clearAuthTokens,
};

export default AuthService;
