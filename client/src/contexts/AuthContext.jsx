import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUserAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  const setLocalUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await logoutUserAPI();
    } catch (error) {
      console.error("Error logging out: ", error);
    }
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/");
  };

  const isAuthenticated = !!user;
  const role = user?.role;

  console.log("user", user);
  console.log("isAuthenticated", isAuthenticated);
  console.log("role", role);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, role, setLocalUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
