"use client";

import * as React from "react";
import {
    Input,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    cn,
} from "@digibit/ui/components";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { UserStatus, UserRole } from "../../types/user";

export interface UserFormData {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
    status: UserStatus;
    password?: string;
    confirmPassword?: string;
}

interface UserFormProps {
    initialData?: Partial<UserFormData>;
    onSubmit: (data: UserFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: "create" | "edit";
}

const roleOptions = [
    { value: UserRole.SUPER_ADMIN, label: "Super Administrator" },
    { value: UserRole.ADMIN, label: "Administrator" },
    { value: UserRole.EDITOR, label: "Editor" },
    { value: UserRole.VIEWER, label: "Viewer" },
];

const statusOptions = [
    { value: UserStatus.ACTIVE, label: "Active" },
    { value: UserStatus.INACTIVE, label: "Inactive" },
    { value: UserStatus.PENDING, label: "Pending" },
    { value: UserStatus.SUSPENDED, label: "Suspended" },
];

export function UserForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = "create",
}: UserFormProps) {
    const [formData, setFormData] = React.useState<UserFormData>({
        email: initialData?.email || "",
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        roles: initialData?.roles || [UserRole.VIEWER],
        status: initialData?.status || UserStatus.PENDING,
        password: "",
        confirmPassword: "",
        ...(initialData?.id && { id: initialData.id }),
    });

    const [showPassword, setShowPassword] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleChange = (
        field: keyof UserFormData,
        value: any
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (mode === "create") {
            if (!formData.password) {
                newErrors.password = "Password is required";
            } else if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        placeholder="John"
                        className={cn(errors.firstName && "border-red-500")}
                        disabled={isLoading}
                    />
                    {errors.firstName && (
                        <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        placeholder="Doe"
                        className={cn(errors.lastName && "border-red-500")}
                        disabled={isLoading}
                    />
                    {errors.lastName && (
                        <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john.doe@example.com"
                    className={cn(errors.email && "border-red-500")}
                    disabled={isLoading || mode === "edit"}
                />
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={formData.roles[0]}
                        onValueChange={(value) => handleChange("roles", [value as UserRole])}
                        disabled={isLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roleOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Status <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange("status", value as UserStatus)}
                        disabled={isLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {mode === "create" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                placeholder="••••••••"
                                className={cn(errors.password && "border-red-500")}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            placeholder="••••••••"
                            className={cn(errors.confirmPassword && "border-red-500")}
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {mode === "create" ? "Create User" : "Update User"}
                </Button>
            </div>
        </form>
    );
}

export default UserForm;
