import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { LimelightNav } from "./components/limelight-nav";
import { AuthGuard } from "./components/auth-guard";
import { FeaturesProvider } from "./components/features-context";
import { HeaderActions } from "./components/header-actions";
import { Sidebar } from "./components/sidebar";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Veda",
  description: "Robot Management Platform",
  icons: { icon: "/logo.svg" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("g1_session")?.value;

  let isLoggedIn = false;
  let role = null;
  let tenantData = null;
  let requiresPasswordChange = false;

  if (token) {
    const session = await verifyToken(token);
    if (session) {
      isLoggedIn = true;
      role = session.role;
      requiresPasswordChange = session.requiresPasswordChange === true;

      const tenantApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
      if (tenantApiBase) {
        try {
          const res = await fetch(`${tenantApiBase}/tenant/profile`, { cache: "no-store" });
          if (res.ok) tenantData = await res.json();
        } catch (e) {
          console.warn("Tenant profile unavailable; continuing without tenant data.", e);
        }
      }
    }
  }

  const showRagUi = isLoggedIn && !requiresPasswordChange;
  const isPublicPage = !isLoggedIn || requiresPasswordChange;

  /*
   * KEY ARCHITECTURE: body is ALWAYS bg-background. Never change it.
   *
   * For the dashboard, we add a TRAY div (bg-sidebar = grey) that wraps
   * only the sidebar + content area. The main content inside it uses
   * bg-background + rounded-tl-2xl. The grey tray bleeds through the
   * rounded corner = visible curve. Everything inside the content area
   * still has bg-background as ancestor = all theme colors preserved.
   *
   * Main content is a flex sibling of the sidebar. When the sidebar
   * width animates (60px ↔ 300px), flexbox naturally pushes the content.
   * No separate animation needed.
   */

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="h-full bg-background text-foreground antialiased">
        <ThemeProvider>
          {showRagUi ? (
            /* Dashboard layout: grey tray → sidebar + curved content sheet */
            <div className="flex flex-col md:flex-row h-dvh overflow-hidden bg-sidebar">
              <Sidebar tenant={tenantData} role={role} />

              <div className="flex flex-col flex-1 min-h-0 md:rounded-tl-2xl bg-background overflow-hidden relative">
                <LimelightNav role={role} isLoggedIn={isLoggedIn} tenant={tenantData} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                  <AuthGuard>
                    <FeaturesProvider>
                      {children}
                    </FeaturesProvider>
                  </AuthGuard>
                </main>
              </div>
            </div>
          ) : (
            /* Public pages: no sidebar, no tray, body bg-background shows through */
            <div className="flex flex-col min-h-dvh relative">
              <ScrollProgress />
              <HeaderActions isLoggedIn={isLoggedIn} tenant={tenantData} />
              <main className="flex-1">
                <AuthGuard>
                  <FeaturesProvider>
                    {children}
                  </FeaturesProvider>
                </AuthGuard>
              </main>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
