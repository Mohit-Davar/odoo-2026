"use client";
import "./globals.css";
import "./font.css";
import { useEffect } from "react";
import { useAuthStore } from "../../store/authstore";
import { Toaster } from "../components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession(); // restores user session on app load
  }, []);

  return (
    <html lang="en">
      <body className="product">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
