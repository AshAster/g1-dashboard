"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import {
  FiTerminal,
  FiMessageSquare,
  FiVolume2,
  FiCamera,
  FiFileText,
  FiSettings,
  FiBookOpen,
  FiInfo,
  FiLifeBuoy,
  FiLogOut,
} from "react-icons/fi";
import { Pin, PinOff } from "lucide-react";

import {
  AceternitySidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/app/components/ui/aceternity-sidebar";


// ============================================================
// SIDEBAR
// ============================================================

export const Sidebar = ({
  tenant,
  role,
}: {
  tenant?: any;
  role?: string | null;
}) => {

  const [
    open,
    setOpen,
  ] = useState(false);

  React.useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-sidebar", handleOpen);
    return () => window.removeEventListener("open-sidebar", handleOpen);
  }, []);


  const pathname = usePathname();

  const isAdmin =
    role === "admin";


  // ==========================================================
  // TOP LINKS
  // ==========================================================

  const topLinks = [

    {
      label: "Integrations",
      href: "/mcp",
      icon: (
        <FiTerminal
          className="
            h-5
            w-5
            shrink-0
            text-sidebar-foreground
          "
        />
      ),
    },

    {
      label: "Chat Simulator",
      href: "/chat",
      icon: (
        <FiMessageSquare
          className="
            h-5
            w-5
            shrink-0
            text-sidebar-foreground
          "
        />
      ),
    },

    {
      label: "Wake Word",
      href: "/wake-word",
      icon: (
        <FiVolume2
          className="
            h-5
            w-5
            shrink-0
            text-sidebar-foreground
          "
        />
      ),
    },

    {
      label: "FRS",
      href: "/employees",
      icon: (
        <FiCamera
          className="
            h-5
            w-5
            shrink-0
            text-sidebar-foreground
          "
        />
      ),
    },


    // ========================================================
    // ADMIN ONLY
    // ========================================================

    ...(isAdmin
      ? [
          {
            label: "Audit Logs",
            href: "/audit-logs",
            icon: (
              <FiFileText
                className="
                  h-5
                  w-5
                  shrink-0
                  text-sidebar-foreground
                "
              />
            ),
          },
        ]
      : []),


    {
      label: "Documentation",
      href: "/documentation",
      icon: (
        <FiBookOpen
          className="
            h-5
            w-5
            shrink-0
            text-sidebar-foreground
          "
        />
      ),
    },

    {
      label: "About",
      href: "/about",
      icon: (
        <FiInfo
          className="
            h-5
            w-5
            shrink-0
            text-sidebar-foreground
          "
        />
      ),
    },

  ];


  // ==========================================================
  // BOTTOM LINKS
  // ==========================================================

  const bottomLinks = [

    ...(isAdmin
      ? [
          {
            label: "Settings",
            href: "/settings",
            icon: (
              <FiSettings
                className="
                  h-5
                  w-5
                  shrink-0
                  text-sidebar-foreground
                "
              />
            ),
          },
        ]
      : []),

  ];


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <AceternitySidebar
      open={open}
      setOpen={setOpen}
      animate={true}
    >

      <SidebarBody
        className="
          justify-between
          gap-10
        "
      >

        {/* ====================================================
            TOP SECTION
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            flex-1
            overflow-y-auto
            overflow-x-hidden
          "
        >

          {/* Brand + Pin toggle */}

          <div className="flex items-center justify-between gap-1">
            <BrandLogo
              open={open}
            />
            <SidebarPinToggle />
          </div>


          {/* Navigation */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-2
            "
          >

            {topLinks.map(
              (link, idx) => (

                <SidebarLink
                  key={idx}
                  link={link}

                  selected={
                    pathname === link.href ||
                    (
                      link.href !== "/" &&
                      pathname.startsWith(
                        link.href
                      )
                    )
                  }
                />

              )
            )}

          </div>

        </div>


        {/* ====================================================
            BOTTOM SECTION
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          {/* Raise Ticket */}

          <RaiseTicketButton
            open={open}
          />


          {/* Settings */}

          {bottomLinks.map(
            (link, idx) => (

              <SidebarLink
                key={`bottom-${idx}`}
                link={link}

                selected={
                  pathname === link.href
                }
              />

            )
          )}


          {/* Logout */}

          <LogoutButton
            open={open}
          />

        </div>

      </SidebarBody>

    </AceternitySidebar>

  );
};



// ============================================================
// BRAND LOGO
// ============================================================

