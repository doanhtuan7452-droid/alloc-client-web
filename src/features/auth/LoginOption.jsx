import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import AuthService from '../../services/AuthService';
import { saveAuthTokens } from '../../utils/authTokens'; 
import { useUser } from '../../contexts/UserContext';

const LoginOption = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { fetchCurrentUser } = useUser(); // 🌟 Lấy hàm fetchCurrentUser

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError("");
        try {
            const idToken = credentialResponse.credential; 
            const response = await AuthService.registerGoogle({ idToken });
            
            const tokenData = response?.data ? response.data : response;
            saveAuthTokens(tokenData);
            
            await fetchCurrentUser();

            navigate('/workspaces', { replace: true });
        } catch (err) {
            setError(err.message || "Đăng nhập bằng Google thất bại.");
        } finally {
            setLoading(false);
        }
    };

    const handleGmailLogin = () => {
        navigate('/login/email');
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl w-full max-w-[380px] text-center text-white mx-4">
            <h2 className="text-2xl font-semibold tracking-wide mb-2">Đăng Nhập</h2>
            <p className="text-gray-400 text-sm mb-8">Vui lòng chọn phương thức kết nối</p>

            {error && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 text-left">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-4 items-center">
                <div className="w-full json-google-btn-wrapper">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Đăng nhập Google thất bại.")}
                        theme="filled_blue"
                        shape="circle"
                        width="290px"
                        locale="vi"
                        text="signin_with"
                    />
                </div>

                <button
                    className="w-full flex items-center justify-center py-3 px-5 text-base font-medium bg-[#ea4335]/90 text-white rounded-xl transition-all duration-200 hover:bg-[#ea4335] shadow-lg active:scale-[0.98]"
                    onClick={handleGmailLogin}
                    disabled={loading}
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="white" fillOpacity="0.2" />
                        <path d="M22 6V18C22 19.1 21.1 20 20 20H18V8.5L12 13L6 8.5V20H4C2.9 20 2 19.1 2 18V6C2 5.45 2.22 4.95 2.59 4.59L12 11.5L21.41 4.59C21.78 4.95 22 5.45 22 6Z" fill="currentColor" />
                    </svg>
                    Tiếp tục với Gmail
                </button>
            </div>

            <div className="mt-4 text-sm text-gray-400">
                Chưa có tài khoản?{" "}
                <button onClick={() => navigate('/register')} className="text-blue-400 hover:underline">
                    Đăng ký ngay
                </button>
            </div>
        </div>
    );
};

export default LoginOption;