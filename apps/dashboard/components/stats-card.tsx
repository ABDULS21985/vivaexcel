"use client";

import * as React from "react";
import { cn } from "@digibit/ui/components";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        label?: string;
        isPositive?: boolean;
    };
    className?: string;
    variant?: "default" | "primary" | "success" | "warning" | "danger";
}

const variantStyles = {
    default: {
        container: "bg-white dark:bg-zinc-800",
        icon: "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
        value: "text-zinc-900 dark:text-white",
    },
    primary: {
        container: "bg-primary/5 dark:bg-primary/10 border-primary/20",
        icon: "bg-primary/10 text-primary",
        value: "text-primary",
    },
    success: {
        container: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
        icon: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        value: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
        container: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
        icon: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
        value: "text-amber-600 dark:text-amber-400",
    },
    danger: {
        container: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
        icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
        value: "text-red-600 dark:text-red-400",
    },
};

export function StatsCard({
    title,
    value,
    description,
    icon,
    trend,
    className,
    variant = "default",
}: StatsCardProps) {
    const styles = variantStyles[variant];

    const getTrendIcon = () => {
        if (!trend) return null;

        if (trend.value > 0) {
            return <TrendingUp className="h-4 w-4" />;
        } else if (trend.value < 0) {
            return <TrendingDown className="h-4 w-4" />;
        }
        return <Minus className="h-4 w-4" />;
    };

    const getTrendColor = () => {
        if (!trend) return "";

        if (trend.isPositive !== undefined) {
            return trend.isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400";
        }

        if (trend.value > 0) {
            return "text-emerald-600 dark:text-emerald-400";
        } else if (trend.value < 0) {
            return "text-red-600 dark:text-red-400";
        }
        return "text-zinc-500 dark:text-zinc-400";
    };

    return (
        <div
            className={cn(
                "rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 transition-shadow hover:shadow-md",
                styles.container,
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {title}
                    </p>
                    <p className={cn("text-2xl font-bold", styles.value)}>{value}</p>
                    {description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {description}
                        </p>
                    )}
                </div>
                {icon && (
                    <div
                        className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            styles.icon
                        )}
                    >
                        {icon}
                    </div>
                )}
            </div>

            {trend && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                    <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
                        {getTrendIcon()}
                        <span className="font-medium">
                            {trend.value > 0 ? "+" : ""}
                            {trend.value}%
                        </span>
                        {trend.label && (
                            <span className="text-zinc-500 dark:text-zinc-400 ml-1">
                                {trend.label}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StatsCard;
