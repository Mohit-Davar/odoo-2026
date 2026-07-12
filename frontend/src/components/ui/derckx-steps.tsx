"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function DerckxSteps() {
  const [activeStep, setActiveStep] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the 300vh scroll container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress to steps:
  // 0% - 25%   -> Step 1
  // 25% - 50%  -> Step 2
  // 50% - 75%  -> Step 3
  // 75% - 100% -> Step 4
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.25) {
      setActiveStep(1);
    } else if (latest < 0.5) {
      setActiveStep(2);
    } else if (latest < 0.75) {
      setActiveStep(3);
    } else {
      setActiveStep(4);
    }
  });

  const steps = [
    {
      id: 1,
      title: "Step 1",
      content:
        "Are you looking to optimize your fleet operations but don't know where to start? We guide you through the entire onboarding process. After a short consultation, we prepare a custom setup and registry configuration for your fleet, completely free of charge, with detailed and transparent pricing. Get a complete picture without any upfront commitment.",
    },
    {
      id: 2,
      title: "Step 2",
      content:
        "Based on your fleet's requirements, we build a detailed implementation plan. TransitOps specialists guide you step-by-step. We evaluate vehicle classification, driver assignment rules, automated state transitions, and integration with Odoo. We ensure all pricing is transparent and highlight potential cost-saving opportunities.",
    },
    {
      id: 3,
      title: "Step 3",
      content:
        "Once the configuration matches your operational needs, we prepare all digital registries, data schemas, compliance checks, and driver profiles. TransitOps specialists handle the complex setup behind regulatory driver licensing checks and cargo limits, making the transition completely worry-free.",
    },
    {
      id: 4,
      title: "Step 4",
      content:
        "After our systems engineers verify the API connections and configurations, we launch your live registry console. A dedicated onboarding team oversees the initial dispatches and live tracking sync, ensuring an efficient rollout with zero operational downtime.",
    },
  ];

  // Manual tab click handler (scrolls container to target step offset)
  const handleTabClick = (stepId: number) => {
    if (!containerRef.current) return;
    const scrollRange = containerRef.current.scrollHeight - window.innerHeight;
    const targetOffset = (stepId - 1) * 0.28 * scrollRange;
    const containerTop = containerRef.current.offsetTop;
    
    window.scrollTo({
      top: containerTop + targetOffset,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[250vh] bg-black text-white w-full z-20"
    >
      {/* Sticky container that keeps layout locked in viewport during scroll */}
      <section className="sticky top-0 h-screen w-full flex items-center overflow-hidden py-20 px-6 sm:px-12 lg:px-16 select-none">
        
        {/* Decorative Pixel Grid Matrix (Bottom Right, matching screenshot) */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] pointer-events-none opacity-40 z-0 overflow-hidden">
          <div className="grid gap-2 w-full h-full p-6" style={{ gridTemplateColumns: "repeat(16, 1fr)" }}>
            {Array.from({ length: 96 }).map((_, i) => {
              const isBright = (i * 7 + 13) % 9 === 0;
              const isMedium = (i * 3 + 7) % 5 === 0;
              return (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-sm transition-all duration-1000 ${
                    isBright
                      ? "bg-[#10b981] opacity-60 shadow-[0_0_8px_#10b981]"
                      : isMedium
                      ? "bg-[#10b981]/30 opacity-30"
                      : "bg-[#10b981]/5 opacity-10"
                  }`}
                  style={{
                    animation: isBright ? "pulse 3s infinite ease-in-out" : "none",
                    animationDelay: `${(i % 5) * 0.4}s`,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Side: Interlocking 3D Isometric Crosses (animated on activeStep) */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="relative w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] flex items-center justify-center">
              
              {/* Ambient Shadow glow */}
              <div className="absolute w-[200px] h-[200px] bg-[#10b981]/5 blur-[80px] rounded-full" />

              <svg
                viewBox="0 0 40 40"
                className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Path 2: Top Cross (Active on Step 1) */}
                <motion.path
                  d="M22.2222 0L17.7778 4.44445V8.88889H13.3333V13.3333H17.7778V17.7778L22.2222 17.7778L22.2222 13.3333H26.6667L31.1111 8.88889H22.2222V0Z"
                  animate={{
                    fill: activeStep === 1 ? "#10b981" : "#555555",
                    opacity: activeStep === 1 ? 1 : 0.4,
                    scale: activeStep === 1 ? 1.03 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: "22.22px 8.88px" }}
                />

                {/* Path 3: Left Cross (Active on Step 3) */}
                <motion.path
                  d="M8.88889 13.3333V17.7778H4.44444L0 22.2222H8.88889L8.88885 31.1111L13.3333 26.6667L13.3333 22.2222L17.7777 22.2222L22.2222 17.7778L13.3333 17.7778V13.3333V8.88889L8.88889 13.3333Z"
                  animate={{
                    fill: activeStep === 3 ? "#10b981" : "#888888",
                    opacity: activeStep === 3 ? 1 : 0.4,
                    scale: activeStep === 3 ? 1.03 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: "8.88px 22.22px" }}
                />

                {/* Path 4: Right Cross (Active on Step 2) */}
                <motion.path
                  d="M31.1111 17.7778L31.1111 8.88889L26.6667 13.3333L26.6666 17.7778L22.2222 17.7778V22.2222L26.6666 22.2222L26.6666 26.6667H31.1111L31.1111 22.2222H35.5555L40 17.7778H31.1111Z"
                  animate={{
                    fill: activeStep === 2 ? "#10b981" : "#aaaaaa",
                    opacity: activeStep === 2 ? 1 : 0.4,
                    scale: activeStep === 2 ? 1.03 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: "31.11px 17.77px" }}
                />

                {/* Path 1: Bottom Cross (Active on Step 4) */}
                <motion.path
                  d="M26.6666 26.6667H22.2222V22.2222V17.7778L17.7777 22.2222V26.6667H13.3333L8.88885 31.1111H17.7777V40L22.2222 35.5556V31.1111H26.6666L31.1111 26.6667H26.6666Z"
                  animate={{
                    fill: activeStep === 4 ? "#10b981" : "#333333",
                    opacity: activeStep === 4 ? 1 : 0.4,
                    scale: activeStep === 4 ? 1.03 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: "22.22px 31.11px" }}
                />
              </svg>
            </div>
          </div>

          {/* Right Side: Step Title, Navigation tabs, Text block */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-8 lg:pl-6 text-left">
            
            {/* Main Title Header */}
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight radio">
                Who is smart knows where <span className="font-bold block text-[#10b981]">to start</span>
              </h2>
            </div>

            {/* Stappen Tabs Bar */}
            <div className="relative flex border-b border-neutral-800 w-full">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleTabClick(step.id)}
                  className={`w-1/4 pb-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 relative text-left cursor-pointer ${
                    activeStep === step.id ? "text-white" : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {step.title}
                  {activeStep === step.id && (
                    <motion.span
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-[#10b981]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Description Content */}
            <div className="min-h-[140px] relative">
              <AnimatePresence mode="wait">
                {steps.map(
                  (step) =>
                    activeStep === step.id && (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="text-neutral-400 text-sm sm:text-base leading-relaxed font-normal product"
                      >
                        <p>{step.content}</p>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
            </div>

            {/* Mouse Scroll Decors */}
            <div className="flex items-center gap-3 pt-4 select-none">
              {/* Glowing active circle dot */}
              <div className="w-5 h-5 rounded-full border border-[#10b981] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              </div>
              
              {/* Scroll indicators */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono tracking-widest uppercase">
                <span className="w-2.5 h-4 border border-neutral-600 rounded-full flex items-start justify-center p-[2px]">
                  <span className="w-0.5 h-1 bg-[#10b981] rounded-full animate-bounce" />
                </span>
                <span>who is smart scrolls down</span>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
