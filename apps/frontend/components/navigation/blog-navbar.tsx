"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, Search, Sun, Moon, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@ktblog/ui/components";
import { CartIcon } from "@/components/cart/cart-icon";
import { CurrencySelector } from "@/components/store/currency-selector";
import { StreakCounter } from "@/components/gamification/streak-counter";
import { useAuth } from "@/providers/auth-provider";

// ============================================
// TYPES
// ============================================

interface NavItem {
  name: string;
  href: string;
}

// ============================================
// DATA
// ============================================

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Videos", href: "/videos" },
  { name: "Collab", href: "/collab" },
  { name: "Store", href: "/store" },
  { name: "Pricing", href: "/pricing" },
  { name: "Categories", href: "/categories" },
  { name: "Developers", href: "/developers" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

// ============================================
// ANIMATION VARIANTS
// ============================================

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
  open: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const mobileItemVariants = {
  closed: { opacity: 0, y: 20 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.05,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

// ============================================
// BLOG NAVBAR COMPONENT
// ============================================

export function BlogNavbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dark mode initialization
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-40 w-full transition-all duration-300 ease-out",
          isScrolled
            ? "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl saturate-150 shadow-sm border-b border-neutral-200/50 dark:border-neutral-800/50"
            : "bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-900"
        )}
      >
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="flex items-center">
                <span className="text-xl font-bold text-primary">
                  Viva
                </span>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  Excel
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    isPathActive(item.href)
                      ? "text-primary bg-primary/5 dark:bg-primary/10"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  {item.name}
                  {isPathActive(item.href) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Search Button */}
              <button
                className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Streak Counter */}
              <StreakCounter />

              {/* Cart Icon */}
              <CartIcon />

              {/* Currency Selector */}
              <CurrencySelector />

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-[18px] h-[18px]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-[18px] h-[18px]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Auth Buttons */}
              {!authLoading && !isAuthenticated && (
                <>
                  <Link
                    href="/login"
                    className="ml-2 inline-flex items-center gap-1.5 px-4 h-10 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 px-5 h-10 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-colors duration-200 btn-press"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Link>
                </>
              )}

              {/* Authenticated User Avatar */}
              {!authLoading && isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="ml-2 flex items-center gap-2 px-2 h-10 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-sm font-semibold text-primary">
                        {user?.firstName?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {user?.firstName}
                  </span>
                </Link>
              )}
            </div>

            {/* Mobile Right Side */}
            <div className="lg:hidden flex items-center gap-1">
              {/* Mobile Search */}
              <button
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Streak Counter (Mobile) */}
              <StreakCounter />

              {/* Mobile Cart Icon */}
              <CartIcon />

              {/* Dark Mode Toggle — Mobile */}
              <button
                onClick={toggleDarkMode}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
                aria-label="Open menu"
                aria-expanded={isMobileOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Full-Screen Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-white dark:bg-neutral-950" />

            {/* Content */}
            <div className="relative flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-neutral-200 dark:border-neutral-800">
                <Link
                  href="/"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center min-h-[44px]"
                >
                  <span className="text-xl font-bold text-primary">Viva</span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">Excel</span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-600 dark:text-neutral-400 rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile navigation">
                <ul className="space-y-1">
                  {navItems.map((item, i) => (
                    <motion.li
                      key={item.href}
                      custom={i}
                      variants={mobileItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex items-center px-4 min-h-[48px] text-lg font-medium rounded-xl transition-colors",
                          isPathActive(item.href)
                            ? "text-primary bg-primary/5 dark:bg-primary/10"
                            : "text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800"
                        )}
                      >
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {/* Auth / Subscribe CTAs */}
                <motion.div
                  className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3"
                  custom={navItems.length}
                  variants={mobileItemVariants}
                  initial="closed"
                  animate="open"
                >
                  {!authLoading && !isAuthenticated && (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center justify-center gap-2 w-full min-h-[48px] h-14 border-2 border-primary text-primary text-lg font-semibold rounded-xl transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
                      >
                        <LogIn className="w-5 h-5" />
                        Log In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center justify-center gap-2 w-full min-h-[48px] h-14 bg-primary hover:bg-primary/90 text-white text-lg font-semibold rounded-xl shadow-lg transition-colors btn-press"
                      >
                        <UserPlus className="w-5 h-5" />
                        Register
                      </Link>
                    </>
                  )}

                  {!authLoading && isAuthenticated && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-3 w-full min-h-[48px] h-14 px-4 bg-primary/5 dark:bg-primary/10 text-primary text-lg font-semibold rounded-xl transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {user?.firstName?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                      My Dashboard
                    </Link>
                  )}
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
