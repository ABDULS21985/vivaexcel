"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useNewsletterSubscription } from "@/hooks/use-posts";

export function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const newsletter = useNewsletterSubscription();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            await newsletter.mutateAsync({ email: email.trim() });
            setIsSubmitted(true);
            setEmail("");
        } catch {
            // Error handled by mutation state
        }
    };

    return (
        <section className="w-full py-20 md:py-28 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#1E4DB7] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Icon */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center mb-8"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <Mail className="h-10 w-10 text-white" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                    >
                        Stay Ahead with{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#E86A1D]">
                            Expert Insights
                        </span>
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-white/80 mb-10"
                    >
                        Subscribe to our newsletter and receive the latest
                        articles, industry insights, and exclusive content
                        directly in your inbox.
                    </motion.p>

                    {/* Success State */}
                    {isSubmitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                You&apos;re all set!
                            </h3>
                            <p className="text-white/70">
                                Thanks for subscribing. Check your inbox for a
                                confirmation email.
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-sm text-white/50 hover:text-white/80 transition-colors mt-2"
                            >
                                Subscribe another email
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Newsletter Form */}
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                onSubmit={handleSubmit}
                                className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
                            >
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F59A23]/20 to-[#E86A1D]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="Enter your email address"
                                        className="relative w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-[#F59A23]/50 focus:bg-white/15 transition-all duration-300"
                                        required
                                        disabled={newsletter.isPending}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={newsletter.isPending}
                                    className="px-8 py-4 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] hover:from-[#E86A1D] hover:to-[#F59A23] text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#F59A23]/25 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-[140px]"
                                >
                                    {newsletter.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Subscribing...
                                        </>
                                    ) : (
                                        "Subscribe"
                                    )}
                                </button>
                            </motion.form>

                            {/* Error Message */}
                            {newsletter.isError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center gap-2 mt-4 text-red-300"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">
                                        Something went wrong. Please try again.
                                    </span>
                                </motion.div>
                            )}
                        </>
                    )}

                    {/* Trust Message */}
                    {!isSubmitted && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="text-sm text-white/60 mt-6"
                        >
                            Join 5,000+ professionals. No spam, unsubscribe
                            anytime.
                        </motion.p>
                    )}
                </div>
            </div>
        </section>
    );
}
