"use client";

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  FiUser,
  FiDatabase,
  FiMic,
  FiActivity,
  FiBox,
  FiArrowRight,
  FiSmile,
  FiCpu,
  FiSliders,
  FiPlusCircle,
  FiHeart,
  FiRadio,
  FiNavigation,
  FiMap,
  FiMapPin,
  FiCamera,
  FiBell,
  FiMenu
} from "react-icons/fi";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";

// --- Dropdown Contents ---
const PersonaMenu = () => (
  <div className="w-[min(300px,calc(100vw-3rem))]">
    <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">Persona Manager</h3>
    <div className="flex flex-col gap-1">
      <Link href="/persona#templates" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiBox className="text-lg" /> Persona Templates
      </Link>
      <Link href="/persona#generative" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiSmile className="text-lg" /> Generative Persona
      </Link>
      <Link href="/persona#role-builder" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiUser className="text-lg" /> Role Builder
      </Link>
    </div>
  </div>
);

const RagMenu = () => (
  <div className="w-[min(240px,calc(100vw-3rem))]">
    <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">Knowledge Hub</h3>
    <div className="flex flex-col gap-1">
      <Link href="/rag#document" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiDatabase className="text-lg" /> Document RAG
      </Link>
      <Link href="/rag#web" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiCpu className="text-lg" /> Web RAG
      </Link>
    </div>
  </div>
);

const GestureMenu = () => (
  <div className="w-[min(240px,calc(100vw-3rem))]">
    <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">Gesture Settings</h3>
    <div className="flex flex-col gap-1">
      <Link href="/gesture#custom" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiActivity className="text-lg" /> Custom Gesture
      </Link>
      <Link href="/gesture#add" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiPlusCircle className="text-lg" /> Add Gesture
      </Link>
    </div>
  </div>
);

const InventoryMenu = () => (
  <div className="w-[min(240px,calc(100vw-3rem))]">
    <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">Robot Inventory</h3>
    <div className="flex flex-col gap-1">
      <Link href="/inventory#health" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiHeart className="text-lg" /> Health Status
      </Link>
    </div>
  </div>
);

export type NavItem = {
  id: string;
  icon: React.ReactElement;
  label: string;
  href: string;
  dropdownComponent?: React.FC;
};

const NavigationMenu = () => (
  <div className="p-3 w-[min(200px,calc(100vw-3rem))]">
    <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">Navigation</h3>
    <div className="space-y-1">
      <Link href="/navigation#navigate" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiMapPin className="text-lg" /> Go to Location
      </Link>
      <Link href="/navigation#mapping" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiMap className="text-lg" /> Mapping
      </Link>
      <Link href="/navigation#status" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors">
        <FiNavigation className="text-lg" /> Status
      </Link>
    </div>
  </div>
);

const defaultNavItems: NavItem[] = [
  { id: "persona",    icon: <FiUser />,       label: "Persona Manager",  href: "/persona",     dropdownComponent: PersonaMenu },
  { id: "rag",        icon: <FiDatabase />,   label: "Knowledge Hub",        href: "/rag",         dropdownComponent: RagMenu },
  { id: "navigation", icon: <FiNavigation />, label: "Navigation",       href: "/navigation",  dropdownComponent: NavigationMenu },
  { id: "gesture",    icon: <FiActivity />,   label: "Gesture Settings", href: "/gesture",     dropdownComponent: GestureMenu },
  { id: "inventory",  icon: <FiBox />,        label: "Robot Inventory",  href: "/inventory",   dropdownComponent: InventoryMenu },
];

