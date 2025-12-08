"use client";
import type React from "react";
import { Geist, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/providers/auth-provider";
import { Navigation } from "@/components/ui/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { usePathname } from "next/navigation";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGuestRoute = pathname === "/" || pathname.startsWith("/auth");

  if (isGuestRoute) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background via-30% via-background to-muted/87">
        {children}
      </div>
    </AuthProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html
      lang="pl"
      className={`${geist.variable} ${manrope.variable} antialiased dark`}
    >
      <head>
        <title>Student Arena - Platforma E-sportowa dla Studentów</title>
        <meta name="description" content="Platforma do organizacji rozgrywek League of Legends dla środowiska akademickiego" />
      </head>
      
      <body className="bg-background text-foreground">
        <QueryClientProvider client={queryClient}>
          <LayoutContent>{children}</LayoutContent>
        </QueryClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
