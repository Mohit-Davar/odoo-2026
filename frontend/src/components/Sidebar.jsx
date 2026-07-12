"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authstore";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import logo from "../assets/images/logo.png";
import { useRouter, usePathname } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Truck, label: "Fleet", href: "/dashboard/fleet" },
  { icon: Users, label: "Drivers", href: "/dashboard/drivers" },
  { icon: MapPin, label: "Trips", href: "/dashboard/trips" },
  { icon: Wrench, label: "Maintenance", href: "/dashboard/maintenance" },
  { icon: Fuel, label: "Fuel & Expenses", href: "/dashboard/fuel-expenses" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const { user, loading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleNavigation = (href) => {
    router.push(href);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading ...</div>;
  if (!user) return null;

  return (
    <aside className="w-64 min-w-64 max-w-64 h-[calc(100vh-1rem)] sticky top-2 bg-white/80 border-2 border-neutral-300/40 rounded-2xl flex flex-col shrink-0">
      {/* Logo Section */}
      <div className="p-6 ">
        <div
          className="flex gap-2 items-center cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <img src={logo.src} alt="Logo" className="w-6 h-6" />
          <h1 className="text-lg font-bold text-neutral-900 radio tracking-wider">
            TransitOps
          </h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <motion.button
              key={item.label}
              onClick={() => handleNavigation(item.href)}
              animate={{
                backgroundColor: isActive ? "#f7f6f2" : "transparent",
              }}
              whileHover={{
                x: 4,
                backgroundColor: "#f7f6f2",
                transition: { duration: 0.2, ease: "easeInOut" },
              }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 geist-mono font-bold rounded-full text-sm tracking-tighter 
                ${
                  isActive
                    ? "bg-[#f7f6f2] text-neutral-800"
                    : "text-neutral-800"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-neutral-200/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-black/80 text-white/80 rounded-full flex items-center justify-center text-xs font-bold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900">{user.name}</p>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>

        <motion.button
          onClick={handleLogout}
          whileHover={{
            x: 4,
            backgroundColor: "#fef2f2",
            transition: { duration: 0.2, ease: "easeInOut" },
          }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-2 px-4 py-2 geist-mono font-bold rounded-full text-sm tracking-tighter text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-left">Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}
