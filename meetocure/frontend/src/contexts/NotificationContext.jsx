import React, { createContext, useContext, useState, useCallback } from "react";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  // ✅ Success
  const success = useCallback((message, options = {}) => {
    return toast.success(message, options);
  }, []);

  // ✅ Error
  const error = useCallback((message, options = {}) => {
    return toast.error(message, options);
  }, []);

  // ✅ Warning (use custom style)
  const warning = useCallback((message, options = {}) => {
    return toast(message, {
      icon: "⚠️",
      style: { background: "#FFF8E1", color: "#7A5C00" },
      ...options,
    });
  }, []);

  // ✅ Info (use custom style)
  const info = useCallback((message, options = {}) => {
    return toast(message, {
      icon: "ℹ️",
      style: { background: "#E3F2FD", color: "#0D47A1" },
      ...options,
    });
  }, []);

  // ✅ Loading
  const loading = useCallback((key, message, options = {}) => {
    const id = toast.loading(message, options);
    setLoadingStates((prev) => ({ ...prev, [key]: id }));
    return id;
  }, []);

  // ✅ Dismiss loading by key
  const dismissLoading = useCallback((key) => {
    setLoadingStates((prev) => {
      if (prev[key]) {
        toast.dismiss(prev[key]);
        const newState = { ...prev };
        delete newState[key];
        return newState;
      }
      return prev;
    });
  }, []);

  // ✅ Dismiss all loading
  const dismissAllLoading = useCallback(() => {
    Object.values(loadingStates).forEach((id) => {
      if (id) toast.dismiss(id);
    });
    setLoadingStates({});
  }, [loadingStates]);

  // ✅ API error handler
  const handleError = useCallback((error, customMessage = null) => {
    const message = customMessage || error?.message || "Something went wrong!";
    return error(message);
  }, [error]);

  // ✅ Confirmation toast (Yes/No buttons)
  const confirm = useCallback((message, onConfirm, onCancel) => {
    const id = toast.custom((t) => (
      <div className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center gap-3 border">
        <p className="text-gray-800 font-medium">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(id);
              onConfirm?.();
            }}
            className="px-4 py-1 rounded-md bg-green-600 text-white"
          >
            Yes
          </button>
          <button
            onClick={() => {
              toast.dismiss(id);
              onCancel?.();
            }}
            className="px-4 py-1 rounded-md bg-gray-300 text-gray-800"
          >
            No
          </button>
        </div>
      </div>
    ));
    return id;
  }, []);

  // ✅ Dismiss all notifications
  const dismissAllNotifications = useCallback(() => {
    toast.dismiss();
    dismissAllLoading();
  }, [dismissAllLoading]);

  const value = {
    success,
    error,
    warning,
    info,
    loading,
    dismissLoading,
    dismissAllLoading,
    handleError,
    confirm,
    dismissAll: dismissAllNotifications,
    loadingStates,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
