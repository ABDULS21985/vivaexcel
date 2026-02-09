"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Blocks, Activity, Zap, Users, type LucideIcon } from "lucide-react";
import { Button } from "@digibit/ui/components";
import { products } from "@/data/products";

/* ------------------------------------------------------------------ */
/* Product icon configuration with orbital positioning                  */
/* ------------------------------------------------------------------ */

interface ProductOrbit {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    angle: number;
    radius: number;
    speed: number;
    size: number;
}

const productOrbits: ProductOrbit[] = [
    { id: "digigate", name: "DigiGate", icon: Shield, color: "#1E4DB7", angle: 0, radius: 180, speed: 0.015, size: 56 },
    { id: "digitrust", name: "DigiTrust", icon: Blocks, color: "#F59A23", angle: 72, radius: 200, speed: 0.012, size: 52 },
    { id: "digitrack", name: "DigiTrack", icon: Activity, color: "#E86A1D", angle: 144, radius: 170, speed: 0.018, size: 48 },
    { id: "trustmehub", name: "TrustMeHub", icon: Zap, color: "#10B981", angle: 216, radius: 190, speed: 0.014, size: 54 },
    { id: "boacrm", name: "BoaCRM", icon: Users, color: "#6366F1", angle: 288, radius: 160, speed: 0.016, size: 50 },
];

/* ------------------------------------------------------------------ */
/* Connection line component                                            */
/* ------------------------------------------------------------------ */

interface ConnectionLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    opacity: number;
}

/* ------------------------------------------------------------------ */
/* Main Constellation Hero Component                                    */
/* ------------------------------------------------------------------ */

