"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Folder,
    Tag,
    Image as ImageIcon,
    MessageCircle,
    Mail,
    Users,
    CreditCard,
    BarChart,
    Settings,
    Menu,
    X,
    LogOut,
    ChevronLeft,
    Calendar,
    ArrowRightLeft,
    ShoppingBag,
    Receipt,
    Projector,
} from "lucide-react";
import { cn } from "@ktblog/ui/components";
import { useAuthContext } from "../contexts/auth-context";
import { useUser } from "../hooks/use-user";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/",
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        label: "Posts",
        href: "/blog",
        icon: <FileText className="h-5 w-5" />,
    },
    {
        label: "Calendar",
        href: "/calendar",
        icon: <Calendar className="h-5 w-5" />,
    },
    {
        label: "Categories",
        href: "/categories",
        icon: <Folder className="h-5 w-5" />,
    },
    {
        label: "Tags",
        href: "/tags",
        icon: <Tag className="h-5 w-5" />,
    },
    {
        label: "Media",
        href: "/media",
        icon: <ImageIcon className="h-5 w-5" />,
    },
    {
        label: "Digital Products",
        href: "/products/digital",
        icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
        label: "Presentations",
        href: "/presentations",
        icon: <Projector className="h-5 w-5" />,
    },
    {
        label: "Solutions",
        href: "/solutions",
        icon: <FileText className="h-5 w-5" />,
    },
    {
        label: "Orders",
        href: "/orders",
        icon: <Receipt className="h-5 w-5" />,
    },
    {
        label: "Comments",
        href: "/comments",
        icon: <MessageCircle className="h-5 w-5" />,
    },
    {
        label: "Newsletter",
        href: "/newsletter",
        icon: <Mail className="h-5 w-5" />,
    },
    {
        label: "Subscribers",
        href: "/subscribers",
        icon: <Users className="h-5 w-5" />,
    },
    {
        label: "Membership",
        href: "/membership",
        icon: <CreditCard className="h-5 w-5" />,
    },
    {
        label: "Redirects",
        href: "/redirects",
        icon: <ArrowRightLeft className="h-5 w-5" />,
    },
    {
        label: "Analytics",
        href: "/analytics",
        icon: <BarChart className="h-5 w-5" />,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
    },
];

interface SidebarProps {
    className?: string;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ className, mobileOpen, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(href);
    };


    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-primary/20 dark:border-primary/20 h-16">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logo/ktblog.png"
                        alt="Global Digitalbit"
                        width={150}
                        height={150}
                        className="rounded-lg"
                    />

                </Link>
                {/* Desktop collapse button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronLeft
                        className={cn(
                            "h-4 w-4 text-zinc-500 transition-transform",
                            isCollapsed && "rotate-180"
                        )}
                    />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive(item.href)
                                ? "bg-primary text-white"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                        )}
                        title={isCollapsed ? item.label : undefined}
                    >
                        {item.icon}
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-800 transform transition-transform duration-300 ease-in-out border-r border-zinc-200 dark:border-zinc-700",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                    </button>
                </div>
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 h-screen sticky top-0 transition-all duration-300",
                    isCollapsed ? "w-[72px]" : "w-64",
                    className
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}

export default Sidebar;
