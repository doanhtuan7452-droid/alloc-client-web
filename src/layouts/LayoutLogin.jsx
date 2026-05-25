import React from 'react';
import { Outlet } from 'react-router-dom';

const LayoutLogin = () => {
    return (
        <div className="relative min-h-screen w-full flex justify-center items-center bg-[#191a1f] font-sans overflow-hidden">

            {/* Đốm sáng hiệu ứng phía trên bên trái (Lấy cảm hứng từ phong cách Stitch) */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

            {/* Đốm sáng hiệu ứng phía dưới bên phải */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

            {/* Nội dung form đăng nhập xếp phía trên các đốm sáng */}
            <div className="relative z-10 w-full flex justify-center items-center">
                <Outlet />
            </div>
        </div>
    );
};

export default LayoutLogin;