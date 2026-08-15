"use client";

import { cn } from "@/lib/utils";
import React, {
  useState,
  createContext,
  useContext,
} from "react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

import Link from "next/link";


// ============================================================
// TYPES
// ============================================================

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}


interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}


// ============================================================
// SIDEBAR CONTEXT
// ============================================================

const SidebarContext =
  createContext<SidebarContextProps | undefined>(undefined);


export const useSidebar = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error(
      "useSidebar must be used within a SidebarProvider"
    );
  }

  return context;
};


// ============================================================
// SIDEBAR PROVIDER
// ============================================================

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  animate?: boolean;
}) => {

  const [openState, setOpenState] =
    useState(false);

  const open =
    openProp !== undefined
      ? openProp
      : openState;

  const setOpen =
    setOpenProp !== undefined
      ? setOpenProp
      : setOpenState;

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        animate,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};


// ============================================================
// ACETERNITY SIDEBAR
// ============================================================

export const AceternitySidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  animate?: boolean;
}) => {

  return (
    <SidebarProvider
      open={open}
      setOpen={setOpen}
      animate={animate}
    >
      {children}
    </SidebarProvider>
  );
};


// ============================================================
// SIDEBAR BODY
// ============================================================

export const SidebarBody = (
  props: React.ComponentProps<"div">
) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};


// ============================================================
// DESKTOP SIDEBAR
// ============================================================

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {

  return (
    <div
      className={cn(
        /*
         * Desktop only
         */
        "group/nav",
        "hidden md:flex",
        "h-full",
        "flex-col",
        "shrink-0",

        /*
         * Width — hover-to-expand
         */
        "w-[60px] hover:w-[220px]",

        /*
         * Layout
         */
        "px-2",
        "py-4",

        /*
         * Background
         */
        "bg-sidebar",

        /*
         * Animation
         */
        "transition-[width]",
        "duration-300",
        "ease-in-out",

        /*
         * Prevent content overflow
         */
        "overflow-hidden",

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};


// ============================================================
// MOBILE SIDEBAR
// ============================================================

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {

  const {
    open,
    setOpen,
  } = useSidebar();


  return (
    <div className="md:hidden" {...props}>
      {/* ======================================================
          MOBILE DRAWER
      ======================================================= */}

      <AnimatePresence>

        {open && (
          <>

            {/* =================================================
                BACKDROP
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setOpen(false)}
              className="
                fixed
                inset-0
                bg-black/60
                backdrop-blur-sm
                z-[90]
              "
            />


            {/* =================================================
                SIDEBAR PANEL
            ================================================== */}

            <motion.div
              initial={{
                x: "-100%",
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: "-100%",
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                /*
                 * IMPORTANT:
                 * group/nav is retained for desktop-style
                 * hover compatibility.
                 */
                "group/nav",

                /*
                 * Position
                 */
                "fixed",
                "left-0",
                "top-0",

                /*
                 * Size
                 */
                "h-full",
                "w-[85%]",
                "max-w-[320px]",

                /*
                 * Layout
                 */
                "flex",
                "flex-col",
                "justify-between",

                /*
                 * Spacing
                 */
                "p-6",

                /*
                 * Background
                 */
                "bg-sidebar",

                /*
                 * Layer
                 */
                "z-[100]",

                /*
                 * Effects
                 */
                "shadow-2xl",
                "border-r",
                "border-border",

                className
              )}
            >

              {/* =================================================
                  CLOSE BUTTON
              ================================================== */}

              <div
                className="
                  absolute
                  right-4
                  top-4
                  z-50

                  text-sidebar-foreground

                  cursor-pointer

                  p-2

                  hover:bg-sidebar-accent

                  rounded-full

                  transition-colors
                "
                onClick={() => setOpen(false)}
              >
                <IconX />
              </div>


              {/* =================================================
                  SIDEBAR CONTENT
              ================================================== */}

              {children}

            </motion.div>

          </>
        )}

      </AnimatePresence>

    </div>
  );
};


// ============================================================
// SIDEBAR LINK
// ============================================================

export const SidebarLink = ({
  link,
  className,
  selected,
  ...props
}: {
  link: Links;
  className?: string;
  selected?: boolean;
}) => {

  /*
   * IMPORTANT:
   *
   * We now get the actual sidebar `open` state.
   *
   * Desktop:
   *   open normally doesn't matter.
   *   Hover controls the text.
   *
   * Mobile:
   *   open === true
   *   Therefore text is explicitly visible.
   */

  const {
    open,
    setOpen,
  } = useSidebar();


  return (
    <Link
      href={link.href}

      /*
       * Close mobile drawer after navigation.
       */
      onClick={() => setOpen(false)}


      className={cn(
        /*
         * Layout
         */
        "flex",
        "items-center",
        "justify-start",
        "gap-2",

        /*
         * Group
         */
        "group/link",

        /*
         * Spacing
         */
        "py-2",
        "px-2",

        /*
         * Shape
         */
        "rounded-lg",

        /*
         * Animation
         */
        "transition-colors",
        "duration-150",

        /*
         * Selected state
         */
        selected
          ? "bg-sidebar-accent text-primary"
          : "hover:bg-sidebar-accent",

        className
      )}

      {...props}
    >

      {/* ======================================================
          ICON
      ======================================================= */}

      <span className="shrink-0">
        {link.icon}
      </span>


      {/* ======================================================
          LABEL
      ======================================================= */}

      <span
        className={cn(

          /*
           * Basic text
           */
          "text-sm",
          "whitespace-nowrap",
          "overflow-hidden",

          /*
           * Animation
           */
          "transition-all",
          "duration-300",
          "ease-in-out",


          /*
           * ==================================================
           * MOBILE BEHAVIOR
           * ==================================================
           *
           * When mobile sidebar is open:
           *
           * open === true
           *
           * therefore:
           *
           * max-width = 180px
           * opacity = 1
           *
           * This does NOT depend on hover.
           */

          open
            ? "max-w-[180px] opacity-100"
            : "max-w-0 opacity-0",


          /*
           * ==================================================
           * DESKTOP BEHAVIOR
           * ==================================================
           *
           * Desktop sidebar is controlled by CSS hover.
           *
           * When user hovers the 60px sidebar:
           *
           * width expands
           * label becomes visible
           */

          "md:group-hover/nav:max-w-[180px]",
          "md:group-hover/nav:opacity-100",

          /*
           * Slight animation delay
           */
          "md:group-hover/nav:delay-[30ms]",

          /*
           * Selected color
           */
          selected
            ? "text-primary font-semibold"
            : "text-sidebar-foreground"

        )}
      >
        {link.label}
      </span>

    </Link>
  );
};