"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

export interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    showBackToLogin?: boolean;
}

// Get current year - client-side only to avoid hydration issues
const getCurrentYear = (): number => {
    return new Date().getFullYear();
};

export function AuthLayout({
    children,
    title,
    subtitle,
    showBackToLogin = false,
}: AuthLayoutProps) {
    const [year, setYear] = React.useState<number>(2024);

    // Set year on client-side only
    React.useEffect(() => {
        setYear(getCurrentYear());
    }, []);
    return (
        <div className="min-h-screen bg-white flex">
            {/* Left side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
                        alt="African business consultation"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40" />
                </div>

                {/* Content overlay */}
                <div className="relative z-10 p-12 flex flex-col justify-between text-white">
                    {/* Logo and title */}
                    <div>
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo/ktblog.png"
                                alt="Global Digitalbit"
                                width={150}
                                height={150}
                                className="rounded-lg"
                            />

                        </div>
                    </div>

                    {/* Feature highlights */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Secure Access
                                </h3>
                                <p className="text-blue-200 text-sm">
                                    Enterprise-grade security with JWT
                                    authentication
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Real-time Analytics
                                </h3>
                                <p className="text-blue-200 text-sm">
                                    Monitor products and track performance
                                    metrics
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Centralized Management
                                </h3>
                                <p className="text-blue-200 text-sm">
                                    Manage all digital solutions from one place
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div>
                        <p className="text-blue-200 text-sm">
                            &copy; {year} Global Digitalbit Limited. All rights
                            reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form content */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo/ktblog.png"
                                alt="Global Digitalbit"
                                width={150}
                                height={150}
                                className="rounded-lg"
                            />

                        </div>
                    </div>

                    {/* Form card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-zinc-200">
                        {/* Back to login link */}
                        {showBackToLogin && (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-primary transition-colors mb-6"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Back to login
                            </Link>
                        )}

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-zinc-900">
                                {title}
                            </h2>
                            <p className="text-zinc-500 mt-2">
                                {subtitle}
                            </p>
                        </div>


                        {/* Form content */}
                        {children}
                    </div>

                    {/* Security note */}
                    {/* <div className="mt-6 text-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            Secured with 256-bit encryption
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
