
import React, { createContext, useContext, useState } from "react";

// Create authentication context
const AuthContext = createContext(null);

// Provide authentication details to the application
export const AuthProvider = ({ children }) => {

    // Retrieve previously saved token, if available
    const [token, setToken] = useState(
        localStorage.getItem("accessToken")
    );

    // Save token after successful login
    const login = (accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        setToken(accessToken);
    };

    // Remove token during logout
    const logout = () => {
        localStorage.removeItem("accessToken");
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access authentication details
export const useAuth = () => {
    return useContext(AuthContext);
};
