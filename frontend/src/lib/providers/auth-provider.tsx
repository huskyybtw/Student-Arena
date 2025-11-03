"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuthControllerMe } from "../api/auth/auth";
import { AuthUserResponseDto } from "../api/model/authUserResponseDto";

interface AuthContextType {
  user: AuthUserResponseDto | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return Cookies.get("accessToken") || null;
    }
    return null;
  });

  const setToken = (newToken: string | null) => {
    if (newToken) {
      Cookies.set("accessToken", newToken, { expires: 7 });
    } else {
      Cookies.remove("accessToken");
    }
    setTokenState(newToken);
  };
  
  useEffect(() => {
    const interceptorId = axios.interceptors.request.use((config) => {
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });
    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, [token]);

  const { data, isFetching, isError, error, refetch } = useAuthControllerMe({
    query: {
      enabled: !!token,
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  });

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  useEffect(() => {
    if (!isFetching && (!data || !data.data?.id)) {
      router.replace("/");
    }
  }, [isFetching, data, router]);

  return (
    <AuthContext.Provider
      value={{
        user: data?.data ?? null,
        isLoading: isFetching || (!!token && !data),
        error: isError ? error?.message ?? "Authentication error" : null,
        token,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within an AuthProvider");
  }
  const { user, isLoading, error } = context;
  return {
    user,
    isLoading,
    isError: !!error,
    error,
  };
};

export const useAuthToken = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthToken must be used within an AuthProvider");
  }
  return context.token;
};

export const useSetAuthToken = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSetAuthToken must be used within an AuthProvider");
  }
  return context.setToken;
};
