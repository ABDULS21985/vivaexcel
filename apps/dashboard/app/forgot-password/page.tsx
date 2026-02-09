"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "../../components/auth-layout";
import { Input, Button } from "@ktblog/ui/components";
import { Mail, Loader2 } from "lucide-react";

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validateEmail = (email: string): boolean => {
        if (!email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!EMAIL_REGEX.test(email)) {
            setError("Please enter a valid email address");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateEmail(email)) {
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Simulate success
            setIsSuccess(true);

            // Redirect to OTP verification page after 2 seconds
            setTimeout(() => {
                router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err) {
            setError("Failed to send reset code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Forgot Password?"
            subtitle="Enter your email to receive a verification code"
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
                                    Verification code sent!
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                    Please check your email for the 6-digit
                                    verification code. Redirecting...
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
                                setError("");
                            }}
                            placeholder="admin@drkatangablog.com"
                            disabled={isLoading}
                            leftIcon={<Mail className="w-5 h-5" />}
                            autoFocus
                            className={error ? "border-red-500" : ""}
                        />
                    </div>

                    {/* Info text */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            We'll send a 6-digit verification code to your email
                            address. This code will be valid for 10 minutes.
                        </p>
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
                        {isLoading ? "Sending code..." : "Send verification code"}
                    </Button>

                    {/* Help text */}
                    <div className="text-center">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Remember your password?{" "}
                            <Link
                                href="/login"
                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}
