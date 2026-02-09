"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "../../components/auth-layout";
import { Input, Button } from "@digibit/ui/components";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "Contains number", test: (p) => /[0-9]/.test(p) },
    { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const getPasswordStrength = (password: string): number => {
        const passedRequirements = passwordRequirements.filter((req) =>
            req.test(password)
        ).length;
        return (passedRequirements / passwordRequirements.length) * 100;
    };

    const getStrengthColor = (strength: number): string => {
        if (strength < 40) return "bg-red-500";
        if (strength < 60) return "bg-orange-500";
        if (strength < 80) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthLabel = (strength: number): string => {
        if (strength < 40) return "Weak";
        if (strength < 60) return "Fair";
        if (strength < 80) return "Good";
        return "Strong";
    };

    const validateForm = (): boolean => {
        if (!newPassword) {
            setError("Password is required");
            return false;
        }

        const allRequirementsMet = passwordRequirements.every((req) =>
            req.test(newPassword)
        );
        if (!allRequirementsMet) {
            setError("Password does not meet all requirements");
            return false;
        }

        if (!confirmPassword) {
            setError("Please confirm your password");
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Simulate success
            setIsSuccess(true);

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError("Failed to update password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const strength = getPasswordStrength(newPassword);

    return (
        <AuthLayout
            title="Update Password"
            subtitle="Create a new strong password for your account"
            showBackToLogin={true}
        >
            {isSuccess ? (
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                    Password updated successfully!
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                    Redirecting to login page...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error display */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* New password field */}
                    <div className="space-y-2">
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            New Password
                        </label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError("");
                                }}
                                placeholder="Enter new password"
                                disabled={isLoading}
                                leftIcon={<Lock className="w-5 h-5" />}
                                autoFocus
                                className={error ? "border-red-500" : ""}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                tabIndex={-1}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Password strength indicator */}
                        {newPassword && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-600 dark:text-zinc-400">
                                        Password strength:
                                    </span>
                                    <span className={`font-medium ${strength < 40 ? "text-red-500" :
                                            strength < 60 ? "text-orange-500" :
                                                strength < 80 ? "text-yellow-500" :
                                                    "text-green-500"
                                        }`}>
                                        {getStrengthLabel(strength)}
                                    </span>
                                </div>
                                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`}
                                        style={{ width: `${strength}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm password field */}
                    <div className="space-y-2">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError("");
                                }}
                                placeholder="Confirm new password"
                                disabled={isLoading}
                                leftIcon={<Lock className="w-5 h-5" />}
                                className={error ? "border-red-500" : ""}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Password requirements */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                            Password must contain:
                        </p>
                        <ul className="space-y-2">
                            {passwordRequirements.map((req, index) => {
                                const isMet = req.test(newPassword);
                                return (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        {isMet ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-zinc-400" />
                                        )}
                                        <span
                                            className={
                                                isMet
                                                    ? "text-green-700 dark:text-green-400"
                                                    : "text-zinc-600 dark:text-zinc-400"
                                            }
                                        >
                                            {req.label}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Submit button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {isLoading ? "Updating password..." : "Update password"}
                    </Button>
                </form>
            )}
        </AuthLayout>
    );
}
