"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function DerckxProjects() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of this container over a 300vh track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // --- Phase 1: Side Columns Parallax [0.0 to 0.5] ---
  const yLeft = useTransform(scrollYProgress, [0, 0.5], [400, -600]);
  const yRight = useTransform(scrollYProgress, [0, 0.5], [-150, 500]);
  const columnsOpacity = useTransform(scrollYProgress, [0, 0.4, 0.5], [1, 1, 0]);

  // --- Centered Text [0.0 to 0.4] ---
  const textOpacity = useTransform(scrollYProgress, [0, 0.32, 0.4], [1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.92]);

  // --- Phase 2: Clipped Full-Screen Image Expansion (Dolmans) [0.45 to 0.95] ---
  // Starts small (24% margins) and fills up the entire screen (0% margins)
  const clipProgress = useTransform(scrollYProgress, [0.45, 0.95], [24, 0]);
  
  // Transform percentage to clip-path coordinates
  const clipPath = useTransform(
    clipProgress,
    (val) =>
      `polygon(${val}% ${val}%, ${100 - val}% ${val}%, ${100 - val}% ${100 - val}%, ${val}% ${100 - val}%)`
  );

  const imgScale = useTransform(scrollYProgress, [0.45, 0.95], [1.2, 1.0]);
  
  // Fades in at 0.38 and stays fully visible (100% opacity) all the way to 1.0
  const imgOpacity = useTransform(scrollYProgress, [0.38, 0.5], [0, 1]);

  const leftProjects = [
    {
      title: "BMO Logistics Center",
      tag: "Automated warehouse facilities",
      img: "https://derckx.nl/wp-content/uploads/2024/08/Derckx_BMO_BASE_15_s-526x648.jpg",
    },
    {
      title: "Motrac Headquarters",
      tag: "Modern corporate architecture",
      img: "https://derckx.nl/wp-content/uploads/2024/08/Derckx_Motrac_BASE_05-526x648.webp",
    },
    {
      title: "Transit Terminal 4",
      tag: "Logistics shipping hub",
      img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600",
    },
    {
      title: "Cargo Warehouse",
      tag: "High density storage structure",
      img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    },
  ];

  const rightProjects = [
    {
      title: "GP Equipment Facility",
      tag: "High efficiency supply hubs",
      img: "https://derckx.nl/wp-content/uploads/2024/08/Derckx_GP_Equipment_BASE_02-526x648.webp",
    },
    {
      title: "StadAlkmaar Logistics",
      tag: "Cross-docking distribution center",
      img: "https://derckx.nl/wp-content/uploads/2024/08/Derckx_StadAlkmaar_BASE_01-526x648.webp",
    },
    {
      title: "TransitOps Central",
      tag: "Corporate command office",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
    },
    {
      title: "Seaport Container Hub",
      tag: "Intermodal port operations",
      img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative h-[300vh] bg-black text-white w-full z-25 select-none"
    >
      {/* Sticky viewport content container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        
        {/* Full-Screen Building Image (Underlay, expanding clip-path) */}
        <motion.div
          style={{
            clipPath: clipPath,
            opacity: imgOpacity,
          }}
          className="absolute inset-0 w-full h-full z-0 overflow-hidden"
        >
          <motion.img
            src="https://derckx.nl/wp-content/uploads/2025/07/Dolmans1-1920x1281.jpg"
            alt="Dolmans Landscaping Group"
            style={{ scale: imgScale }}
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay to make text highly readable when fully expanded */}
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>

        {/* Centered Scroll-Linked Text */}
        <motion.div
          style={{ opacity: textOpacity, scale: textScale }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 text-center px-6"
        >
          <h2 className="text-3xl sm:text-[3.625rem] font-black leading-[1.1] tracking-tight radio text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
            <span className="font-normal block text-neutral-300">Who is smart</span>
            <span className="font-normal block text-neutral-300">chooses a platform that</span>
            <span className="text-[#10b981]">runs on real-time data</span>
          </h2>
          
          <div className="mt-8 w-6 h-6 rounded-full border-2 border-[#10b981] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          </div>
        </motion.div>

        {/* Side columns parallax elements (fade out as scroll progresses) */}
        <motion.div
          style={{ opacity: columnsOpacity }}
          className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10 px-6 sm:px-12 lg:px-16 pointer-events-none"
        >
          {/* Left Column (scrolling up) */}
          <motion.div
            style={{ y: yLeft }}
            className="md:col-span-5 space-y-16 lg:space-y-24 md:mt-24"
          >
            {leftProjects.map((p) => (
              <div
                key={p.title}
                className="group block relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-900 bg-neutral-950 aspect-[4/5]"
              >
                <img
                  src={p.img}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end items-start opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black via-black/40 to-transparent">
                  <span className="inline-block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#10b981] text-white rounded-md mb-3">
                    {p.tag}
                  </span>
                  <h3 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                    <span>{p.title}</span>
                  </h3>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-2 h-full" />

          {/* Right Column (scrolling down) */}
          <motion.div
            style={{ y: yRight }}
            className="md:col-span-5 space-y-16 lg:space-y-24"
          >
            {rightProjects.map((p) => (
              <div
                key={p.title}
                className="group block relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-900 bg-neutral-950 aspect-[4/5]"
              >
                <img
                  src={p.img}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end items-start opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black via-black/40 to-transparent">
                  <span className="inline-block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#10b981] text-white rounded-md mb-3">
                    {p.tag}
                  </span>
                  <h3 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                    <span>{p.title}</span>
                  </h3>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
