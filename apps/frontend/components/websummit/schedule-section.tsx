"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Monitor,
  Users,
  MessageSquare,
  Handshake,
  Sparkles,
  Sun,
  Cloud,
  CalendarPlus,
  ExternalLink,
  ChevronRight,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type EventType = "demo" | "networking" | "talk" | "meeting";

interface ScheduleEvent {
  time: string;
  endTime?: string;
  title: string;
  type: EventType;
  description?: string;
  speaker?: string;
  location?: string;
}

interface ScheduleDay {
  day: number;
  date: string;
  fullDate: string;
  label: string;
  weather: { temp: string; icon: "sun" | "cloud" };
  events: ScheduleEvent[];
}

// ============================================
// DATA
// ============================================

const EVENT_TYPE_CONFIG: Record<
  EventType,
  {
    label: string;
    colorClass: string;
    borderColor: string;
    bgColor: string;
    gradientFrom: string;
    gradientTo: string;
    icon: LucideIcon;
  }
> = {
  demo: {
    label: "Demo",
    colorClass: "text-accent-orange bg-accent-orange/10 border-accent-orange/20",
    borderColor: "border-l-accent-orange",
    bgColor: "bg-accent-orange",
    gradientFrom: "from-accent-orange/20",
    gradientTo: "to-accent-orange/5",
    icon: Monitor,
  },
  networking: {
    label: "Networking",
    colorClass: "text-primary bg-primary/10 border-primary/20",
    borderColor: "border-l-primary",
    bgColor: "bg-primary",
    gradientFrom: "from-primary/20",
    gradientTo: "to-primary/5",
    icon: Users,
  },
  talk: {
    label: "Talk",
    colorClass: "text-secondary-yellow bg-secondary-yellow/10 border-secondary-yellow/20",
    borderColor: "border-l-secondary-yellow",
    bgColor: "bg-secondary-yellow",
    gradientFrom: "from-secondary-yellow/20",
    gradientTo: "to-secondary-yellow/5",
    icon: MessageSquare,
  },
  meeting: {
    label: "Meeting",
    colorClass: "text-accent-red bg-accent-red/10 border-accent-red/20",
    borderColor: "border-l-accent-red",
    bgColor: "bg-accent-red",
    gradientFrom: "from-accent-red/20",
    gradientTo: "to-accent-red/5",
    icon: Handshake,
  },
};

