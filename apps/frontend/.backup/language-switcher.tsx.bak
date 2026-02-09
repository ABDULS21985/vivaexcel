"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { Button } from "@digibit/ui/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@digibit/ui/components";
import { cn } from "@digibit/ui/components";
import {
  locales,
  localeNames,
  localeFlags,
  isRtlLocale,
  type Locale,
} from "../i18n";

// Country flag component using emoji flags
function CountryFlag({ code, className }: { code: string; className?: string }) {
  // Convert country code to flag emoji
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <span className={cn("text-lg leading-none", className)} role="img" aria-label={`${code} flag`}>
      {getFlagEmoji(code)}
    </span>
  );
}

interface LanguageSwitcherProps {
  /** Display variant */
  variant?: "dropdown" | "buttons" | "compact";
  /** Show locale name */
  showName?: boolean;
  /** Show country flag */
  showFlag?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Alignment for dropdown menu */
  align?: "start" | "center" | "end";
}

export function LanguageSwitcher({
  variant = "dropdown",
  showName = true,
  showFlag = true,
  className,
  align = "end",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Function to switch locale
  const switchLocale = (newLocale: Locale) => {
    // Remove the current locale prefix from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

    // Navigate to the new locale path
    startTransition(() => {
      router.push(`/${newLocale}${pathWithoutLocale}`);
      router.refresh();
    });

    setIsOpen(false);
  };

  // Dropdown variant (default)
  if (variant === "dropdown") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 px-3 h-9",
              isPending && "opacity-50 pointer-events-none",
              className
            )}
            aria-label={t("selectLanguage")}
          >
            {showFlag && <CountryFlag code={localeFlags[locale]} />}
            {showName && (
              <span className="hidden sm:inline text-sm font-medium">
                {localeNames[locale]}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="w-48"
          sideOffset={8}
        >
          {locales.map((loc) => {
            const isActive = loc === locale;
            const isRtl = isRtlLocale(loc);

            return (
              <DropdownMenuItem
                key={loc}
                onClick={() => switchLocale(loc)}
                className={cn(
                  "flex items-center justify-between gap-3 cursor-pointer py-2.5",
                  isActive && "bg-primary/10",
                  isRtl && "flex-row-reverse text-right"
                )}
                disabled={isPending}
              >
                <div
                  className={cn(
                    "flex items-center gap-3",
                    isRtl && "flex-row-reverse"
                  )}
                >
                  {showFlag && <CountryFlag code={localeFlags[loc]} />}
                  <span className="text-sm font-medium">{localeNames[loc]}</span>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Buttons variant (horizontal list of buttons)
  if (variant === "buttons") {
    return (
      <div
        className={cn("flex items-center gap-1 flex-wrap", className)}
        role="radiogroup"
        aria-label={t("selectLanguage")}
      >
        {locales.map((loc) => {
          const isActive = loc === locale;

          return (
            <Button
              key={loc}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => switchLocale(loc)}
              disabled={isPending || isActive}
              className={cn(
                "flex items-center gap-2 px-3 h-8 transition-all",
                isActive && "bg-primary text-white",
                !isActive && "hover:bg-neutral-100"
              )}
              role="radio"
              aria-checked={isActive}
            >
              {showFlag && <CountryFlag code={localeFlags[loc]} className="text-base" />}
              {showName && (
                <span className="text-sm font-medium">{localeNames[loc]}</span>
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  // Compact variant (icon only with tooltip-like dropdown)
  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9",
              isPending && "opacity-50 pointer-events-none",
              className
            )}
            aria-label={t("selectLanguage")}
          >
            <Globe className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-44" sideOffset={8}>
          {locales.map((loc) => {
            const isActive = loc === locale;
            const isRtl = isRtlLocale(loc);

            return (
              <DropdownMenuItem
                key={loc}
                onClick={() => switchLocale(loc)}
                className={cn(
                  "flex items-center justify-between gap-2 cursor-pointer py-2",
                  isActive && "bg-primary/10",
                  isRtl && "flex-row-reverse text-right"
                )}
                disabled={isPending}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRtl && "flex-row-reverse"
                  )}
                >
                  <CountryFlag code={localeFlags[loc]} className="text-base" />
                  <span className="text-sm">{localeNames[loc]}</span>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}

// Export a simple hook to get the current locale info
export function useLocaleInfo() {
  const locale = useLocale() as Locale;

  return {
    locale,
    localeName: localeNames[locale],
    localeFlag: localeFlags[locale],
    isRtl: isRtlLocale(locale),
    direction: isRtlLocale(locale) ? "rtl" : "ltr",
  } as const;
}

export default LanguageSwitcher;
