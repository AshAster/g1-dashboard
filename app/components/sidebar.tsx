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
import {
  AceternitySidebar,
  SidebarBody,
  SidebarLink,
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

          {/* Brand */}

          <div className="flex items-center justify-between gap-1">
            <BrandLogo
              open={open}
            />
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

const BrandLogo = ({
  open,
}: {
  open: boolean;
}) => {

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
            open
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
            open
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
            open
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