const SCHEDULE_DAYS: ScheduleDay[] = [
  {
    day: 1,
    date: "Feb 1",
    fullDate: "February 1, 2026",
    label: "Setup & Networking",
    weather: { temp: "22°C", icon: "sun" },
    events: [
      {
        time: "09:00",
        endTime: "10:30",
        title: "Booth Setup & Team Briefing",
        type: "networking",
        description: "Final preparations and team alignment for the summit",
        location: "Booth A5-35",
      },
      {
        time: "11:00",
        endTime: "12:30",
        title: "Official Web Summit Opening Ceremony",
        type: "talk",
        description: "Keynote speeches and official summit inauguration",
        speaker: "Web Summit Team",
        location: "Main Stage",
      },
      {
        time: "14:00",
        endTime: "16:00",
        title: "Partner Networking Sessions",
        type: "networking",
        description: "Connect with potential partners and collaborators",
        location: "Networking Lounge",
      },
      {
        time: "16:00",
        endTime: "18:00",
        title: "Investor Meet & Greet Reception",
        type: "meeting",
        description: "Exclusive session with regional and international investors",
        location: "VIP Lounge",
      },
    ],
  },
  {
    day: 2,
    date: "Feb 2",
    fullDate: "February 2, 2026",
    label: "Product Showcases",
    weather: { temp: "24°C", icon: "sun" },
    events: [
      {
        time: "09:30",
        endTime: "10:30",
        title: "TrustMeHub Live Demo: Credential Verification",
        type: "demo",
        description: "See our cutting-edge credential verification platform in action",
        location: "Booth A5-35",
      },
      {
        time: "11:00",
        endTime: "12:00",
        title: "DigiGate API Gateway Walkthrough",
        type: "demo",
        description: "Technical deep-dive into our secure API gateway solution",
        location: "Booth A5-35",
      },
      {
        time: "13:00",
        endTime: "14:00",
        title: 'Fireside Chat: "The Future of Digital Trust"',
        type: "talk",
        description: "Industry leaders discuss emerging trends in digital identity",
        speaker: "Industry Panel",
        location: "Stage 2",
      },
      {
        time: "15:00",
        endTime: "16:00",
        title: "BoaCRM Banking Solutions Showcase",
        type: "demo",
        description: "Discover how BoaCRM transforms banking customer relationships",
        location: "Booth A5-35",
      },
      {
        time: "17:00",
        endTime: "18:30",
        title: "Enterprise Decision-Maker Roundtable",
        type: "meeting",
        description: "Exclusive discussion with C-suite executives",
        location: "Meeting Room B",
      },
    ],
  },
  {
    day: 3,
    date: "Feb 3",
    fullDate: "February 3, 2026",
    label: "Deep Dives",
    weather: { temp: "23°C", icon: "cloud" },
    events: [
      {
        time: "09:00",
        endTime: "10:30",
        title: "AI & Cybersecurity Workshop",
        type: "talk",
        description: "Hands-on workshop exploring AI-driven security solutions",
        speaker: "Tech Team",
        location: "Workshop Area",
      },
      {
        time: "11:00",
        endTime: "12:30",
        title: "Blockchain for Government Panel",
        type: "talk",
        description: "How blockchain is transforming public sector services",
        speaker: "Government Leaders",
        location: "Stage 3",
      },
      {
        time: "13:30",
        endTime: "15:00",
        title: "1-on-1 Investor Meetings",
        type: "meeting",
        description: "Pre-scheduled meetings with interested investors",
        location: "Meeting Pods",
      },
      {
        time: "15:00",
        endTime: "16:30",
        title: "Partner Integration Demos",
        type: "demo",
        description: "Showcasing successful partner integrations",
        location: "Booth A5-35",
      },
      {
        time: "17:00",
        endTime: "18:00",
        title: "Training Programs Preview",
        type: "demo",
        description: "Preview our comprehensive training and certification programs",
        location: "Booth A5-35",
      },
    ],
  },
  {
    day: 4,
    date: "Feb 4",
    fullDate: "February 4, 2026",
    label: "Closing Day",
    weather: { temp: "25°C", icon: "sun" },
    events: [
      {
        time: "09:00",
        endTime: "10:00",
        title: "Executive Breakfast Briefing",
        type: "meeting",
        description: "Morning briefing with key stakeholders",
        location: "Executive Lounge",
      },
      {
        time: "10:30",
        endTime: "12:00",
        title: "Final Product Demos & Q&A",
        type: "demo",
        description: "Last chance to see all products and ask questions",
        location: "Booth A5-35",
      },
      {
        time: "13:00",
        endTime: "14:30",
        title: "Closing Keynote & Partnerships Announcement",
        type: "talk",
        description: "Major announcements and partnership reveals",
        speaker: "CEO",
        location: "Main Stage",
      },
      {
        time: "15:00",
        endTime: "17:00",
        title: "Wrap-up & Follow-up Scheduling",
        type: "networking",
        description: "Final networking and scheduling follow-up meetings",
        location: "Networking Area",
      },
    ],
  },
];

// Event dates for "Now" indicator
const EVENT_START = new Date("2026-02-01T00:00:00");
const EVENT_END = new Date("2026-02-04T23:59:59");

// ============================================
// HOOKS
// ============================================