// ============================================================
// PIN TOGGLE
// ============================================================
//
// Desktop only. Lets a user lock the sidebar expanded instead of
// having it reflow the page on every incidental hover.

const SidebarPinToggle = () => {
  const { pinned, setPinned } = useSidebar();

  return (
    <button
      onClick={() => setPinned(!pinned)}
      title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
      className={`
        hidden md:flex
        shrink-0
        items-center
        justify-center
        h-6 w-6
        rounded-md
        text-sidebar-foreground/60
        hover:text-sidebar-foreground
        hover:bg-sidebar-accent
        transition-all
        duration-300
        ease-in-out

        ${pinned
          ? "opacity-100"
          : "opacity-0 max-w-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:max-w-6 group-hover/nav:pointer-events-auto"
        }
      `}
    >
      {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
    </button>
  );
};


const BrandLogo = ({
  open,
}: {
  open: boolean;
}) => {

  const { pinned } = useSidebar();

  return (

    <Link
      href="/"
      className="
        relative
        z-20
        flex
        items-center
        gap-2
        py-1
        px-2
      "
    >

      {/* Logo */}

      <div
        className="
          h-6
          w-7
          shrink-0
          rounded-tl-lg
          rounded-tr-sm
          rounded-br-lg
          rounded-bl-sm
          bg-sidebar-foreground
        "
      />


      {/* Veda */}

      <span
        className={`
          font-semibold
          whitespace-nowrap
          text-sidebar-foreground
          text-sm
          overflow-hidden
          transition-all
          duration-300
          ease-in-out

          ${
            open || pinned
              ? "max-w-[180px] opacity-100"
              : "max-w-0 opacity-0"
          }

          md:group-hover/nav:max-w-[180px]
          md:group-hover/nav:opacity-100
        `}
      >
        Veda
      </span>

    </Link>

  );
};



// ============================================================
// RAISE TICKET
// ============================================================

const RaiseTicketButton = ({
  open,
}: {
  open: boolean;
}) => {

  const { pinned } = useSidebar();

  return (

    <Link
      href="/tickets"
      title="Raise a Ticket"

      className="
        flex
        items-center
        justify-start
        gap-2
        group/sidebar
        py-2
        px-2
        rounded-lg

        border
        border-primary/25

        bg-primary/5
        hover:bg-primary/10

        transition-colors

        w-full

        relative
        overflow-hidden
      "
    >

      {/* ====================================================
          ANIMATION
      ===================================================== */}

      <motion.div
        className="
          absolute
          inset-0
          bg-primary/10
          pointer-events-none
          rounded-lg
        "
        animate={{
          opacity: [
            0.05,
            0.3,
            0.05,
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
      />


      {/* ====================================================
          ICON
      ===================================================== */}

      <FiLifeBuoy
        className="
          h-5
          w-5
          shrink-0
          text-primary
          z-10
        "
      />


      {/* ====================================================
          TEXT
      ===================================================== */}

      <span
        className={`
          text-sm
          font-bold
          text-primary
          whitespace-nowrap
          z-10
          overflow-hidden
          transition-all
          duration-300
          ease-in-out

          ${
            open || pinned
              ? "max-w-[180px] opacity-100"
              : "max-w-0 opacity-0"
          }

          md:group-hover/nav:max-w-[180px]
          md:group-hover/nav:opacity-100
        `}
      >
        Raise a Ticket
      </span>

    </Link>

  );
};



// ============================================================
// LOGOUT
// ============================================================

const LogoutButton = ({
  open,
}: {
  open: boolean;
}) => {

  const { pinned } = useSidebar();

  const handleLogout =
    async () => {

      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      window.location.href =
        "/sign-in";
    };


  return (

    <button
      onClick={handleLogout}
      title="Logout"

      className="
        flex
        items-center
        justify-start
        gap-2
        group/sidebar
        py-2
        px-2
        rounded-lg
        transition-colors
        w-full

        text-destructive

        hover:bg-destructive/10
      "
    >

      {/* Icon */}

      <FiLogOut
        className="
          h-5
          w-5
          shrink-0
        "
      />


      {/* Text */}

      <span
        className={`
          text-sm
          font-medium
          text-destructive
          whitespace-nowrap
          overflow-hidden
          transition-all
          duration-300
          ease-in-out

          ${
            open || pinned
              ? "max-w-[180px] opacity-100"
              : "max-w-0 opacity-0"
          }

          md:group-hover/nav:max-w-[180px]
          md:group-hover/nav:opacity-100
        `}
      >
        Logout
      </span>

    </button>

  );
};