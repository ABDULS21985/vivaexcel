import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ToastProvider } from "@/components/toast";

const aptos = localFont({
  src: [
    {
      path: "../fonts/Aptos-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Aptos-Light-Italic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../fonts/Aptos.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Aptos-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/Aptos-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Aptos-SemiBold-Italic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../fonts/Aptos-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Aptos-Bold-Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-aptos",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "KatangaBlog \u2014 Dashboard",
    template: "%s | KatangaBlog Dashboard"
  },
  description: "Admin dashboard for KatangaBlog. Manage posts, subscribers, memberships, and analytics.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  metadataBase: new URL('https://dashboard.drkatangablog.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${aptos.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <ToastProvider>
              <DashboardLayout>
                {children}
              </DashboardLayout>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
