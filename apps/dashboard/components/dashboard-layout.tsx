"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

// Routes that should not show the sidebar
const noSidebarRoutes = ["/login", "/forgot-password", "/reset-password", "/verify-otp", "/update-password"];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

import { Header } from "./header";

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    // Check if current route should hide sidebar
    const hideSidebar = noSidebarRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (hideSidebar) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            <div className="flex-1 flex flex-col min-w-0 lg:pl-0 transition-all duration-300">
                <Header onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}

export default DashboardLayout;
