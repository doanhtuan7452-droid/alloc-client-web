import { useState, useEffect } from "react";
import { Bell, Check, CheckCircle2, MessageSquare, AlertTriangle, Calendar, Clock } from "lucide-react";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../../services/mockApi";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetchNotifications(1, 50); // Get first 50
      setNotifications(res.items);
      setUnreadCount(res.unreadCount);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id) => {
    const notif = notifications.find(n => n.notificationId === id);
    if (notif && !notif.isRead) {
      try {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.notificationId === id ? {...n, isRead: true} : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "LeaveApproval": return <Calendar className="w-5 h-5 text-purple-400" />;
      case "OTRequest": return <Clock className="w-5 h-5 text-amber-400" />;
      case "TaskAssigned": return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
      case "Comment": return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case "RiskCreated": return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default: return <Bell className="w-5 h-5 text-zinc-400" />;
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar">
      <div className="max-w-4xl mx-auto pb-10">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="relative">
                <Bell className="w-8 h-8 text-blue-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-zinc-900"></span>
                )}
              </div>
              Notifications System
            </h1>
            <p className="text-content-muted text-sm">
              Trang tổng hợp mọi thông báo từ các phân hệ trong ứng dụng.
            </p>
          </div>
          
          <button 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-md hover:bg-white/[0.1] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" /> Đánh dấu đã đọc tất cả
          </button>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
          {/* Header Tab */}
          <div className="flex border-b border-white/10">
            <button className="px-6 py-3 border-b-2 border-blue-500 text-blue-400 font-medium text-sm">
              All Notifications
              {unreadCount > 0 && <span className="ml-2 bg-blue-500/20 text-blue-400 py-0.5 px-2 rounded-full text-[10px]">{unreadCount}</span>}
            </button>
            <button className="px-6 py-3 border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 font-medium text-sm transition-colors cursor-pointer">
              Unread
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="p-10 text-center text-zinc-500 text-sm">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-400">Bạn chưa có thông báo nào.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.notificationId} 
                  onClick={() => handleMarkAsRead(notif.notificationId)}
                  className={`flex gap-4 p-5 hover:bg-white/[0.02] transition-colors cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-blue-900/5'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h4 className={`text-sm ${notif.isRead ? 'text-zinc-300 font-medium' : 'text-white font-bold'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm ${notif.isRead ? 'text-zinc-500' : 'text-zinc-300'}`}>
                      {notif.content}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
