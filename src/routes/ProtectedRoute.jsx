import { Navigate, Outlet } from "react-router-dom";
import { getStoredRefreshToken } from "../utils/authTokens"; // Hoặc hàm kiểm tra accessToken tùy bạn cấu hình

const ProtectedRoute = () => {
  const isAuth = !!getStoredRefreshToken(); // Kiểm tra xem đã đăng nhập chưa

  // Nếu chưa đăng nhập, đá về trang login gốc
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;