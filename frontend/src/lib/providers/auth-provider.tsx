import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
});

export const useAuthToken = () => useContext(AuthContext).token;
export const useSetAuthToken = () => useContext(AuthContext).setToken;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState(() => Cookies.get("accessToken") ?? null);

  useEffect(() => {
    let cookieToken = Cookies.get("accessToken");
    if (!cookieToken) {
      cookieToken = "guest"; // Default value if no cookie
      Cookies.set("accessToken", cookieToken);
    }
    setToken(cookieToken);
  }, []);

  useEffect(() => {
    const interceptorId = axios.interceptors.request.use((config) => {
      if (token && config.headers && typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      return config;
    });
    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
