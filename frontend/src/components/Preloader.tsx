"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { items } from "@/components/ui/image-mousetrail-without-component-utils/constant";

interface PreloaderProps {
  onComplete: () => void;
}

const stackImages = [
  { url: items[0].url, rotate: -8, delay: 10 },
  { url: items[1].url, rotate: 5, delay: 30 },
  { url: items[2].url, rotate: -4, delay: 55 },
  { url: items[4].url, rotate: 8, delay: 75 },
  { url: items[5].url, rotate: -2, delay: 90 },
];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Staggered increments to make it feel natural
      const increment = Math.floor(Math.random() * 6) + 2;
      current = Math.min(current + increment, 100);
      setProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        // Wait 600ms at 100% before triggering transition
        const timeout = setTimeout(() => {
          onComplete();
        }, 600);
        return () => clearTimeout(timeout);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  const formatProgress = (val: number) => {
    return val.toString().padStart(3, "0");
  };

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[100] bg-[#f4f1ea] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative flex items-center justify-center select-none">
        
        {/* Stacking Image Cards behind the text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="relative w-48 h-60">
            {stackImages.map((img, idx) => {
              const isShown = progress >= img.delay;
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, opacity: 0, rotate: 0 }}
                  animate={
                    isShown
                      ? { scale: 1, opacity: 1, rotate: img.rotate }
                      : { scale: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-white border-4 border-white rounded-2xl shadow-xl overflow-hidden"
                  style={{ zIndex: idx }}
                >
                  <img
                    src={img.url}
                    alt={`stack-image-${idx}`}
                    className="w-full h-full object-cover filter grayscale opacity-90"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Brand Text */}
        <div className="relative z-10 flex items-start">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl sm:text-8xl font-black tracking-tighter text-black radio uppercase mix-blend-difference"
          >
            TransitOps
          </motion.h1>

          {/* Progress Counter in top right of text */}
          <motion.span
            className="text-xs font-mono font-bold text-black ml-2 mt-1 sm:mt-2 select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {formatProgress(progress)}
          </motion.span>
        </div>

      </div>
    </motion.div>
  );
}
