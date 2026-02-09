"use client";

import * as React from "react";
import { cn } from "@ktblog/ui/components";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
}

interface ToastProps extends Toast {
    onDismiss: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        titleColor: "text-emerald-800 dark:text-emerald-300",
    },
    error: {
        icon: XCircle,
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        iconColor: "text-red-600 dark:text-red-400",
        titleColor: "text-red-800 dark:text-red-300",
    },
    warning: {
        icon: AlertTriangle,
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
        iconColor: "text-amber-600 dark:text-amber-400",
        titleColor: "text-amber-800 dark:text-amber-300",
    },
    info: {
        icon: Info,
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        iconColor: "text-blue-600 dark:text-blue-400",
        titleColor: "text-blue-800 dark:text-blue-300",
    },
};

function ToastItem({ id, type, title, description, duration = 5000, onDismiss }: ToastProps) {
    const config = toastConfig[type];
    const IconComponent = config.icon;

    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onDismiss(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onDismiss]);

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm w-full animate-in slide-in-from-right-full duration-300",
                config.bgColor,
                config.borderColor
            )}
            role="alert"
        >
            <IconComponent className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconColor)} />
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", config.titleColor)}>{title}</p>
                {description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {description}
                    </p>
                )}
            </div>
            <button
                onClick={() => onDismiss(id)}
                className="flex-shrink-0 p-1 rounded hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4 text-zinc-500" />
            </button>
        </div>
    );
}

// Toast Container Component
export interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

export function ToastContainer({
    toasts,
    onDismiss,
    position = "top-right",
}: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div
            className={cn(
                "fixed z-50 flex flex-col gap-2",
                positionClasses[position]
            )}
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} {...toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

// Toast Context and Hook
interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = React.useCallback(
        (title: string, description?: string) => {
            addToast({ type: "success", title, description });
        },
        [addToast]
    );

    const error = React.useCallback(
        (title: string, description?: string) => {
            addToast({ type: "error", title, description });
        },
        [addToast]
    );

    const warning = React.useCallback(
        (title: string, description?: string) => {
            addToast({ type: "warning", title, description });
        },
        [addToast]
    );

    const info = React.useCallback(
        (title: string, description?: string) => {
            addToast({ type: "info", title, description });
        },
        [addToast]
    );

    const value = React.useMemo(
        () => ({
            toasts,
            addToast,
            removeToast,
            success,
            error,
            warning,
            info,
        }),
        [toasts, addToast, removeToast, success, error, warning, info]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export default ToastContainer;
