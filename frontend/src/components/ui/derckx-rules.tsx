"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Activity, Layers, TrendingUp, Compass } from "lucide-react";

export default function DerckxRules() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of this container over a 200vh track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Slide cards horizontally from right (40%) to left (-65%)
  const cardsX = useTransform(scrollYProgress, [0.05, 0.95], ["30%", "-65%"]);

  const strengths = [
    { 
      icon: ShieldCheck, 
      title: "Compliant Assignments", 
      desc: "Blocks assignment of drivers with expired licenses or active scheduling conflicts before dispatch.",
      isGreen: true
    },
    { 
      icon: Activity, 
      title: "Automated Transitions", 
      desc: "Dispatching a trip moves vehicle and driver state to “On Trip”; closing maintenance returns it to “Available.”",
      isGreen: false
    },
    { 
      icon: Layers, 
      title: "Safety Cargo Limiters", 
      desc: "Checks cargo loading metrics in real time and rejects dispatches that exceed a vehicle's capacity.",
      isGreen: true
    },
    { 
      icon: TrendingUp, 
      title: "Real-Time Cost Tracking", 
      desc: "Fuel, toll and maintenance logs roll into live ROI figures the moment they're entered.",
      isGreen: false
    },
    { 
      icon: Compass, 
      title: "Centralized Records", 
      desc: "One digital registry replaces scattered spreadsheets, so status is always current.",
      isGreen: true
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative h-[200vh] bg-black text-white w-full z-20 select-none"
    >
      {/* Sticky viewport content container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center bg-black">
        
        {/* Header Block at the top */}
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <h2 className="text-2xl sm:text-[2.6rem] font-black leading-[1.1] tracking-tight radio text-white max-w-2xl text-left">
            Who is smart chooses a platform that <span className="text-[#10b981] block">enforces its own rules</span>
          </h2>
          
          <div className="text-left md:text-right flex flex-col md:items-end gap-3 max-w-sm">
            <span className="text-xs font-bold text-[#10b981] tracking-widest uppercase font-mono">We operate strictly by our rules</span>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal product">
              It might sound strict, but it keeps the fleet aligned. We deliver what we guarantee. Period.
            </p>
            <a 
              href="#signup"
              className="mt-2 border border-neutral-800 hover:border-white px-5 py-2 text-[10px] font-bold text-white rounded-full tracking-widest uppercase transition-colors duration-300 w-fit inline-flex items-center gap-1.5"
            >
              <span>All Registry Rules</span>
              <ArrowUpRight className="w-3 h-3 text-[#10b981]" />
            </a>
          </div>
        </div>

        {/* Horizontal Card Slider Track */}
        <div className="w-full overflow-hidden mt-4 relative">
          <motion.div
            style={{ x: cardsX }}
            className="flex gap-8 w-max px-6 sm:px-12 lg:px-16"
          >
            {strengths.map((s, index) => (
              <div
                key={s.title}
                className={`w-[290px] sm:w-[355px] h-[260px] sm:h-[300px] p-8 sm:p-10 rounded-2xl flex flex-col justify-between border cursor-grab active:cursor-grabbing select-none ${
                  s.isGreen 
                    ? "bg-[#10b981] text-white border-transparent shadow-[0_10px_30px_rgba(16,185,129,0.15)]" 
                    : "bg-white text-black border-transparent shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center ${
                    s.isGreen ? "bg-white/20 text-white" : "bg-[#10b981]/10 text-[#10b981]"
                  }`}>
                    <s.icon className="w-5 sm:w-6 h-5 sm:h-6" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold tracking-widest ${
                    s.isGreen ? "text-white/60" : "text-neutral-400"
                  }`}>
                    RULE 0{index + 1}
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4 text-left">
                  <h3 className="text-lg sm:text-xl font-extrabold radio leading-tight">
                    {s.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed font-normal product ${
                    s.isGreen ? "text-white/80" : "text-neutral-600"
                  }`}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
