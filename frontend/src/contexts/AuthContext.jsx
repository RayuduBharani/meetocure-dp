import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../lib/socket";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");

    if (token && savedUser && userId) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);

      // Connect socket if not already connected
      if (!socket.connected) {
        socket.connect();
      }

      // Join user's room
      socket.emit("join", userId);
    }

    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userId", userData._id);

    setUser(userData);
    setIsAuthenticated(true);

    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    // Join user's room
    socket.emit("join", userData._id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");

    setUser(null);
    setIsAuthenticated(false);

    // Disconnect socket
    if (socket.connected) {
      socket.disconnect();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
