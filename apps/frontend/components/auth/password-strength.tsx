"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";

// =============================================================================
// Password Strength Indicator
// =============================================================================
// Visual bar (4 segments) showing password strength with criteria checklist.
// Color coded: red (weak), orange (fair), yellow (good), green (strong).

interface PasswordStrengthProps {
  password: string;
}

interface Criterion {
  label: string;
  test: (pw: string) => boolean;
}

const CRITERIA: Criterion[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
  { label: "One special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getStrength(password: string): {
  score: number;
  label: string;
  color: string;
  bgColor: string;
} {
  if (!password) {
    return { score: 0, label: "", color: "", bgColor: "" };
  }

  const passed = CRITERIA.filter((c) => c.test(password)).length;

  if (passed <= 1) {
    return {
      score: 1,
      label: "Weak",
      color: "bg-red-500",
      bgColor: "text-red-600 dark:text-red-400",
    };
  }
  if (passed <= 2) {
    return {
      score: 2,
      label: "Fair",
      color: "bg-orange-500",
      bgColor: "text-orange-600 dark:text-orange-400",
    };
  }
  if (passed <= 3) {
    return {
      score: 3,
      label: "Good",
      color: "bg-yellow-500",
      bgColor: "text-yellow-600 dark:text-yellow-400",
    };
  }
  return {
    score: 4,
    label: "Strong",
    color: "bg-green-500",
    bgColor: "text-green-600 dark:text-green-400",
  };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => getStrength(password), [password]);
  const criteriaResults = useMemo(
    () => CRITERIA.map((c) => ({ ...c, passed: c.test(password) })),
    [password]
  );

  if (!password) return null;

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">
            Password strength
          </span>
          <span className={`text-xs font-semibold ${strength.bgColor}`}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                segment <= strength.score
                  ? strength.color
                  : "bg-[var(--surface-3)] dark:bg-[var(--surface-3)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Criteria Checklist */}
      <ul className="space-y-1">
        {criteriaResults.map((criterion) => (
          <li
            key={criterion.label}
            className="flex items-center gap-2 text-xs"
          >
            {criterion.passed ? (
              <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
            )}
            <span
              className={
                criterion.passed
                  ? "text-green-600 dark:text-green-400"
                  : "text-[var(--muted-foreground)]"
              }
            >
              {criterion.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