export function ProductConstellationHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [orbits, setOrbits] = useState(productOrbits);
    const animationRef = useRef<number>(0);
    const [isHovered, setIsHovered] = useState<string | null>(null);

    // Handle mouse movement for parallax effect
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePos({ x: x * 30, y: y * 30 });
    }, []);

    // Animation loop for orbital movement
    useEffect(() => {
        let angles = productOrbits.map(p => p.angle * (Math.PI / 180));

        const animate = () => {
            angles = angles.map((angle, i) => angle + productOrbits[i].speed);
            setOrbits(prev => prev.map((orbit, i) => ({
                ...orbit,
                angle: (angles[i] * 180 / Math.PI) % 360
            })));
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, []);

    // Mouse event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove]);

    // Draw connection lines on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        ctx.clearRect(0, 0, rect.width, rect.height);

        // Calculate positions
        const positions = orbits.map(orbit => {
            const angleRad = orbit.angle * (Math.PI / 180);
            return {
                x: centerX + Math.cos(angleRad) * orbit.radius + mousePos.x * (orbit.radius / 200),
                y: centerY + Math.sin(angleRad) * orbit.radius + mousePos.y * (orbit.radius / 200),
                color: orbit.color
            };
        });

        // Draw connections between adjacent products
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        positions.forEach((pos, i) => {
            const nextPos = positions[(i + 1) % positions.length];
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(nextPos.x, nextPos.y);
            ctx.stroke();
        });

        // Draw connections to center
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        positions.forEach(pos => {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        });

    }, [orbits, mousePos]);

    // Calculate icon positions
    const getIconPosition = (orbit: ProductOrbit) => {
        const angleRad = orbit.angle * (Math.PI / 180);
        const x = Math.cos(angleRad) * orbit.radius + mousePos.x * (orbit.radius / 200);
        const y = Math.sin(angleRad) * orbit.radius + mousePos.y * (orbit.radius / 200);
        return { x, y };
    };

    return (
        <section
            ref={containerRef}
            className="relative w-full min-h-[90vh] bg-gradient-to-br from-[#0a1628] via-[#0f1e36] to-[#1a0f2e] overflow-hidden"
        >
            {/* Animated background elements */}
            <div className="absolute inset-0">
                {/* Star field effect */}
                <div className="absolute inset-0 opacity-40">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                                opacity: 0.3 + Math.random() * 0.7,
                            }}
                        />
                    ))}
                </div>

                {/* Gradient orbs */}
                <div
                    className="absolute w-[600px] h-[600px] rounded-full animate-float-slow opacity-20"
                    style={{
                        background: "radial-gradient(circle, #1E4DB7 0%, transparent 70%)",
                        top: "-20%",
                        right: "-10%",
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full animate-float2 opacity-15"
                    style={{
                        background: "radial-gradient(circle, #6366F1 0%, transparent 70%)",
                        bottom: "-10%",
                        left: "-5%",
                    }}
                />
            </div>

            {/* Connection lines canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ width: "100%", height: "100%" }}
            />

            {/* Main content container */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center min-h-[90vh] py-16">
                {/* Left: Content */}
                <div className="lg:w-1/2 text-center lg:text-left space-y-6 animate-fade-in-up">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                        <span className="text-xs md:text-sm font-bold tracking-wider text-white/70 uppercase">
                            Product Ecosystem
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        <span className="text-white">
                            Five Powerful Products.
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange via-secondary-yellow to-accent-orange animate-gradient-shift">
                            One Digital Future.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mx-0">
                        From API governance to blockchain credentials, asset tracking to
                        instant verification — our enterprise-grade products power digital
                        transformation at national scale.
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                        <div className="text-center lg:text-left">
                            <div className="text-2xl md:text-3xl font-bold text-white">99.99%</div>
                            <div className="text-xs text-white/50">Uptime SLA</div>
                        </div>
                        <div className="text-center lg:text-left">
                            <div className="text-2xl md:text-3xl font-bold text-accent-orange">&lt;10ms</div>
                            <div className="text-xs text-white/50">Response Time</div>
                        </div>
                        <div className="text-center lg:text-left">
                            <div className="text-2xl md:text-3xl font-bold text-white">100K+</div>
                            <div className="text-xs text-white/50">TPS Capacity</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-accent-orange hover:bg-accent-red text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
                        >
                            <Link href="/contact">
                                Request Demo
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <a
                            href="#products"
                            className="inline-flex items-center justify-center border-2 border-white/30 text-white bg-transparent hover:bg-white/10 rounded-full px-8 h-12 text-base font-semibold transition-all duration-300"
                        >
                            Explore Products
                        </a>
                    </div>
                </div>

                {/* Right: Constellation Animation */}
                <div className="lg:w-1/2 relative h-[500px] md:h-[600px] flex items-center justify-center mt-12 lg:mt-0">
                    {/* Central hub */}
                    <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center shadow-2xl z-20">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center">
                            <span className="text-white font-bold text-sm text-center leading-tight">
                                Digital<br />Ecosystem
                            </span>
                        </div>
                        {/* Pulsing ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-30"></div>
                    </div>

                    {/* Orbital rings */}
                    <div className="absolute w-[340px] h-[340px] rounded-full border border-white/10"></div>
                    <div className="absolute w-[400px] h-[400px] rounded-full border border-white/5"></div>
                    <div className="absolute w-[460px] h-[460px] rounded-full border border-dashed border-white/5"></div>

                    {/* Product icons */}
                    {orbits.map((orbit) => {
                        const pos = getIconPosition(orbit);
                        const IconComponent = orbit.icon;
                        const isActive = isHovered === orbit.id;

                        return (
                            <Link
                                key={orbit.id}
                                href={`#${orbit.id}`}
                                className="absolute group transition-all duration-300 z-30"
                                style={{
                                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                                }}
                                onMouseEnter={() => setIsHovered(orbit.id)}
                                onMouseLeave={() => setIsHovered(null)}
                            >
                                <div
                                    className={`
                                        flex items-center justify-center rounded-2xl backdrop-blur-sm
                                        transition-all duration-300 shadow-lg
                                        ${isActive ? "scale-125" : "scale-100"}
                                    `}
                                    style={{
                                        width: orbit.size,
                                        height: orbit.size,
                                        backgroundColor: `${orbit.color}dd`,
                                        boxShadow: isActive
                                            ? `0 0 40px ${orbit.color}80, 0 0 80px ${orbit.color}40`
                                            : `0 8px 32px ${orbit.color}40`,
                                    }}
                                >
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>

                                {/* Tooltip */}
                                <div
                                    className={`
                                        absolute left-1/2 -translate-x-1/2 -bottom-12 whitespace-nowrap
                                        px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-white text-sm font-medium
                                        transition-all duration-300 pointer-events-none
                                        ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                                    `}
                                >
                                    {orbit.name}
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-subtle">
                <span className="text-xs text-white/50 uppercase tracking-wider">Explore</span>
                <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
                    <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce"></div>
                </div>
            </div>
        </section>
    );
}
