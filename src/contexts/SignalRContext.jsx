import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { HubConnectionBuilder, HttpTransportType, HubConnectionState } from "@microsoft/signalr";
import { useUser } from "./UserContext";
import { useNotification } from "./NotificationContext";
import { getStoredAccessToken } from "../utils/authTokens";
import AuthService from "../services/AuthService";

const SignalRContext = createContext(null);

const IDLE_TIMEOUT = 20 * 60 * 1000; // 20 minutes (matches server AccessTokenExpirationMinutes)

// Hàm giải mã JWT kiểm tra hết hạn
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const { exp } = JSON.parse(jsonPayload);
    // Cho hết hạn sớm hơn 30 giây để tránh lỗi cận biên
    return Date.now() >= exp * 1000 - 30000;
  } catch (e) {
    return true;
  }
}

export const SignalRProvider = ({ children }) => {
  const { currentUser, loading } = useUser();
  const { toast } = useNotification();
  
  const [notificationConnection, setNotificationConnection] = useState(null);
  const [conversationConnection, setConversationConnection] = useState(null);
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);
  const [isConversationConnected, setIsConversationConnected] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  const notificationConnRef = useRef(null);
  const conversationConnRef = useRef(null);
  const idleTimerRef = useRef(null);

  // Đọc backend API base URL từ env và phân tách origin sạch
  const backendUrl = (() => {
    const rawUrl = import.meta.env.VITE_API_BASE_URL || "https://localhost:7198";
    try {
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        return new URL(rawUrl).origin;
      }
      return rawUrl;
    } catch (e) {
      return rawUrl;
    }
  })();
  
  // Hàm làm mới token nếu đã hết hạn
  const ensureValidToken = async () => {
    const token = getStoredAccessToken();
    if (isTokenExpired(token)) {
      console.log("[SignalR] Token has expired or is about to expire, refreshing...");
      try {
        await AuthService.refreshToken();
        console.log("[SignalR] Token refreshed successfully.");
      } catch (err) {
        console.error("[SignalR] Error refreshing token for SignalR:", err);
      }
    }
  };

  // Hàm khởi động một connection
  const startConnection = async (conn, name, setIsConnected) => {
    if (!conn) return;
    if (conn.state === HubConnectionState.Disconnected) {
      try {
        await ensureValidToken();
        await conn.start();
        setIsConnected?.(true);
        console.log(`[SignalR] Connected to ${name} Hub.`);
      } catch (err) {
        console.error(`[SignalR] Error starting ${name} connection:`, err);
        setIsConnected?.(false);
      }
    } else if (conn.state === HubConnectionState.Connected) {
      setIsConnected?.(true);
    }
  };

  // Hàm dừng một connection
  const stopConnection = async (conn, name, setIsConnected) => {
    if (!conn) return;
    if (conn.state !== HubConnectionState.Disconnected) {
      try {
        await conn.stop();
        setIsConnected?.(false);
        console.log(`[SignalR] Stopped connection for ${name} Hub.`);
      } catch (err) {
        console.error(`[SignalR] Error stopping ${name} connection:`, err);
      }
    }
  };

  // Hàm thiết lập lại timer khi người dùng có tương tác
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    idleTimerRef.current = setTimeout(() => {
      console.log("[SignalR] User is idle. Going to disconnect SignalR hubs.");
      setIsIdle(true);
    }, IDLE_TIMEOUT);
  }, []);

  // Đăng ký/Hủy các listeners của user activity
  useEffect(() => {
    if (!currentUser || loading) return;

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    const handleActivity = () => {
      // Nếu trước đó đang idle và có thao tác lại
      if (isIdle) {
        console.log("[SignalR] User active back. Checking token & reconnecting hubs...");
        setIsIdle(false);
      }
      resetIdleTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetIdleTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [currentUser?.accountId, loading, isIdle, resetIdleTimer]);

  // Xử lý việc ngắt/nối lại SignalR khi trạng thái idle thay đổi
  useEffect(() => {
    if (!currentUser || loading) return;

    const manageConnections = async () => {
      if (isIdle) {
        // Ngắt kết nối khi idle
        await stopConnection(notificationConnRef.current, "Notification", setIsNotificationConnected);
        await stopConnection(conversationConnRef.current, "Conversation", setIsConversationConnected);
      } else {
        // Kết nối lại khi hoạt động trở lại
        await startConnection(notificationConnRef.current, "Notification", setIsNotificationConnected);
        await startConnection(conversationConnRef.current, "Conversation", setIsConversationConnected);
      }
    };

    manageConnections();
  }, [isIdle, currentUser?.accountId, loading]);

  // Quản lý khởi tạo kết nối socket chính dựa trên trạng thái auth
  useEffect(() => {
    if (loading) return;

    let activeNotifConn = null;
    let activeChatConn = null;

    if (currentUser) {
      console.log("[SignalR] User logged in. Building connection objects...");
      
      // 1. Notification Hub Connection
      const notifConn = new HubConnectionBuilder()
        .withUrl(`${backendUrl}/hubs/notifications`, {
          accessTokenFactory: () => getStoredAccessToken(),
          skipNegotiation: false,
          transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < 3) return 2000;
            if (retryContext.previousRetryCount < 10) return 5000;
            return null; // Dừng reconnect sau 10 lần thử
          },
        })
        .build();

      // Đăng ký các sự kiện trạng thái của notifConn
      notifConn.onclose(() => setIsNotificationConnected(false));
      notifConn.onreconnecting(() => setIsNotificationConnected(false));
      notifConn.onreconnected(() => setIsNotificationConnected(true));

      // Sự kiện đẩy thông báo realtime
      notifConn.on("ReceiveNotification", (notification) => {
        console.log("[SignalR] ReceiveNotification event received:", notification);
        
        // Phát custom event toàn cục để Topbar và NotificationsPopup cùng đồng bộ
        window.dispatchEvent(
          new CustomEvent("new-notification", { detail: notification })
        );

        // Hiển thị toast thông báo
        toast.info(notification.message || notification.content || "Có thông báo mới.");
      });

      // Sự kiện thay đổi quyền hạn
      notifConn.on("PermissionsChanged", (payload) => {
        console.log("[SignalR] PermissionsChanged event received:", payload);
        window.dispatchEvent(
          new CustomEvent("permissions-changed", { detail: payload })
        );
      });

      // 2. Conversation Hub Connection
      const chatConn = new HubConnectionBuilder()
        .withUrl(`${backendUrl}/hubs/conversation`, {
          accessTokenFactory: () => getStoredAccessToken(),
          skipNegotiation: false,
          transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < 3) return 2000;
            if (retryContext.previousRetryCount < 10) return 5000;
            return null;
          },
        })
        .build();

      // Đăng ký các sự kiện trạng thái của chatConn
      chatConn.onclose(() => setIsConversationConnected(false));
      chatConn.onreconnecting(() => setIsConversationConnected(false));
      chatConn.onreconnected(() => setIsConversationConnected(true));

      activeNotifConn = notifConn;
      activeChatConn = chatConn;

      notificationConnRef.current = notifConn;
      conversationConnRef.current = chatConn;

      setNotificationConnection(notifConn);
      setConversationConnection(chatConn);

      // Bắt đầu kết nối nếu chưa ở trạng thái idle
      if (!isIdle) {
        startConnection(notifConn, "Notification", setIsNotificationConnected);
        startConnection(chatConn, "Conversation", setIsConversationConnected);
      }
    } else {
      console.log("[SignalR] User logged out or unauthenticated. Cleared and stopped connections.");
      
      const clearConns = async () => {
        const currentNotif = notificationConnRef.current;
        const currentChat = conversationConnRef.current;

        await stopConnection(currentNotif, "Notification", setIsNotificationConnected);
        await stopConnection(currentChat, "Conversation", setIsConversationConnected);
        
        if (currentNotif) {
          currentNotif.off("ReceiveNotification");
          currentNotif.off("PermissionsChanged");
        }
        
        notificationConnRef.current = null;
        conversationConnRef.current = null;
        setNotificationConnection(null);
        setConversationConnection(null);
        setIsNotificationConnected(false);
        setIsConversationConnected(false);
      };
      
      clearConns();
    }

    return () => {
      const cleanup = async () => {
        if (activeNotifConn) {
          await stopConnection(activeNotifConn, "Notification", setIsNotificationConnected);
          activeNotifConn.off("ReceiveNotification");
          activeNotifConn.off("PermissionsChanged");
        }
        if (activeChatConn) {
          await stopConnection(activeChatConn, "Conversation", setIsConversationConnected);
        }

        if (notificationConnRef.current === activeNotifConn) {
          notificationConnRef.current = null;
          setNotificationConnection(null);
          setIsNotificationConnected(false);
        }
        if (conversationConnRef.current === activeChatConn) {
          conversationConnRef.current = null;
          setConversationConnection(null);
          setIsConversationConnected(false);
        }
      };
      cleanup();
    };
  }, [currentUser?.accountId, loading]);

  return (
    <SignalRContext.Provider value={{ 
      notificationConnection, 
      conversationConnection, 
      isNotificationConnected,
      isConversationConnected,
      isIdle 
    }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
};
