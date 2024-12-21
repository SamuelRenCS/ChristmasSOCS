// Contributors: Samuel Ren

import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Create a context to store the user authentication state
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage on first render
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // return user if token is valid
        return decoded.exp * 1000 > Date.now() ? decoded : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize authentication state based on token validity
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
      } catch (error) {
        return false;
      }
    }
    return false;
  });

  // Check if the token is still valid on every render
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // No token exists
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
        setIsAuthenticated(true);
      } else {
        // Token expired
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Invalid token
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Login function to set the user and token in localStorage
  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      setIsAuthenticated(true);

      // store the token in localStorage
      localStorage.setItem("token", token);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Logout function to remove the user and token from localStorage
  const logout = () => {
    localStorage.removeItem("token");

    // Use functional update to ensure state change
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
