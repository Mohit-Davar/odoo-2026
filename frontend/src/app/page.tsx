"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authstore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ImageMouseTrail3 from "@/components/ui/image-mousetrail-without-component";
import Preloader from "@/components/Preloader";
import Reveal from "@/components/ui/reveal";
import DerckxSteps from "@/components/ui/derckx-steps";
import DerckxProjects from "@/components/ui/derckx-projects";
import DerckxRules from "@/components/ui/derckx-rules";
import DerckxFoundation from "@/components/ui/derckx-foundation";
import DerckxCTA from "@/components/ui/derckx-cta";
import { HeroSection } from "@/components/ui/hero-section-5";
import {
  Truck,
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Activity,
  Layers,
  TrendingUp,
  Compass,
  ChevronDown,
} from "lucide-react";

const INK = "#ffffff";
const CLAY = "#10b981";
const STONE = "#000000";
const STONE_GRAY = "#a1a1aa";

const modules = [
  {
    title: "Fleet Registry & Lifecycle",
    desc: "Register assets, monitor current status (Available, On Trip, In Shop, Retired), and enforce maintenance locks to prevent operational downtime.",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Smart Dispatch Engine",
    desc: "Coordinate trips, assign drivers, and check cargo weights against maximum load capacity before a trip is ever confirmed.",
    img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Operational Cost Analytics",
    desc: "Log fuel, tolls and maintenance bills to measure ROI and fuel efficiency, then export compliance reports in a click.",
    img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Compliance & Safety",
    desc: "License-expiry checks, cargo weight limits and scheduling conflicts are enforced automatically on every dispatch.",
    img: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800",
  },
];




const stats = [
  { value: "4", label: "Core Modules" },
  { value: "4", label: "Vehicle States Tracked" },
  { value: "100%", label: "Digital Records" },
  { value: "Real-Time", label: "Dispatch Sync" },
];

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoaded]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <Preloader key="loader" onComplete={() => setIsLoaded(true)} />
        )}
      </AnimatePresence>

      <div className={`min-h-screen text-[${INK}] font-sans ${isLoaded ? "opacity-100 transition-opacity duration-700" : "opacity-0"}`} style={{ backgroundColor: STONE }}>

        {/* Hero section with dynamic video backdrop and logo slider */}
        <HeroSection />

        {/* Derckx steps section */}
        <DerckxSteps />

        {/* Process steps */}

        {/* Interactive preview (mouse trail card in place of modules) */}
        <section id="modules" className="py-24 px-6 lg:px-10 max-w-7xl mx-auto w-full">
          <ImageMouseTrail3 />
        </section>

        {/* Derckx projects section */}
        <DerckxProjects />

        {/* Derckx horizontal rules section */}
        <DerckxRules />


        {/* Stats strip */}
        <section className="py-16 border-y" style={{ borderColor: `${INK}1a`, backgroundColor: "#0c0c0e" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((st, i) => (
              <Reveal key={st.label} delay={i * 0.06} className="text-center md:text-left">
                <div className="text-3xl sm:text-4xl font-black radio" style={{ color: CLAY }}>{st.value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider product" style={{ color: STONE_GRAY }}>{st.label}</div>
              </Reveal>
            ))}
          </div>
        </section>



        {/* Engineering foundation */}
        {/* Derckx foundation stack section */}
        <DerckxFoundation />

        {/* Derckx call to action section */}
        <DerckxCTA />

        {/* Footer */}
        <footer className="pt-20 pb-10 px-6" style={{ backgroundColor: STONE }}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-14 border-b" style={{ borderColor: `${INK}14` }}>
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: INK }}>
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <span className="text-base font-bold radio" style={{ color: INK }}>
                  Transit<span style={{ color: CLAY }}>Ops</span>
                </span>
              </div>
              <p className="mt-4 text-sm max-w-xs leading-relaxed product" style={{ color: STONE_GRAY }}>
                A single, ruled system for vehicle registration, dispatch and cost tracking — built for the Odoo Hackathon.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: INK }}>Navigate</h5>
              <div className="flex flex-col gap-3 text-sm font-semibold product" style={{ color: STONE_GRAY }}>
                <a href="#approach" className="hover:opacity-60 transition-opacity w-fit">Approach</a>
                <a href="#modules" className="hover:opacity-60 transition-opacity w-fit">Modules</a>
                <a href="#mission" className="hover:opacity-60 transition-opacity w-fit">Mission</a>
                <a href="#strengths" className="hover:opacity-60 transition-opacity w-fit">Strengths</a>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: INK }}>Account</h5>
              <div className="flex flex-col gap-3 text-sm font-semibold product" style={{ color: STONE_GRAY }}>
                {user ? (
                  <Link href="/dashboard" className="hover:opacity-60 transition-opacity w-fit">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/login" className="hover:opacity-60 transition-opacity w-fit">Sign In</Link>
                    <Link href="/signup" className="hover:opacity-60 transition-opacity w-fit">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-8 text-xs font-semibold product" style={{ color: STONE_GRAY }}>
            © {new Date().getFullYear()} TransitOps Logistics. Built for the Odoo Hackathon. All rights reserved.
          </div>
        </footer>

      </div>
    </>
  );
}
