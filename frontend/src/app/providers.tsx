"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/lib/providers/auth-provider"; // <-- import your AuthProvider

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthProvider>
  );
}