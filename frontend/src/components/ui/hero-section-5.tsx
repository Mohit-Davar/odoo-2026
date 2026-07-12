'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authstore';
import { Button } from '@/components/ui/button';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronRight, Truck } from 'lucide-react';
import { useScroll, motion } from 'framer-motion';

export function HeroSection() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden relative bg-black">
        <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-24 md:pb-32 lg:pb-36 lg:pt-48">
          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 lg:block lg:px-12">
            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
              
              <span className="inline-block px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest bg-[#10b981]/15 text-[#10b981] rounded-md mb-6 font-mono">
                Fleet Operations Platform
              </span>

              <h1 className="text-balance text-5xl md:text-7xl font-black tracking-tight leading-[0.95] text-white radio max-w-2xl">
                A calmer way to run a fleet.
              </h1>
              
              <p className="mt-8 max-w-xl text-balance text-base sm:text-lg text-neutral-300 leading-relaxed product">
                TransitOps turns fragmented spreadsheets and manual dispatch into one ruled, automated system — from vehicle registration to the final report.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Button
                  onClick={() => router.push(user ? "/dashboard" : "/signup")}
                  size="lg"
                  className="h-12 rounded-full pl-6 pr-4 text-xs font-bold tracking-widest uppercase bg-[#10b981] hover:bg-[#10b981]/90 text-white border-transparent cursor-pointer"
                >
                  <span className="text-nowrap">Launch Console</span>
                  <ChevronRight className="ml-1.5 w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => {
                    const el = document.getElementById("modules");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-full px-6 text-xs font-bold tracking-widest uppercase text-white hover:bg-white/5 cursor-pointer"
                >
                  <span className="text-nowrap">Explore Modules</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Traffic Timelapse Video Box */}
          <div className="aspect-[2/3] absolute inset-x-6 sm:inset-x-12 lg:inset-x-16 bottom-0 top-24 overflow-hidden rounded-3xl border border-white/5 sm:aspect-video lg:rounded-[3rem] z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="size-full object-cover opacity-60 dark:opacity-70"
              src="/videos/hero-video.mp4"
            />
            {/* Smooth dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        </section>

        {/* Brand slider / logo showcase strip */}
        <section className="bg-black pb-12 pt-6">
          <div className="group relative m-auto max-w-7xl px-6 lg:px-12">
            <div className="flex flex-col items-center md:flex-row gap-6 md:gap-12">
              <div className="md:max-w-44 md:border-r border-white/10 md:pr-6 shrink-0">
                <p className="text-center md:text-left text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                  Trusted by top logistics operators
                </p>
              </div>
              <div className="relative py-4 w-full md:w-[calc(100%-12rem)] overflow-hidden">
                <InfiniteSlider
                  durationOnHover={20}
                  duration={40}
                  gap={112}
                >
                  <div className="flex shrink-0">
                    <img
                      className="h-5 w-auto invert"
                      src="https://html.tailus.io/blocks/customers/nvidia.svg"
                      alt="Nvidia Logo"
                    />
                  </div>

                  <div className="flex shrink-0">
                    <img
                      className="h-4 w-auto invert"
                      src="https://html.tailus.io/blocks/customers/column.svg"
                      alt="Column Logo"
                    />
                  </div>
                  <div className="flex shrink-0">
                    <img
                      className="h-4 w-auto invert"
                      src="https://html.tailus.io/blocks/customers/github.svg"
                      alt="GitHub Logo"
                    />
                  </div>
                  <div className="flex shrink-0">
                    <img
                      className="h-5 w-auto invert"
                      src="https://html.tailus.io/blocks/customers/nike.svg"
                      alt="Nike Logo"
                    />
                  </div>
                  <div className="flex shrink-0">
                    <img
                      className="h-5 w-auto invert"
                      src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                      alt="Lemon Squeezy Logo"
                    />
                  </div>
                  <div className="flex shrink-0">
                    <img
                      className="h-4 w-auto invert"
                      src="https://html.tailus.io/blocks/customers/laravel.svg"
                      alt="Laravel Logo"
                    />
                  </div>
                  <div className="flex shrink-0">
                    <img
                      className="h-7 w-auto invert"
                      src="https://html.tailus.io/blocks/customers/lilly.svg"
                      alt="Lilly Logo"
                    />
                  </div>

                  <div className="flex shrink-0">
                    <img
                      className="h-6 w-auto invert"
                      src="https://html.tailus.io/blocks/customers/openai.svg"
                      alt="OpenAI Logo"
                    />
                  </div>
                </InfiniteSlider>

                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent pointer-events-none z-10"></div>
                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20 z-10"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20 z-10"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: 'Approach', href: '#approach' },
  { name: 'Modules', href: '#modules' },
  { name: 'Mission', href: '#mission' },
  { name: 'Strengths', href: '#strengths' },
];

const HeroHeader = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [menuState, setMenuState] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollYProgress } = useScroll();

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setScrolled(latest > 0.05);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className="group fixed z-50 w-full pt-4 px-6 sm:px-12 lg:px-16"
      >
        <div className={cn(
          'mx-auto max-w-7xl rounded-full px-6 transition-all duration-300 border border-transparent',
          scrolled ? 'bg-black/90 backdrop-blur-2xl border-white/10 py-3' : 'bg-transparent py-5'
        )}>
          <div className="relative flex flex-wrap items-center justify-between gap-6 duration-200">
            
            {/* Logo area */}
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                  Transit<span className="text-[#10b981]">Ops</span>
                </span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden text-white"
              >
                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              <div className="hidden lg:block">
                <ul className="flex gap-8 text-[11px] font-bold uppercase tracking-widest font-mono">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-neutral-400 hover:text-white block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Auth / Menu list panel */}
            <div className="bg-black/95 lg:bg-transparent group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-white/10 lg:border-none p-6 shadow-2xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:p-0 lg:shadow-none">
              <div className="lg:hidden w-full">
                <ul className="space-y-6 text-base font-bold text-left">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        onClick={() => setMenuState(false)}
                        href={item.href}
                        className="text-neutral-300 hover:text-white block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {user ? (
                  <Button
                    onClick={() => {
                      setMenuState(false);
                      router.push("/dashboard");
                    }}
                    size="sm"
                    className="rounded-full text-white text-[11px] font-bold tracking-wider px-5 py-2 hover:opacity-90 transition-opacity bg-[#10b981] border-transparent cursor-pointer"
                  >
                    <span>Dashboard</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setMenuState(false);
                        router.push("/login");
                      }}
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-white text-[11px] font-bold tracking-wider px-5 py-2 hover:bg-white/5 cursor-pointer"
                    >
                      <span>Sign In</span>
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setMenuState(false);
                        router.push("/signup");
                      }}
                      size="sm"
                      className="rounded-full text-white text-[11px] font-bold tracking-wider px-5 py-2 hover:opacity-90 transition-opacity bg-[#10b981] border-transparent cursor-pointer"
                    >
                      <span>Get Started</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </nav>
    </header>
  );
};
