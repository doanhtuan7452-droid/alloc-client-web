import { useState } from 'react';
import { Camera, Save, Lock, User, Clock, Phone, MapPin } from 'lucide-react';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguoidung@gmail.com",
    phoneNumber: "0912 345 678",
    location: "Hà Nội, Việt Nam",
    timezone: "UTC+7 (SE Asia Standard Time)"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    console.log("Mock Save Profile", profileData);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    console.log("Mock Update Password", passwordData);
  };

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar">
      <div className="max-w-4xl mx-auto pb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-content-primary">Thông Tin Cá Nhân</h1>
            <p className="text-content-muted text-sm">
              Quản lý hồ sơ, địa chỉ liên hệ và cài đặt bảo mật của bạn.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Cột trái: Avatar & Tóm tắt */}
          <div className="col-span-1 flex flex-col gap-6">
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col items-center">
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-inset overflow-hidden border-4 border-border-default transition-all group-hover:border-blue-500/50">
                  <img
                    src="https://ui-avatars.com/api/?name=NV"
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-content-primary">{profileData.fullName}</h3>
              <p className="text-xs text-content-muted mb-4">{profileData.email}</p>
              
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm text-content-secondary bg-surface/50 p-2.5 rounded-lg border border-border-default">
                  <User className="w-4 h-4 text-blue-400" /> Vai trò: Owner
                </div>
                <div className="flex items-center gap-3 text-sm text-content-secondary bg-surface/50 p-2.5 rounded-lg border border-border-default">
                  <Clock className="w-4 h-4 text-emerald-400" /> Hoạt động: Tháng 6, 2026
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Form thông tin & Bảo mật */}
          <div className="col-span-2 flex flex-col gap-8">
            
            {/* Form Hồ Sơ */}
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-content-primary mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" /> Hồ sơ năng lực
              </h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-content-muted mb-2">Họ và tên</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      className="w-full bg-inset border border-border-default rounded-md px-4 py-2.5 text-sm text-content-primary focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-content-muted mb-2">Danh xưng (Email)</label>
                    <input 
                      type="email" 
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full bg-inset/50 border border-border-default rounded-md px-4 py-2.5 text-sm text-content-muted cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-content-muted mb-2">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                      <input 
                        type="text" 
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleProfileChange}
                        className="w-full bg-inset border border-border-default rounded-md pl-9 pr-4 py-2.5 text-sm text-content-primary focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-content-muted mb-2">Vị trí</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                      <input 
                        type="text" 
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                        className="w-full bg-inset border border-border-default rounded-md pl-9 pr-4 py-2.5 text-sm text-content-primary focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-content-muted mb-2">Múi giờ làm việc</label>
                  <input 
                    type="text" 
                    name="timezone"
                    value={profileData.timezone}
                    onChange={handleProfileChange}
                    className="w-full bg-inset border border-border-default rounded-md px-4 py-2.5 text-sm text-content-primary focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <button type="submit" className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium">
                    <Save className="w-4 h-4" /> Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>

            {/* Form Mật khẩu */}
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-content-primary mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" /> Thay đổi mật khẩu
              </h3>
              
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-content-muted mb-2">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-inset border border-border-default rounded-md px-4 py-2.5 text-sm text-content-primary focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-content-muted mb-2">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-inset border border-border-default rounded-md px-4 py-2.5 text-sm text-content-primary focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-content-muted mb-2">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-inset border border-border-default rounded-md px-4 py-2.5 text-sm text-content-primary focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button type="submit" className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 px-5 py-2.5 rounded-lg hover:bg-purple-600/30 transition-colors text-sm font-medium">
                    <Lock className="w-4 h-4" /> Cập Nhật Mật Khẩu
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
