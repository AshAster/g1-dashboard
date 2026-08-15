"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { docCategories } from '../data/docs-content';

export function DocSidebar() {
  const [activeId, setActiveId] = useState<string>("");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // The actual scroll container is the <main> element from layout.tsx (overflow-y-auto),
    // not window. We need to find it by walking up from our component.
    const getScrollContainer = (): HTMLElement | null => {
      let el = navRef.current?.parentElement;
      while (el) {
        const style = getComputedStyle(el);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return el;
        }
        el = el.parentElement;
      }
      return null;
    };

    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return;

    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = "";

      // Use the scroll container's scrollTop + an offset for natural highlighting
      const scrollPosition = scrollContainer.scrollTop + 250;

      sections.forEach((section) => {
        const sectionEl = section as HTMLElement;
        // offsetTop is relative to the offsetParent, so we need to calculate
        // the position relative to the scroll container
        let top = 0;
        let el: HTMLElement | null = sectionEl;
        while (el && el !== scrollContainer) {
          top += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        if (scrollPosition >= top) {
          current = section.getAttribute('id') || "";
        }
      });

      setActiveId(current);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on load
    handleScroll();

    // Check hash on load
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveId(id);
      }, 100);
    }

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', `#${id}`);
    setActiveId(id);
  };

  return (
    <nav
      ref={navRef}
      className="w-full lg:w-auto flex-shrink-0 block static lg:sticky lg:top-[104px] h-auto lg:max-h-[calc(100dvh-18rem)] overflow-y-visible lg:overflow-y-auto pb-5 sm:pb-6 mb-5 sm:mb-6 lg:mb-0 pt-2"
    >
      <div className="space-y-5 sm:space-y-6">
        {docCategories.map((category) => (
          <div key={category.id} className="sidebar-group">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2 px-2">
              {category.name}
            </h3>
            <ul className="space-y-1">
              {category.sections.map((sectionId) => {
                // Find readable title for sidebar (handle special cases)
                let title = sectionId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                if (sectionId === 'mcp-integrations') title = 'Integrations (MCP)';
                if (sectionId === 'knowledge-base') title = 'Knowledge Base (RAG)';
                if (sectionId === 'facial-recognition') title = 'Facial Recognition (FRS)';
                
                const isActive = activeId === sectionId;
                
                return (
                  <li key={sectionId}>
                    <a
                      href={`#${sectionId}`}
                      onClick={(e) => handleClick(e, sectionId)}
                      className={`block px-3 py-2 lg:py-1.5 text-sm rounded-md transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/10 text-primary font-semibold' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