function useIntersectionObserver(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function useIsEventLive() {
  const [isLive, setIsLive] = useState(false);
  const [currentDay, setCurrentDay] = useState<number | null>(null);

  useEffect(() => {
    const checkLive = () => {
      const now = new Date();
      const live = now >= EVENT_START && now <= EVENT_END;
      setIsLive(live);

      if (live) {
        const dayDiff = Math.floor(
          (now.getTime() - EVENT_START.getTime()) / (1000 * 60 * 60 * 24)
        );
        setCurrentDay(Math.min(dayDiff + 1, 4));
      }
    };

    checkLive();
    const interval = setInterval(checkLive, 60000);
    return () => clearInterval(interval);
  }, []);

  return { isLive, currentDay };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateDuration(start: string, end?: string): number {
  if (!end) return 60;
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

function generateCalendarLink(event: ScheduleEvent, day: ScheduleDay): string {
  const startDate = new Date(`2026-${day.date.replace("Feb ", "02-")}T${event.time}:00`);
  const endDate = event.endTime
    ? new Date(`2026-${day.date.replace("Feb ", "02-")}T${event.endTime}:00`)
    : new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description || "",
    location: event.location || "Web Summit Qatar 2026",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ============================================
// SUB-COMPONENTS
// ============================================

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated grid pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "60px 60px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-20 left-[10%] w-32 h-32 border border-primary/10 rounded-full"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-40 right-[15%] w-24 h-24 border border-accent-orange/10 rotate-45"
        animate={{
          y: [0, 30, 0],
          rotate: [45, 135, 45],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Qatar-themed decorations - geometric patterns inspired by Islamic art */}
      <svg
        className="absolute top-10 right-10 w-40 h-40 text-primary/5"
        viewBox="0 0 100 100"
        fill="none"
      >
        <motion.path
          d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z"
          stroke="currentColor"
          strokeWidth="0.5"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
        <motion.path
          d="M50 10L83.3 30V70L50 90L16.7 70V30L50 10Z"
          stroke="currentColor"
          strokeWidth="0.5"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
      </svg>

      <svg
        className="absolute bottom-20 left-10 w-32 h-32 text-accent-orange/5"
        viewBox="0 0 100 100"
        fill="none"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="10 5"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="5 10"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
      </svg>

      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-accent-orange/8 via-secondary-yellow/4 to-transparent blur-[100px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}

function SectionHeader({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="text-center mb-14 lg:mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/10 bg-primary/5 mb-6"
      >
        <Calendar className="w-4 h-4 text-secondary-yellow" />
        <span className="text-sm font-semibold tracking-widest text-primary uppercase">
          Agenda Preview
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6"
      >
        Four Days of{" "}
        <span className="relative inline-block">
          <span className="bg-gradient-to-r from-primary via-accent-orange to-secondary-yellow bg-clip-text text-transparent">
            Innovation & Impact
          </span>
          <motion.span
            className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent-orange to-secondary-yellow rounded-full"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg md:text-xl text-neutral-gray max-w-2xl mx-auto leading-relaxed"
      >
        Join us for product demos, executive conversations, and partnership opportunities
      </motion.p>
    </div>
  );
}

function InteractiveTimeline({
  activeDay,
  onSelectDay,
  isVisible,
  isLive,
  currentDay,
}: {
  activeDay: number;
  onSelectDay: (day: number) => void;
  isVisible: boolean;
  isLive: boolean;
  currentDay: number | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative mb-12"
    >
      {/* Timeline container */}
      <div className="relative flex items-center justify-center gap-4 md:gap-8 lg:gap-12 py-8">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-light -translate-y-1/2 rounded-full" />

        {/* Progress line */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary via-accent-orange to-secondary-yellow -translate-y-1/2 rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: `${((activeDay - 1) / 3) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Day nodes */}
        {SCHEDULE_DAYS.map((day, index) => {
          const isActive = activeDay === day.day;
          const isPast = day.day < activeDay;
          const isCurrent = isLive && currentDay === day.day;

          return (
            <motion.button
              key={day.day}
              onClick={() => onSelectDay(day.day)}
              className="relative z-10 group"
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Node circle */}
              <div
                className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-br from-primary to-accent-orange text-white shadow-lg shadow-primary/30"
                      : isPast
                        ? "bg-primary/20 text-primary"
                        : "bg-neutral-light text-neutral-gray group-hover:bg-primary/10 group-hover:text-primary"
                  }`}
              >
                <span className="text-lg md:text-xl font-bold">{day.day}</span>

                {/* Live indicator */}
                {isCurrent && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="absolute inset-0 rounded-full bg-accent-red animate-ping" />
                  </motion.div>
                )}

                {/* Active ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
              </div>

              {/* Day label */}
              <motion.div
                className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs md:text-sm font-medium transition-colors duration-300
                  ${isActive ? "text-primary" : "text-neutral-gray group-hover:text-primary"}`}
                initial={{ opacity: 0, y: -10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                {day.date}
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function CalendarHeader({ day, isLive, currentDay }: { day: ScheduleDay; isLive: boolean; currentDay: number | null }) {
  const WeatherIcon = day.weather.icon === "sun" ? Sun : Cloud;
  const isCurrent = isLive && currentDay === day.day;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-6 mb-8 text-white"
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="calendar-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#calendar-pattern)" />
        </svg>
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Date info */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <span className="text-xs font-medium text-white/70 uppercase">Day</span>
            <span className="text-2xl md:text-3xl font-bold">{day.day}</span>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-1">{day.label}</h3>
            <p className="text-sm text-white/70">{day.fullDate}</p>
          </div>
        </div>

        {/* Weather and live indicator */}
        <div className="flex items-center gap-4">
          {/* Weather */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <WeatherIcon className="w-5 h-5 text-secondary-yellow" />
            <span className="text-sm font-medium">{day.weather.temp}</span>
            <span className="text-xs text-white/60">Doha</span>
          </div>

          {/* Live indicator */}
          {isCurrent && (
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-accent-red/20 backdrop-blur-sm rounded-full border border-accent-red/30"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(239, 68, 68, 0.4)",
                  "0 0 0 10px rgba(239, 68, 68, 0)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              <motion.div
                className="w-2 h-2 bg-accent-red rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm font-semibold text-accent-red">LIVE NOW</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Event count */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary-yellow" />
          <span className="text-sm text-white/70">{day.events.length} events scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-secondary-yellow" />
          <span className="text-sm text-white/70">Booth A5-35</span>
        </div>
      </div>
    </motion.div>
  );
}

function EventCard({
  event,
  index,
  day,
  onHover,
  isHovered,
}: {
  event: ScheduleEvent;
  index: number;
  day: ScheduleDay;
  onHover: (index: number | null) => void;
  isHovered: boolean;
}) {
  const config = EVENT_TYPE_CONFIG[event.type];
  const Icon = config.icon;
  const duration = calculateDuration(event.time, event.endTime);
  const durationPercentage = Math.min((duration / 120) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      className="group"
    >
      <motion.div
        className={`relative overflow-hidden rounded-xl border transition-all duration-300
          ${
            isHovered
              ? "bg-white shadow-xl border-primary/20 scale-[1.02]"
              : "bg-neutral-light/50 border-neutral-light hover:bg-white hover:shadow-md"
          }
          border-l-4 ${config.borderColor}`}
        layout
      >
        {/* Gradient background on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} opacity-0 transition-opacity duration-300`}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />

        <div className="relative p-4 md:p-5">
          <div className="flex items-start gap-4">
            {/* Time and duration column */}
            <div className="flex-shrink-0 w-20 md:w-24">
              <div className="flex items-center gap-1.5 text-neutral-gray mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold tabular-nums">{event.time}</span>
              </div>
              {event.endTime && (
                <span className="text-xs text-neutral-gray/60">to {event.endTime}</span>
              )}

              {/* Duration bar */}
              <div className="mt-2 h-1.5 bg-neutral-light rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${config.bgColor} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${durationPercentage}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                />
              </div>
              <span className="text-[10px] text-neutral-gray/60 mt-1 block">{duration} min</span>
            </div>

            {/* Timeline dot */}
            <div className="hidden md:flex flex-col items-center flex-shrink-0 pt-1">
              <motion.div
                className={`w-4 h-4 rounded-full ${config.bgColor} ring-4 ring-white shadow-md`}
                animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              />
              <div className="w-px flex-1 bg-neutral-light mt-2" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h4 className="text-sm md:text-base font-semibold text-secondary leading-tight pr-2">
                  {event.title}
                </h4>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold
                    px-2 py-0.5 rounded-full border ${config.colorClass} flex-shrink-0`}
                >
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>

              {/* Expanded details on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {event.description && (
                      <p className="text-sm text-neutral-gray mb-3">{event.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-gray mb-3">
                      {event.speaker && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.speaker}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      <motion.a
                        href={generateCalendarLink(event, day)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CalendarPlus className="w-3 h-3" />
                        Add to Calendar
                        <ExternalLink className="w-3 h-3" />
                      </motion.a>

                      {event.type === "meeting" && (
                        <motion.a
                          href="#contact"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-accent-orange to-secondary-yellow hover:from-accent-red hover:to-accent-orange rounded-full transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Handshake className="w-3 h-3" />
                          Book This Slot
                          <ChevronRight className="w-3 h-3" />
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed state hint */}
              {!isHovered && (
                <motion.p
                  className="text-xs text-neutral-gray/60 mt-1 flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {event.location && (
                    <>
                      <Zap className="w-3 h-3" />
                      {event.location}
                    </>
                  )}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EventLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="flex flex-wrap justify-center gap-4 mt-12 pt-8 border-t border-neutral-light"
    >
      {(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map((type, index) => {
        const config = EVENT_TYPE_CONFIG[type];
        const Icon = config.icon;
        return (
          <motion.div
            key={type}
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.1 }}
          >
            <span
              className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold
                px-2 py-0.5 rounded-full border ${config.colorClass}`}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ============================================
// KEYFRAMES
// ============================================

const keyframesCSS = `
  @keyframes schedule-float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-20px, 15px) scale(0.95); }
  }
`;

// ============================================
// MAIN COMPONENT
// ============================================

export function WebSummitSchedule() {
  const [activeDay, setActiveDay] = useState(1);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const { ref: sectionRef, isVisible } = useIntersectionObserver(0.1);
  const { isLive, currentDay } = useIsEventLive();

  const currentDayData = useMemo(
    () => SCHEDULE_DAYS.find((d) => d.day === activeDay)!,
    [activeDay]
  );

  const handleSelectDay = useCallback((day: number) => {
    setActiveDay(day);
    setHoveredEvent(null);
  }, []);

  return (
    <section
      id="agenda"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      <AnimatedBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader isVisible={isVisible} />

        <InteractiveTimeline
          activeDay={activeDay}
          onSelectDay={handleSelectDay}
          isVisible={isVisible}
          isLive={isLive}
          currentDay={currentDay}
        />

        {/* Day content with AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <CalendarHeader
              day={currentDayData}
              isLive={isLive}
              currentDay={currentDay}
            />

            {/* Event list */}
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {currentDayData.events.map((event, index) => (
                  <EventCard
                    key={`${currentDayData.day}-${event.time}`}
                    event={event}
                    index={index}
                    day={currentDayData}
                    onHover={setHoveredEvent}
                    isHovered={hoveredEvent === index}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        <EventLegend />

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-neutral-gray mb-4">
            Want to schedule a private meeting or demo?
          </p>
          <motion.a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-full shadow-lg shadow-primary/20 transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(30, 77, 183, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="w-5 h-5" />
            Book Your Slot Now
            <ChevronRight className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
