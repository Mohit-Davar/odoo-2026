"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Star, Wrench, Database, Zap, ArrowUpRight } from "lucide-react";

export default function DerckxFoundation() {
  const cards = [
    {
      num: "01",
      title: "Next.js & React",
      desc: "App Router structures, layout caching and route-based code splitting for a fast, modern frontend.",
      icon: Star,
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      tag: "Frontend Stack",
    },
    {
      num: "02",
      title: "Zustand & Axios",
      desc: "Persistent auth state with automated session verification and a typed API client.",
      icon: Wrench,
      img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
      tag: "State Management",
    },
    {
      num: "03",
      title: "PostgreSQL Database",
      desc: "Structural schemas, relational foreign keys and unique constraints keep fleet data honest.",
      icon: Database,
      img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
      tag: "Data Storage",
    },
    {
      num: "04",
      title: "Express & Redis",
      desc: "REST endpoints with Redis-backed session locks and role-based access control.",
      icon: Zap,
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      tag: "Backend & Cache",
    },
  ];

  return (
    <section className="relative bg-black text-white py-32 px-6 sm:px-12 lg:px-16 border-t border-neutral-900 z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Side: Sticky Description & Decorative Grid */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col justify-between min-h-[50vh]">
          
          <div className="space-y-6 text-left">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase font-mono text-[#10b981]">
              Built to Last
            </span>
            <h2 className="text-3xl sm:text-[2.8rem] font-black leading-[1.15] tracking-tight radio text-white">
              Who is smart builds on a <span className="text-[#10b981]">proven stack</span>
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed font-normal product max-w-md">
              A decade of software architecture experience and high-reliability systems engineering ensures our transport platform exceeds expectations, every single trip.
            </p>
          </div>

          {/* Decorative Pixel Grid Matrix (Bottom Left, matching screenshot) */}
          <div className="mt-12 w-[180px] h-[120px] overflow-hidden opacity-30 pointer-events-none select-none">
            <div className="grid grid-cols-8 gap-1.5 w-full h-full">
              {Array.from({ length: 48 }).map((_, i) => {
                const isBright = (i * 3 + 7) % 7 === 0;
                const isMedium = (i * 2 + 5) % 4 === 0;
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-sm ${
                      isBright
                        ? "bg-[#10b981]"
                        : isMedium
                        ? "bg-[#10b981]/40"
                        : "bg-[#10b981]/5"
                    }`}
                  />
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Vertically Scrolling Stack of Project Cards */}
        <div className="lg:col-span-7 space-y-12 sm:space-y-16">
          {cards.map((c) => (
            <motion.div
              key={c.num}
              whileHover="hover"
              className="group relative h-[320px] sm:h-[380px] w-full rounded-[2rem] overflow-hidden border border-neutral-900 bg-neutral-950 shadow-2xl cursor-pointer"
            >
              {/* Colored Card Image Backdrop */}
              <img
                src={c.img}
                alt={c.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {/* Green Icon Box (Top Left, matching screenshot) */}
              <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-[#10b981] flex items-center justify-center text-white z-10 shadow-lg">
                <c.icon className="w-5 h-5" />
              </div>

              {/* Hover Bubble indicator (bouwtrap / stack tag) */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-white text-[10px] font-bold tracking-wider uppercase">
                  <span>Stack</span>
                  <ArrowUpRight className="w-3 h-3 text-[#10b981]" />
                </div>
              </div>

              {/* Bottom Card Content */}
              <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-end items-start text-left z-10">
                <span className="text-xs font-mono font-bold tracking-widest text-[#10b981] mb-2">
                  MODULE {c.num} / {c.tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold radio text-white">
                  {c.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal product max-w-lg">
                  {c.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
