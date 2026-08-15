"use client";

import React, { useState, useEffect, useRef } from "react";
import { DocSearch } from "./doc-search";

export function DocHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    const scrollTarget = mainEl || window;

    const handleScroll = () => {
      const currentScrollY = mainEl ? mainEl.scrollTop : window.scrollY;

      // Threshold to prevent jitter on micro-scrolls
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`sticky top-0 z-40 bg-background/85 supports-[backdrop-filter]:bg-background/70 backdrop-blur-xl pb-3 sm:pb-4 pt-3 sm:pt-4 border-b border-border/50 mb-6 sm:mb-8 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">Documentation</h1>
          <p className="text-muted-foreground mt-1">Complete guide to the VEDA platform</p>
        </div>
        
        {/* Search Bar at Top Right */}
        <div className="w-full md:w-auto relative z-50">
          <DocSearch />
        </div>
      </div>
    </div>
  );
}
