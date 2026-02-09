"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Button,
    cn,
} from "@digibit/ui/components";
import { X, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    showCloseButton?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
};

export function Modal({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    size = "md",
    showCloseButton = true,
    className,
}: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    sizeClasses[size],
                    "bg-white border-zinc-200 shadow-2xl rounded-3xl",
                    className
                )}
            >
                {(title || showCloseButton) && (
                    <DialogHeader className="border-b border-zinc-50 pb-4 mb-2">
                        {title && <DialogTitle className="text-zinc-900 font-black tracking-tight text-xl">{title}</DialogTitle>}
                        {description && <DialogDescription className="text-zinc-400 font-medium">{description}</DialogDescription>}
                    </DialogHeader>
                )}

                <div className="py-2">{children}</div>

                {footer && <DialogFooter className="border-t border-zinc-50 pt-4">{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
}

// Confirmation Modal Variant
export interface ConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info" | "success";
    isLoading?: boolean;
}

const variantConfig = {
    danger: {
        icon: XCircle,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        buttonVariant: "destructive" as const,
    },
    warning: {
        icon: AlertTriangle,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        buttonVariant: "default" as const,
    },
    info: {
        icon: Info,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        buttonVariant: "default" as const,
    },
    success: {
        icon: CheckCircle,
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        buttonVariant: "default" as const,
    },
};

export function ConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    isLoading = false,
}: ConfirmModalProps) {
    const config = variantConfig[variant];
    const IconComponent = config.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white border-zinc-200 shadow-2xl rounded-3xl">
                <div className="flex flex-col items-center text-center py-4">
                    <div
                        className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center mb-4",
                            config.iconBg
                        )}
                    >
                        <IconComponent className={cn("h-6 w-6", config.iconColor)} />
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight mb-2">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm text-zinc-400 font-medium mb-6 px-4">
                            {description}
                        </p>
                    )}
                </div>
                <DialogFooter className="flex gap-3 sm:gap-3 py-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 h-11 rounded-xl font-bold border-zinc-200 hover:bg-zinc-50"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={config.buttonVariant}
                        onClick={onConfirm}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="flex-1 h-11 rounded-xl font-bold shadow-lg"
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Form Modal Variant (for create/edit forms)
export interface FormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function FormModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    size = "lg",
}: FormModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    sizeClasses[size],
                    "bg-white border-zinc-200 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto"
                )}
            >
                <DialogHeader className="border-b border-zinc-50 pb-4 mb-4">
                    <DialogTitle className="text-zinc-900 font-black tracking-tight text-xl">{title}</DialogTitle>
                    {description && <DialogDescription className="text-zinc-400 font-medium">{description}</DialogDescription>}
                </DialogHeader>
                <div className="py-2">{children}</div>
            </DialogContent>
        </Dialog>
    );
}

export default Modal;
