"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "../../components/auth-layout";
import { Button, OtpInput } from "@ktblog/ui/components";
import { Loader2 } from "lucide-react";

export default function VerifyOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleOtpComplete = async (value: string) => {
        setError("");
        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Simulate validation
            if (value === "123456") {
                // Success - redirect to update password
                router.push(`/update-password?token=${value}`);
            } else {
                setError("Invalid verification code. Please try again.");
                setOtp("");
            }
        } catch (err) {
            setError("Failed to verify code. Please try again.");
            setOtp("");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setError("");
        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Reset timer
            setResendTimer(60);
            setCanResend(false);
            setOtp("");

            // Show success message (you could use a toast here)
            alert("Verification code resent successfully!");
        } catch (err) {
            setError("Failed to resend code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Verify Your Email"
            subtitle={
                email
                    ? `Enter the 6-digit code sent to ${email}`
                    : "Enter the 6-digit code sent to your email"
            }
            showBackToLogin={true}
        >
            <div className="space-y-6">
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

                {/* OTP Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 text-center">
                        Verification Code
                    </label>
                    <OtpInput
                        length={6}
                        value={otp}
                        onChange={setOtp}
                        onComplete={handleOtpComplete}
                        disabled={isLoading}
                        error={!!error}
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                        Enter the 6-digit code from your email
                    </p>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying code...</span>
                    </div>
                )}

                {/* Resend code */}
                <div className="text-center space-y-2">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Didn't receive the code?
                    </p>
                    {canResend ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleResend}
                            disabled={isLoading}
                            className="w-full"
                        >
                            Resend code
                        </Button>
                    ) : (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Resend code in{" "}
                            <span className="font-semibold text-primary">
                                {resendTimer}s
                            </span>
                        </p>
                    )}
                </div>

                {/* Help text */}
                <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Wrong email?{" "}
                        <Link
                            href="/forgot-password"
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Go back
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
