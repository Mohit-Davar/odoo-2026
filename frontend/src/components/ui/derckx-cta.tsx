"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export default function DerckxCTA() {
  const router = useRouter();

  const links = [
    { label: "Where to start", path: "/signup" },
    { label: "Our fleet modules", path: "#modules" },
    { label: "Our rules & laws", path: "#approach" },
    { label: "Platform stack", path: "#strengths" },
    { label: "News & Updates", path: "/" },
    { label: "About TransitOps", path: "/" },
    { label: "Careers & Jobs", path: "/" },
    { label: "Get in touch", path: "/login" },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 border-t border-neutral-900 z-20">
      
      {/* Night highway backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1600"
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/50" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 py-28 px-6 sm:px-12 lg:px-16 relative z-10 items-center">
        
        {/* Left Side: Title and Two Column Navigation Grid */}
        <div className="lg:col-span-8 flex flex-col justify-center text-left">
          <h2 className="text-3xl sm:text-[3.2rem] font-black leading-[1.1] tracking-tight radio text-white max-w-xl mb-12">
            Design and rules for <span className="text-[#10b981] block">smart operators</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 max-w-xl">
            {links.map((l) => (
              <div
                key={l.label}
                onClick={() => router.push(l.path)}
                className="group flex items-center justify-between border-b border-white/5 pb-2 text-neutral-300 hover:text-[#10b981] font-semibold text-sm transition-colors cursor-pointer select-none"
              >
                <span>{l.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-300 text-[#10b981]" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Rotating circular badge and green square trigger */}
        <div className="lg:col-span-4 flex items-center justify-center lg:justify-end relative">
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            
            {/* Spinning Circle SVG Text (using SVG textPath) */}
            <svg
              viewBox="0 0 100 100"
              className="absolute w-full h-full animate-[spin_16s_linear_infinite]"
            >
              <defs>
                <path
                  id="circlePath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                />
              </defs>
              <text className="text-[6.2px] fill-neutral-400 font-mono font-bold tracking-[0.14em] uppercase">
                <textPath href="#circlePath">
                  Who is smart takes control of their fleet • Who is smart takes control •
                </textPath>
              </text>
            </svg>

            {/* Central square green button with custom arrow link */}
            <div
              onClick={() => router.push("/signup")}
              className="w-14 h-14 bg-[#10b981] hover:bg-[#10b981]/90 flex items-center justify-center text-white transition-all duration-300 shadow-xl cursor-pointer select-none active:scale-95"
            >
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>

          </div>

          {/* Green Pixel Matrix (Bottom Right, matching screenshot) */}
          <div className="absolute -bottom-16 -right-6 w-[120px] h-[80px] overflow-hidden opacity-20 pointer-events-none select-none hidden lg:block">
            <div className="grid grid-cols-6 gap-1.5 w-full h-full">
              {Array.from({ length: 24 }).map((_, i) => {
                const isBright = (i * 5 + 3) % 4 === 0;
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-sm ${
                      isBright ? "bg-[#10b981]" : "bg-[#10b981]/10"
                    }`}
                  />
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
