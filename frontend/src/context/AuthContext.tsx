"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthResponse } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthOrg {
  id: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  organisation: AuthOrg | null;
  token: string | null;
  isLoading: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organisation, setOrganisation] = useState<AuthOrg | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sf_token");
    const storedUser = localStorage.getItem("sf_user");
    const storedOrg = localStorage.getItem("sf_org");
    if (stored && storedUser && storedOrg) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
      setOrganisation(JSON.parse(storedOrg));
    }
    setIsLoading(false);
  }, []);

  const login = (response: AuthResponse) => {
    localStorage.setItem("sf_token", response.token);
    localStorage.setItem("sf_user", JSON.stringify(response.user));
    localStorage.setItem("sf_org", JSON.stringify(response.organisation));
    setToken(response.token);
    setUser(response.user);
    setOrganisation(response.organisation);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("sf_token");
    localStorage.removeItem("sf_user");
    localStorage.removeItem("sf_org");
    setToken(null);
    setUser(null);
    setOrganisation(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, organisation, token, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
