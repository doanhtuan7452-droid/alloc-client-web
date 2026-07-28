import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { useLanguage } from "../../contexts/LanguageContext";

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await AuthService.requestOtp({ email });
      navigate("/login/verify-otp", { state: { email } });
    } catch (requestError) {
      setError(requestError.message || t("auth.forgotPassword.failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/login/email");
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl w-full max-w-[380px] text-white mx-4 transition-all duration-300 hover:border-white/20">
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
        {t("auth.login.backBtn")}
      </button>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold tracking-wide mb-2">
          {t("auth.forgotPassword.title")}
        </h2>
        <p className="text-gray-400 text-sm">
          {t("auth.forgotPassword.subTitle")}
        </p>
      </div>

      <form onSubmit={handleRequestOTP} className="flex flex-col gap-8">
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        {/* Ô nhập Email */}
        <div className="relative">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-transparent focus:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-0 focus:bg-white/10 transition-all duration-300 peer"
            placeholder={t("auth.login.emailPlaceholder")}
            required
          />
          <label
            htmlFor="email"
            className="absolute transition-all duration-300 pointer-events-none -top-6 left-1 text-sm text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:left-1 peer-focus:text-sm peer-focus:text-blue-400"
          >
            {t("auth.forgotPassword.email")}
          </label>
        </div>

        {/* Nút Xác nhận */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 px-5 text-base font-medium bg-blue-500 text-white rounded-xl transition-all duration-200 hover:bg-blue-600 shadow-lg shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? t("auth.forgotPassword.sending") : t("auth.forgotPassword.sendOTP")}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
