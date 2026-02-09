"use client";

import { useMemo } from "react";

// Simulated purchase data
const RECENT_PURCHASES = [
  { name: "Sarah K.", action: "purchased", product: "PowerPoint Template Pack", time: "2 min ago" },
  { name: "James M.", action: "downloaded", product: "Startup Kit Pro", time: "5 min ago" },
  { name: "Maria L.", action: "just got", product: "Design System Bundle", time: "8 min ago" },
  { name: "David R.", action: "purchased", product: "Code Template Collection", time: "12 min ago" },
  { name: "Emma W.", action: "downloaded", product: "Solution Template Suite", time: "15 min ago" },
  { name: "Alex T.", action: "purchased", product: "Web Template Pro", time: "18 min ago" },
  { name: "Lisa H.", action: "just got", product: "Document Toolkit", time: "22 min ago" },
  { name: "Michael B.", action: "downloaded", product: "Enterprise Starter Kit", time: "25 min ago" },
];

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-orange-400 to-red-500",
  "from-emerald-400 to-teal-600",
  "from-purple-500 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-blue-500",
  "from-rose-400 to-pink-600",
  "from-green-400 to-emerald-600",
];

export function SocialProofStrip() {
  // Double the items for seamless loop
  const items = useMemo(() => [...RECENT_PURCHASES, ...RECENT_PURCHASES], []);

  return (
    <section
      className="relative overflow-hidden py-4 bg-gradient-to-r from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 border-y border-neutral-100 dark:border-neutral-800"
      aria-label="Recent purchases"
    >
      {/* Live indicator */}
      <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-white dark:bg-neutral-900 pr-4 pl-1">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden md:inline">
          Live
        </span>
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent z-[5]" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent z-[5]" />

      {/* Marquee */}
      <div className="flex hover:[animation-play-state:paused] [&>*]:hover:[animation-play-state:paused]">
        <div className="flex gap-8 animate-marquee">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 whitespace-nowrap"
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
              >
                {getInitials(item.name)}
              </div>
              {/* Message */}
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-white">{item.name}</span>
                {" "}{item.action}{" "}
                <span className="font-medium text-[#1E4DB7] dark:text-blue-400">{item.product}</span>
              </p>
              {/* Time */}
              <span className="text-xs text-neutral-400 dark:text-neutral-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialProofStrip;
