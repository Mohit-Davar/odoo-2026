"use client";

import React from "react";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <nav className="h-16  backdrop-blur-lg px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Left Section - Title */}
      <div>
        {/* <h1 className="text-xl font-bold text-neutral-900">Learning Tracker</h1>
        <p className="text-xs text-neutral-500">Manage your learning journey</p> */}
      </div>

      {/* Center Section - Search Bar */}
      <div>
        <div className="relative w-sm">
          <Search
            strokeWidth={4}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-900"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-10 pl-10 pr-4 border-neutral-300/40 bg-white/90 border-2 rounded-full text-sm text-neutral-900 placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/90 transition-all product"
          />
        </div>
      </div>
    </nav>
  );
}
