"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "../../contexts/auth-context";
import { AuthLayout } from "../../components/auth-layout";
import { Input, Button, Checkbox } from "@digibit/ui/components";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

// Form validation types
interface FormErrors {
    email?: string;
    password?: string;
}

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isLoading, isAuthenticated, error, clearError } =
        useAuthContext();

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect URL from query params
    const redirectUrl = searchParams.get("redirect") || "/";

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push(redirectUrl);
        }
    }, [isAuthenticated, router, redirectUrl]);

    // Clear auth errors when form changes
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [email, password]); // eslint-disable-line react-hooks/exhaustive-deps

    // Validate form
    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        // Email validation
        if (!email.trim()) {
            errors.email = "Email is required";
        } else if (!EMAIL_REGEX.test(email)) {
            errors.email = "Please enter a valid email address";
        }

        // Password validation
        if (!password) {
            errors.password = "Password is required";
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setFormErrors({});
        clearError();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await login({
                email: email.trim(),
                password,
                rememberMe,
            });
            // Redirect is handled by the AuthProvider
        } catch {
            // Error is set in the context
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    const isFormLoading = isLoading || isSubmitting;

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your admin account"
            showBackToLogin={false}
        >
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

                {/* Email field */}
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Email address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setFormErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="admin@globaldigibit.com"
                        disabled={isFormLoading}
                        leftIcon={<Mail className="w-5 h-5" />}
                        autoFocus
                        className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {formErrors.email}
                        </p>
                    )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setFormErrors((prev) => ({ ...prev, password: undefined }));
                            }}
                            placeholder="Enter your password"
                            disabled={isFormLoading}
                            leftIcon={<Lock className="w-5 h-5" />}
                            className={formErrors.password ? "border-red-500" : ""}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {formErrors.password && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {formErrors.password}
                        </p>
                    )}
                </div>

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            checked={rememberMe}
                            onCheckedChange={(checked) =>
                                setRememberMe(checked as boolean)
                            }
                            disabled={isFormLoading}
                        />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            Remember me
                        </span>
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    disabled={isFormLoading}
                    className="w-full"
                >
                    {isFormLoading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {isFormLoading ? "Signing in..." : "Sign in"}
                </Button>

                {/* Help text */}
                <div className="text-center">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Need access?{" "}
                        <a
                            href="mailto:admin@globaldigibit.com"
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Contact administrator
                        </a>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
