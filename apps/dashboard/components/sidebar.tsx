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
    X,
    ChevronLeft,
    ChevronDown,
    Calendar,
    ArrowRightLeft,
    ShoppingBag,
    Receipt,
    Projector,
    Globe,
    Star,
    Store,
    Truck,
    TrendingUp,
    Phone,
    UserCog,
    Building2,
    Briefcase,
    BookOpen,
    Quote,
    Languages,
    HelpCircle,
    ClipboardList,
    ScrollText,
    Ticket,
    Package,
    Zap,
    Award,
    LayoutList,
} from "lucide-react";
import { cn } from "@ktblog/ui/components";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

// ─── Navigation Structure ─────────────────────────────────────────────────────

const navSections: NavSection[] = [
    {
        title: "Overview",
        items: [
            { label: "Dashboard", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
            { label: "Analytics", href: "/analytics", icon: <BarChart className="h-5 w-5" /> },
            { label: "Marketplace Stats", href: "/analytics/marketplace", icon: <TrendingUp className="h-5 w-5" /> },
        ],
    },
    {
        title: "Content",
        items: [
            { label: "Posts", href: "/blog", icon: <FileText className="h-5 w-5" /> },
            { label: "Categories", href: "/categories", icon: <Folder className="h-5 w-5" /> },
            { label: "Tags", href: "/tags", icon: <Tag className="h-5 w-5" /> },
            { label: "Calendar", href: "/calendar", icon: <Calendar className="h-5 w-5" /> },
            { label: "Media", href: "/media", icon: <ImageIcon className="h-5 w-5" /> },
            { label: "Comments", href: "/comments", icon: <MessageCircle className="h-5 w-5" /> },
        ],
    },
    {
        title: "Products & Services",
        items: [
            { label: "Digital Products", href: "/products/digital", icon: <ShoppingBag className="h-5 w-5" /> },
            { label: "Web Templates", href: "/products/templates", icon: <Globe className="h-5 w-5" /> },
            { label: "Presentations", href: "/presentations", icon: <Projector className="h-5 w-5" /> },
            { label: "Solutions", href: "/solutions", icon: <BookOpen className="h-5 w-5" /> },
            { label: "Services", href: "/services", icon: <Briefcase className="h-5 w-5" /> },
            { label: "Service Catalog", href: "/service-catalog", icon: <LayoutList className="h-5 w-5" /> },
        ],
    },
    {
        title: "Marketplace",
        items: [
            { label: "Orders", href: "/orders", icon: <Receipt className="h-5 w-5" /> },
            { label: "Delivery", href: "/delivery", icon: <Truck className="h-5 w-5" /> },
            { label: "Reviews", href: "/reviews", icon: <Star className="h-5 w-5" /> },
            { label: "Sellers", href: "/sellers", icon: <Store className="h-5 w-5" /> },
        ],
    },
    {
        title: "Promotions",
        items: [
            { label: "Coupons", href: "/promotions/coupons", icon: <Ticket className="h-5 w-5" /> },
            { label: "Bundles", href: "/promotions/bundles", icon: <Package className="h-5 w-5" /> },
            { label: "Flash Sales", href: "/promotions/flash-sales", icon: <Zap className="h-5 w-5" /> },
            { label: "Loyalty", href: "/promotions/loyalty", icon: <Award className="h-5 w-5" /> },
        ],
    },
    {
        title: "Community",
        items: [
            { label: "Newsletter", href: "/newsletter", icon: <Mail className="h-5 w-5" /> },
            { label: "Subscribers", href: "/subscribers", icon: <Users className="h-5 w-5" /> },
            { label: "Membership", href: "/membership", icon: <CreditCard className="h-5 w-5" /> },
            { label: "Contacts", href: "/contacts", icon: <Phone className="h-5 w-5" /> },
            { label: "Testimonials", href: "/testimony", icon: <Quote className="h-5 w-5" /> },
            { label: "FAQ", href: "/faq", icon: <HelpCircle className="h-5 w-5" /> },
        ],
    },
    {
        title: "Management",
        items: [
            { label: "Users", href: "/users", icon: <UserCog className="h-5 w-5" /> },
            { label: "Organizations", href: "/organizations", icon: <Building2 className="h-5 w-5" /> },
            { label: "Applications", href: "/applications", icon: <ClipboardList className="h-5 w-5" /> },
            { label: "Translations", href: "/translations", icon: <Languages className="h-5 w-5" /> },
        ],
    },
    {
        title: "System",
        items: [
            { label: "Redirects", href: "/redirects", icon: <ArrowRightLeft className="h-5 w-5" /> },
            { label: "Audit Logs", href: "/system/audit-logs", icon: <ScrollText className="h-5 w-5" /> },
            { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
        ],
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
    className?: string;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ className, mobileOpen, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(href);
    };

    const toggleSection = (title: string) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-primary/20 dark:border-primary/20 h-16">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logo/ktblog.png"
                        alt="KTBlog"
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
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {navSections.map((section) => {
                    const isSectionCollapsed = collapsedSections[section.title];

                    return (
                        <div key={section.title} className="mb-1">
                            {/* Section header */}
                            {!isCollapsed ? (
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="flex items-center justify-between w-full px-3 py-1.5 mt-2 first:mt-0 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                >
                                    <span>{section.title}</span>
                                    <ChevronDown
                                        className={cn(
                                            "h-3 w-3 transition-transform duration-200",
                                            isSectionCollapsed && "-rotate-90"
                                        )}
                                    />
                                </button>
                            ) : (
                                <div className="my-2 mx-2 border-t border-zinc-200 dark:border-zinc-700" />
                            )}

                            {/* Section items */}
                            {(!isSectionCollapsed || isCollapsed) && (
                                <div className="space-y-0.5">
                                    {section.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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
                                </div>
                            )}
                        </div>
                    );
                })}
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
