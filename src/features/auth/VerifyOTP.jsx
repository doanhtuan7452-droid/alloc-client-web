import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const navigate = useNavigate();
    const location = useLocation();
    const inputRefs = useRef([]);

    const email = location.state?.email || "nguoidung@gmail.com";

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Tự động focus sang ô tiếp theo
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && inputRefs.current[index - 1]) {
            // Khi nhấn Backspace ở ô rỗng thì lùi lại ô trước
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = (e) => {
        e.preventDefault();
        const code = otp.join("");
        console.log("Xác thực OTP với code:", code);
        // Sau khi xác thực mock bằng code thành công
        navigate('/login-test/email');
    };

    const handleResend = () => {
        console.log("Mock gửi lại mã OTP");
    };

    const handleBack = () => {
        navigate('/login-test/forgot-password');
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl w-full max-w-[380px] text-white mx-4 transition-all duration-300 hover:border-white/20">

            <button
                onClick={handleBack}
                className="flex items-center text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
            </button>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold tracking-wide mb-2">Nhập mã OTP</h2>
                <p className="text-gray-400 text-sm">
                    Mã 6 số đã được gửi tới email <br />
                    <span className="text-blue-400 font-medium">{email}</span>
                </p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-6">
                
                {/* 6 ô nhập OTP */}
                <div className="flex justify-between gap-2 mb-2">
                    {otp.map((data, index) => {
                        return (
                            <input
                                className="w-10 h-12 text-center text-xl font-semibold bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:border-blue-500 focus:outline-none focus:ring-0 focus:bg-white/10 transition-all duration-300 mx-auto"
                                type="text"
                                name={"otp" + index}
                                maxLength="1"
                                key={index}
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onFocus={e => e.target.select()}
                                onKeyDown={e => handleKeyDown(e, index)}
                                ref={(ref) => inputRefs.current[index] = ref}
                                required
                            />
                        );
                    })}
                </div>

                <div className="flex justify-center mt-[-8px]">
                    <span className="text-sm text-gray-400">
                        Chưa nhận được mã?{' '}
                        <button type="button" onClick={handleResend} className="text-blue-400 hover:text-blue-300 transition-colors">
                            Gửi lại
                        </button>
                    </span>
                </div>

                <button
                    type="submit"
                    className="mt-2 w-full py-3 px-5 text-base font-medium bg-blue-500 text-white rounded-xl transition-all duration-200 hover:bg-blue-600 shadow-lg shadow-blue-500/30 active:scale-[0.98]"
                >
                    Xác Thực
                </button>
            </form>
        </div>
    );
};

export default VerifyOTP;
