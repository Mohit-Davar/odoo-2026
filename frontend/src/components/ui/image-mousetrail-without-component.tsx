//@ts-nocheck
'use client';
import { items } from '@/components/ui/image-mousetrail-without-component-utils/constant';
import React, { createRef, useRef, useEffect } from 'react';

export default function ImageMouseTrail3() {
  const containerRef = useRef(null);
  const refs = useRef(items.map(() => createRef<HTMLImageElement>()));

  const globalIndexRef = useRef(0);
  const lastRef = useRef({ x: 0, y: 0 });

  const activate = (image, x, y) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    const relativeX = x - containerRect.left;
    const relativeY = y - containerRect.top;
    image.style.left = `${relativeX}px`;
    image.style.top = `${relativeY}px`;

    image.style.zIndex = (globalIndexRef.current % items.length) + 1;

    image.dataset.status = 'active';
    setTimeout(() => {
      image.dataset.status = 'inactive';
    }, 1000);
    lastRef.current = { x, y };
  };

  const distanceFromLast = (x, y) => {
    return Math.hypot(x - lastRef.current.x, y - lastRef.current.y);
  };

  const deactivate = (image) => {
    if (image) image.dataset.status = 'inactive';
  };

  const handleOnMove = (e) => {
    if (distanceFromLast(e.clientX, e.clientY) > window.innerWidth / 20) {
      const lead = refs.current[globalIndexRef.current % refs.current.length].current;
      const tail = refs.current[(globalIndexRef.current - 5) % refs.current.length]?.current;

      if (lead) activate(lead, e.clientX, e.clientY);
      if (tail) deactivate(tail);

      globalIndexRef.current++;
    }
  };

  // Automatically spawn images in a wave pattern as the user scrolls
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY);

      if (scrollDiff > 25) {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Check if the gallery container is in the viewport
        if (containerRect.top < window.innerHeight && containerRect.bottom > 0) {
          // Calculate a flowing horizontal wave path based on scroll position
          const factor = currentScrollY * 0.007;
          const x = containerRect.left + (containerRect.width / 2) + Math.sin(factor) * (containerRect.width * 0.35);
          const y = containerRect.top + (containerRect.height / 2) + Math.cos(factor * 0.7) * (containerRect.height * 0.22);

          const lead = refs.current[globalIndexRef.current % refs.current.length].current;
          const tail = refs.current[(globalIndexRef.current - 5) % refs.current.length]?.current;

          if (lead) {
            const relativeX = x - containerRect.left;
            const relativeY = y - containerRect.top;
            lead.style.left = `${relativeX}px`;
            lead.style.top = `${relativeY}px`;
            lead.style.zIndex = (globalIndexRef.current % items.length) + 1;
            lead.dataset.status = 'active';

            setTimeout(() => {
              lead.dataset.status = 'inactive';
            }, 1000);
          }

          if (tail) {
            deactivate(tail);
          }

          globalIndexRef.current++;
          lastScrollY = currentScrollY;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="border border-white/10 bg-neutral-950/40 backdrop-blur rounded-[2rem] p-4 relative w-full h-[550px] overflow-hidden flex flex-col justify-between">
      {/* Gallery Header Indicator */}
      <div className="absolute top-8 left-10 z-20 pointer-events-none">
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-[#10b981]/15 text-[#10b981] rounded-md font-mono">
          Interactive Gallery
        </span>
        <h3 className="text-xl font-bold tracking-tight text-white mt-2">
          Operations & Fleet Showcase
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          Scroll down or move your cursor inside this container to reveal fleet photos.
        </p>
      </div>

      {/* Actual Mouse Trail Area */}
      <section
        onMouseMove={handleOnMove}
        onTouchMove={(e) => handleOnMove(e.touches[0])}
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-transparent cursor-cell"
      >
        {items.map((item, index) => (
          <img
            key={item.src}
            className="object-cover z-10 w-40 h-48 scale-0 opacity-0 data-[status='active']:scale-100 data-[status='active']:opacity-100 transition-transform duration-500 data-[status='active']:ease-out-expo absolute -translate-y-[50%] -translate-x-[50%] rounded-xl shadow-2xl border border-white/10"
            data-index={index}
            data-status='inactive'
            src={item.url}
            alt={`image-${index}`}
            ref={refs.current[index]}
          />
        ))}
      </section>
    </div>
  );
}

