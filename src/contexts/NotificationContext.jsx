import React, { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "../components/ui/Notification/Toast";
import ConfirmModal from "../components/ui/Notification/ConfirmModal";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { message, title, resolve }

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);


  const toast = {
    success: useCallback((msg, duration) => showToast(msg, "success", duration), [showToast]),
    error: useCallback((msg, duration) => showToast(msg, "error", duration), [showToast]),
    warning: useCallback((msg, duration) => showToast(msg, "warning", duration), [showToast]),
    info: useCallback((msg, duration) => showToast(msg, "info", duration), [showToast]),
  };

  const confirm = useCallback((message, title = "Xác nhận hành động") => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        title,
        resolve: (value) => {
          setConfirmState(null);
          resolve(value);
        },
      });
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, toast, confirm }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {confirmState && (
        <ConfirmModal
          isOpen={true}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={() => confirmState.resolve(true)}
          onCancel={() => confirmState.resolve(false)}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
