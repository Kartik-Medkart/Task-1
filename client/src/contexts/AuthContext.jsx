import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData); // userData includes role (e.g., "customer" or "admin")
  const logout = () => setUser(null);

  const isAuthenticated = !!user;
  const role = user?.role;

  console.log("user", user);
  console.log("isAuthenticated", isAuthenticated);
  console.log("role", role);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);