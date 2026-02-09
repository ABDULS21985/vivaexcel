import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Shield,
    Blocks,
    Activity,
    Zap,
    Users,
    ShieldCheck,
    Brain,
    Scale,
    GraduationCap,
    CheckCircle,
} from "lucide-react";
import { Button } from "@digibit/ui/components";
import { products } from "@/data/products";
import { serviceCategories } from "@/data/services";
import { CTASection } from "@/components/shared";

const productIcons = {
    digigate: Shield,
    digitrust: Blocks,
    digitrack: Activity,
    trustmehub: Zap,
    boacrm: Users,
};

const serviceIcons = {
    cybersecurity: ShieldCheck,
    "ai-data": Brain,
    blockchain: Blocks,
    "it-governance": Scale,
};

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ProductsServicesPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24 bg-gradient-to-br from-primary to-secondary overflow-hidden relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-orange/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
                            <div className="w-12 h-0.5 bg-accent-orange"></div>
                            <span className="text-xs md:text-sm font-bold tracking-wider text-white/80 uppercase">
                                Products & Services
                            </span>
                            <div className="w-12 h-0.5 bg-accent-orange"></div>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up delay-100">
                            Complete Digital
                            <span className="text-accent-orange">
                                {" "}
                                Transformation
                            </span>{" "}
                            Solutions
                        </h1>

                        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
                            Enterprise-grade products and expert advisory
                            services to accelerate your organization&apos;s digital
                            journey
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                            <Button
                                asChild
                                size="lg"
                                className="bg-accent-orange hover:bg-accent-red text-white rounded-full px-8 h-12"
                            >
                                <Link href="#products">
                                    Explore Products
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-full px-8 h-12"
                            >
                                <Link href="#services">View Services</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Overview */}
            <section id="products" className="w-full py-16 md:py-24 bg-white scroll-mt-20">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                        <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                            Our Products
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 animate-fade-in-up delay-100">
                        <div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e3a8a] leading-tight">
                                Flagship Digital
                            </h2>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent-orange leading-tight">
                                Products
                            </h2>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full px-6 self-start md:self-auto"
                        >
                            <Link href="/products">
                                View All Products
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {products.map((product, index) => {
                            const IconComponent =
                                productIcons[
                                    product.id as keyof typeof productIcons
                                ] || Shield;
                            return (
                                <Link
                                    key={product.id}
                                    href={`/products#${product.id}`}
                                    className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-neutral-100 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4">
                                            <div
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                                                style={{
                                                    backgroundColor:
                                                        product.accentColor,
                                                }}
                                            >
                                                <IconComponent className="h-4 w-4" />
                                                {product.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm text-neutral-500 mb-3">
                                            {product.tagline}
                                        </p>
                                        <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                                            {product.description.slice(0, 120)}...
                                        </p>
                                        <ul className="space-y-1.5">
                                            {product.valuePropositions
                                                .slice(0, 2)
                                                .map((prop, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-center gap-2 text-xs text-neutral-600"
                                                    >
                                                        <CheckCircle
                                                            className="h-3.5 w-3.5 flex-shrink-0"
                                                            style={{
                                                                color: product.accentColor,
                                                            }}
                                                        />
                                                        {prop}
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section id="services" className="w-full py-16 md:py-24 bg-neutral-50 scroll-mt-20">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                        <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                            Our Services
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 animate-fade-in-up delay-100">
                        <div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e3a8a] leading-tight">
                                Advisory &
                            </h2>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent-orange leading-tight">
                                Consulting Services
                            </h2>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full px-6 self-start md:self-auto"
                        >
                            <Link href="/services">
                                View All Services
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {serviceCategories.map((category, index) => {
                            const IconComponent =
                                serviceIcons[
                                    category.id as keyof typeof serviceIcons
                                ] || ShieldCheck;
                            return (
                                <Link
                                    key={category.id}
                                    href={`/services#${category.id}`}
                                    className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-lg border border-neutral-100 hover:border-primary/20 transition-all duration-300 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                        <IconComponent className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors mb-2">
                                        {category.shortName}
                                    </h3>
                                    <p className="text-sm text-neutral-500 line-clamp-3 mb-4">
                                        {category.description}
                                    </p>
                                    <div className="text-xs text-primary font-medium">
                                        {category.services.length} services
                                        <ArrowRight className="inline-block ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Training Academy Teaser */}
            <section className="w-full py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-orange/10 mb-6 animate-fade-in-up">
                            <GraduationCap className="h-8 w-8 text-accent-orange" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4 animate-fade-in-up delay-100">
                            Training Academy
                        </h2>
                        <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
                            Build organizational capabilities with our expert-led
                            training programs in cybersecurity, AI, blockchain,
                            and IT governance.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in-up delay-300">
                            <span className="px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium">
                                Executive Programs
                            </span>
                            <span className="px-4 py-2 bg-accent-orange/10 text-accent-orange rounded-full text-sm font-medium">
                                Technical Certifications
                            </span>
                            <span className="px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                                Compliance Training
                            </span>
                        </div>
                        <Button
                            asChild
                            className="bg-accent-orange hover:bg-accent-red text-white rounded-full px-8 animate-fade-in-up delay-500"
                        >
                            <Link href="/services#training">
                                Explore Training Programs
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <CTASection
                title="Ready to Get Started?"
                accentTitle=""
                description="Connect with our team to explore how our products and services can transform your organization."
                primaryCTA={{
                    label: "Contact Us",
                    href: "/contact",
                }}
                secondaryCTA={{
                    label: "Request Demo",
                    href: "/contact?demo=true",
                }}
            />
        </div>
    );
}