export const LimelightNav = ({
  items = defaultNavItems,
  role,
  isLoggedIn = false,
  tenant
}: { items?: NavItem[], role?: string | null; isLoggedIn?: boolean; tenant?: any }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [dir, setDir] = useState<"l" | "r" | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [limelightCenter, setLimelightCenter] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);
  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);

  const isAdmin = role === "admin";

  // Filter items based on role
  const visibleItems = items.filter(item => {
    if (item.id === "inventory" && !isAdmin) return false;
    return true;
  });

  useLayoutEffect(() => {
    const index = visibleItems.findIndex((item) => item.href === pathname);
    if (index >= 0) {
      setActiveIndex(index);
    }
    setOpenIndex(null);
  }, [pathname, visibleItems]);

  const handleSetHovered = (index: number | null) => {
    if (typeof hoveredIndex === "number" && typeof index === "number") {
      setDir(hoveredIndex > index ? "r" : "l");
    } else if (index === null) {
      setDir(null);
    }
    setHoveredIndex(index);
  };

  const shownIndex = hoveredIndex !== null ? hoveredIndex : openIndex;
  const targetIndex = shownIndex !== null ? shownIndex : activeIndex;

  // Close the tap-opened dropdown on outside click/tap or Escape (keyboard/touch users
  // have no onMouseLeave to fall back on).
  useEffect(() => {
    if (openIndex === null) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (navWrapRef.current && !navWrapRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openIndex]);

  useLayoutEffect(() => {
    if (visibleItems.length === 0) return;

    const limelight = limelightRef.current;
    const targetItem = navItemRefs.current[targetIndex];

    if (limelight && targetItem) {
      const center = targetItem.offsetLeft + targetItem.offsetWidth / 2;
      setLimelightCenter(center);
      
      const newLeft = center - limelight.offsetWidth / 2;
      limelight.style.left = `${newLeft}px`;

      if (!isReady) {
        setTimeout(() => setIsReady(true), 50);
      }
    }
  }, [targetIndex, isReady, visibleItems]);

  // Scroll detection to hide/show header
  useEffect(() => {
    const mainEl = document.querySelector("main");
    const scrollTarget = mainEl || window;

    const handleScroll = () => {
      const currentScrollY = mainEl ? mainEl.scrollTop : window.scrollY;
      
      // Threshold to prevent jitter/flickering
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

  if (visibleItems.length === 0 || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />
      <header
        className={`sticky top-0 z-40 w-full shrink-0 bg-background/70 supports-[backdrop-filter]:bg-background/55 backdrop-blur-xl border-b border-border/40 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-0 md:-translate-y-full"
        }`}
      >
        {/* Row 1 — chrome bar: menu + account actions */}
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 max-w-[1600px] mx-auto gap-3 sm:gap-4">

          {/* Left Side: Hamburger Menu Button on Mobile */}
          <div className="flex md:hidden items-center shrink-0">
            <button
              onClick={() => window.dispatchEvent(new Event("open-sidebar"))}
              className="p-2.5 -ml-2 rounded-xl text-foreground hover:bg-accent active:bg-accent/70 transition-colors"
              aria-label="Open Sidebar"
              title="Open Sidebar"
            >
              <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Spacer keeps actions pinned right on every breakpoint */}
          <div className="flex-1 min-w-0" />

          {/* Right Side: Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 origin-right shrink-0">
            {/* Notification bell */}
            {isLoggedIn && (
              <button
                onClick={() => {
                  console.log("[HeaderActions] Navigating to Notifications page");
                  router.push("/notifications");
                }}
                className="p-2 sm:p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative shadow-sm"
                title="Notifications"
              >
                <FiBell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              </button>
            )}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Profile avatar (logged in) or Login button (logged out) */}
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="rounded-full hover:ring-2 hover:ring-primary/40 transition-all"
                title="Profile"
              >
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-border shadow-sm cursor-pointer hover:border-primary transition-colors">
                  {tenant?.companyLogo ? <AvatarImage src={tenant.companyLogo} alt={tenant.name || "Profile"} className="object-cover rounded-full" /> : null}
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-[13px] rounded-full">
                    {tenant?.name ? tenant.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
              >
                Login
              </Link>
            )}
          </div>

        </div>

        {/* Row 2 — translucent glass strip carrying the section tabs.
            Lives in normal flow beneath the chrome bar, so it never covers content. */}
        <div className="w-full border-t border-border/30 bg-card/40 supports-[backdrop-filter]:bg-card/20 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div
            className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 flex justify-start md:justify-center"
            onMouseLeave={() => handleSetHovered(null)}
          >
            <div className="relative max-w-full" ref={navWrapRef}>
              <nav
                className="relative flex items-center h-10 sm:h-11 rounded-xl bg-background/50 supports-[backdrop-filter]:bg-background/30 text-card-foreground border border-border/50 px-1 sm:px-1.5 backdrop-blur-md max-w-full overflow-x-auto no-scrollbar flex-nowrap scroll-smooth [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] md:[mask-image:none]"
              >
                {visibleItems.map((item, index) => {
                  const isActive = activeIndex === index;
                  const isHovered = hoveredIndex === index;
                  const isHighlighted = isHovered || (hoveredIndex === null && isActive);
                  const hasDropdown = !!item.dropdownComponent;
                  const isRevealed = hoveredIndex === index || openIndex === index;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      ref={(el) => {
                        navItemRefs.current[index] = el;
                      }}
                      onMouseEnter={() => handleSetHovered(index)}
                      onFocus={() => handleSetHovered(index)}
                      onClick={(e) => {
                        if (hasDropdown && !isRevealed) {
                          // First tap/click with no hover support (touch, or fast click):
                          // reveal the submenu instead of navigating away from it.
                          e.preventDefault();
                          setOpenIndex(index);
                        } else {
                          setOpenIndex(null);
                        }
                      }}
                      aria-haspopup={hasDropdown ? "menu" : undefined}
                      aria-expanded={hasDropdown ? isRevealed : undefined}
                      className="relative z-20 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 lg:px-4 py-2 cursor-pointer group shrink-0 rounded-lg"
                    >
                      {React.cloneElement(item.icon, {
                        className: `w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0 transition-all duration-300 ease-in-out ${
                          isHighlighted
                            ? "text-primary scale-110"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`,
                      } as any)}
                      <span
                        className={`text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
                          isHighlighted
                            ? "text-primary opacity-100"
                            : "text-muted-foreground opacity-60 group-hover:text-foreground group-hover:opacity-100"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Limelight indicator line */}
                <div
                  ref={limelightRef}
                  className={`absolute -top-[1px] z-10 w-10 h-[1.5px] rounded-full bg-primary shadow-[0_0_15px_var(--primary)] ${
                    isReady ? "transition-all duration-300 ease-out" : ""
                  }`}
                  style={{ left: "-999px" }}
                >
                  <div className="absolute left-[-50%] top-[1.5px] w-[200%] h-8 [clip-path:polygon(10%_100%,30%_0,70%_0,90%_100%)] bg-gradient-to-b from-primary/15 to-transparent pointer-events-none" />
                </div>
              </nav>

              {/* Dropdown renders below the nav */}
              <AnimatePresence>
                {shownIndex !== null && visibleItems[shownIndex]?.dropdownComponent && (
                  <DropdownContent
                    dir={dir}
                    selectedItem={visibleItems[shownIndex]}
                    center={limelightCenter}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

// --- Dropdown Sub-components ---
const DropdownContent = ({ selectedItem, dir, center }: any) => {
  const Component = selectedItem.dropdownComponent;

  return (
    <motion.div
      id="overlay-content"
      initial={{ opacity: 0, y: 8, x: `calc(${center}px - 50%)` }}
      animate={{ opacity: 1, y: 0, x: `calc(${center}px - 50%)` }}
      exit={{ opacity: 0, y: 8, x: `calc(${center}px - 50%)` }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="absolute top-full mt-3 left-0 rounded-xl border border-border/60 bg-card/85 supports-[backdrop-filter]:bg-card/70 backdrop-blur-xl shadow-2xl z-50 w-fit max-w-[calc(100vw-1.5rem)]"
    >
      {/* Invisible bridge from nav bottom to dropdown top */}
      <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 w-[200%] h-[12px]" />
      
      {/* Nub is always centered on the dropdown */}
      <div className="absolute top-0 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl border border-border/60 bg-card/85 backdrop-blur-xl" style={{ clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)" }} />

      <div className="overflow-hidden rounded-xl">
        <motion.div
          key={selectedItem.id}
          initial={{ opacity: 0, x: dir === "l" ? 80 : dir === "r" ? -80 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="p-3"
        >
          <Component />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LimelightNav;
