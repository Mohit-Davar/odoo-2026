"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore, waitForSession } from "../../../store/authstore";
import { WaveLoader } from "@/components/ui/wave-loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchDashboardData, isLoading } = useAppStore();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useRef(false);

  useEffect(() => {
    // Wait for session to be restored before fetching dashboard data
    const init = async () => {
      if (initialized.current) return;
      
      // Wait for session restoration to complete first
      const sessionPromise = waitForSession();
      if (sessionPromise) {
        await sessionPromise;
      }
      
      initialized.current = true;
      fetchDashboardData();
    };
    
    init();
  }, [fetchDashboardData]);

  return (
    <div className="flex min-h-screen bg-[#f7f6f2] p-2">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto relative">
          {(isLoading || loading) ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f7f6f2]/80 backdrop-blur-sm z-50">
              <WaveLoader message="Connecting to fleet..." bars={7} />
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
