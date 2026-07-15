import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    await AuthService.registerLocal({
      fullName,
      email,
      password,
      confirmPassword,
    });
    
    // SỬA ĐOẠN NÀY: Thay vì vào thẳng /workspaces, hãy đá sang trang verify-otp
    // Truyền thêm state chứa email để bên trang OTP nhận được dữ liệu
    navigate("/login/verify-otp", { state: { email: email } });

  } catch (registerError) {
    setError(registerError.message || "Đăng ký thất bại.");
  } finally {
    setLoading(false);
  }
};

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl w-full max-w-[420px] text-white mx-4 transition-all duration-300 hover:border-white/20">
      {/* Nút Quay lại */}
      <button
        onClick={handleBack}
        className="flex items-center text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Quay lại màn hình chính
      </button>

      {/* Tiêu đề */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold tracking-wide mb-2">Đăng Ký</h2>
        <p className="text-gray-400 text-sm">
          Tạo tài khoản Alloc cho Workspace của bạn
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="flex flex-col gap-8">
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {/* Ô nhập Họ và Tên */}
        <div className="relative">
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-transparent focus:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-0 focus:bg-white/10 transition-all duration-300 peer"
            placeholder="Họ và tên"
            required
          />
          <label
            htmlFor="fullName"
            className="absolute transition-all duration-300 pointer-events-none -top-6 left-1 text-sm text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:left-1 peer-focus:text-sm peer-focus:text-blue-400"
          >
            Họ và tên
          </label>
        </div>

        {/* Ô nhập Email */}
        <div className="relative">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-transparent focus:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-0 focus:bg-white/10 transition-all duration-300 peer"
            placeholder="ví dụ: name@gmail.com"
            required
          />
          <label
            htmlFor="email"
            className="absolute transition-all duration-300 pointer-events-none -top-6 left-1 text-sm text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:left-1 peer-focus:text-sm peer-focus:text-blue-400"
          >
            Email
          </label>
        </div>

        {/* Ô nhập Mật khẩu */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-transparent focus:border-blue-500 focus:outline-none focus:ring-0 focus:bg-white/10 transition-all duration-300 peer"
            placeholder="Mật khẩu"
            required
          />
          <label
            htmlFor="password"
            className="absolute transition-all duration-300 pointer-events-none -top-6 left-1 text-sm text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:left-1 peer-focus:text-sm peer-focus:text-blue-400"
          >
            Mật khẩu
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Ô nhập Xác nhận mật khẩu */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-transparent focus:border-blue-500 focus:outline-none focus:ring-0 focus:bg-white/10 transition-all duration-300 peer"
            placeholder="Xác nhận mật khẩu"
            required
          />
          <label
            htmlFor="confirmPassword"
            className="absolute transition-all duration-300 pointer-events-none -top-6 left-1 text-sm text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:left-1 peer-focus:text-sm peer-focus:text-blue-400"
          >
            Xác nhận mật khẩu
          </label>
        </div>

        {/* Nút Xác nhận Đăng ký */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 px-5 text-base font-medium bg-blue-500 text-white rounded-xl transition-all duration-200 hover:bg-blue-600 shadow-lg shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        Đã có tài khoản?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
};

export default Register;
