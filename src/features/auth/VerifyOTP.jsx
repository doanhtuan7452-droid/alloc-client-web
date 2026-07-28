import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { useNotification } from "../../contexts/NotificationContext";
import { useLanguage } from "../../contexts/LanguageContext";

const VerifyOTP = () => {
  const { t } = useLanguage();
  const { toast } = useNotification();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  const inputRefs = useRef([]);

  // Lấy email truyền sang hoặc dùng email mặc định
  const email = location.state?.email || "nguoidung@gmail.com";
  // Kiểm tra xem có phải đến từ trang Đăng nhập hay không
  const fromLogin = location.state?.fromLogin || false;

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(data)) return;

    const pasteData = data.split("");
    setOtp(pasteData);
    
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError(t("auth.verifyOtp.enterSixDigits"));
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await AuthService.verifyOtp({ email, code });
      navigate("/login/email");
    } catch (verifyError) {
      setError(verifyError.message || t("auth.verifyOtp.failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setError("");
    AuthService.requestOtp({ email })
      .then(() => {
        toast.success(t("auth.verifyOtp.resendSuccess"));
      })
      .catch((requestError) => {
        setError(requestError.message || t("auth.verifyOtp.resendFailed"));
      });
  };

  const handleBack = () => {
    // Nếu đi từ trang login sang thì quay lại trang login, ngược lại về trang forgot-password
    if (fromLogin) {
      navigate("/login/email");
    } else {
      navigate("/login/forgot-password");
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl w-full max-w-95 text-white mx-4 transition-all duration-300 hover:border-white/20">
      <button
        onClick={handleBack}
        className="flex items-center text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        {t("auth.login.backBtn")}
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-wide mb-2">{t("auth.verifyOtp.title")}</h2>
        <p className="text-gray-400 text-sm">
          {t("auth.verifyOtp.emailSentMsg")} <br />
          <span className="text-blue-400 font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-2 mb-2">
          {otp.map((data, index) => (
            <input
              className="w-10 h-12 text-center text-xl font-semibold bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:border-blue-500 focus:outline-none focus:ring-0 focus:bg-white/10 transition-all duration-300 mx-auto"
              type="text"
              name={"otp" + index}
              maxLength="1"
              key={index}
              value={data}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              ref={(el) => (inputRefs.current[index] = el)}
              required
            />
          ))}
        </div>

        <div className="flex justify-center -mt-2">
          <span className="text-sm text-gray-400">
            {t("auth.verifyOtp.notReceived")}{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {t("auth.verifyOtp.resendLink")}
            </button>
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 px-5 text-base font-medium bg-blue-500 text-white rounded-xl transition-all duration-200 hover:bg-blue-600 shadow-lg shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? t("auth.verifyOtp.verifying") : t("auth.verifyOtp.verifyBtn")}
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;