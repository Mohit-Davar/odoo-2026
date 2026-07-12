"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#f7f6f2] p-2">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Dashboard Content */}
        <main className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 product">
              Dashboard
            </h1>
            <p className="text-neutral-600 product">
              Welcome to your dashboard! Customize it for your hackathon.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
