"use client";

import * as React from "react";
import Link from "next/link";
import { cn, Button } from "@ktblog/ui/components";
import { ChevronRight, ArrowLeft } from "lucide-react";

export interface Breadcrumb {
    label: string;
    href?: string;
}

export interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
    backHref?: string;
    backLabel?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    breadcrumbs,
    backHref,
    backLabel = "Back",
    actions,
    className,
}: PageHeaderProps) {
    return (
        <header
            className={cn(
                "bg-transparent border-b border-zinc-200 dark:border-zinc-700",
                className
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-1 text-sm mb-3">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && (
                                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                                )}
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-zinc-900 dark:text-primary font-medium">
                                        {crumb.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                {/* Back Link */}
                {backHref && (
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-3"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </Link>
                )}

                {/* Title and Actions Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

// Quick action buttons commonly used in headers
export function PageHeaderButton({
    children,
    variant = "default",
    icon,
    ...props
}: React.ComponentProps<typeof Button> & { icon?: React.ReactNode }) {
    return (
        <Button variant={variant} {...props}>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </Button>
    );
}

export default PageHeader;
