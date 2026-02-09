"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@ktblog/ui/components";
import {
    Ticket,
    Zap,
    Package,
    Crown,
    BarChart3,
} from "lucide-react";

const promotionNavItems = [
    {
        label: "Coupons",
        href: "/promotions/coupons",
        icon: Ticket,
    },
    {
        label: "Flash Sales",
        href: "/promotions/flash-sales",
        icon: Zap,
    },
    {
        label: "Bundles",
        href: "/promotions/bundles",
        icon: Package,
    },
    {
        label: "Loyalty",
        href: "/promotions/loyalty",
        icon: Crown,
    },
    {
        label: "Analytics",
        href: "/promotions/analytics",
        icon: BarChart3,
    },
];

export default function PromotionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen">
            {/* Sub-navigation tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-hide">
                        {promotionNavItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                        isActive
                                            ? "border-primary text-primary"
                                            : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600",
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Page content */}
            {children}
        </div>
    );
}
