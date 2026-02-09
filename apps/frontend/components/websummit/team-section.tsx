"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Linkedin,
  Mail,
  Calendar,
  Award,
  ExternalLink,
  ChevronDown,
  Sparkles,
  X,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  color: "primary" | "accent-orange" | "accent-red" | "secondary-yellow";
  initials: string;
  yearsExperience: number;
  bio: string;
  expertiseTags: string[];
  linkedIn?: string;
  email?: string;
  focusAreas: string[];
}

interface FloatingParticle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  color: string;
}

// ============================================
// CONSTANTS
// ============================================

const COLOR_MAP: Record<
  TeamMember["color"],
  {
    gradient: string;
    gradientFrom: string;
    gradientTo: string;
    glow: string;
    badge: string;
    text: string;
    border: string;
    ring: string;
    particle: string;
  }
> = {
  primary: {
    gradient: "from-primary to-secondary",
    gradientFrom: "var(--color-primary)",
    gradientTo: "var(--color-secondary)",
    glow: "shadow-primary/30",
    badge: "bg-primary/10 text-primary border-primary/20",
    text: "text-primary",
    border: "border-primary/30",
    ring: "ring-primary/20",
    particle: "bg-primary/40",
  },
  "accent-orange": {
    gradient: "from-accent-orange to-accent-red",
    gradientFrom: "var(--color-accent-orange)",
    gradientTo: "var(--color-accent-red)",
    glow: "shadow-accent-orange/30",
    badge: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
    text: "text-accent-orange",
    border: "border-accent-orange/30",
    ring: "ring-accent-orange/20",
    particle: "bg-accent-orange/40",
  },
  "accent-red": {
    gradient: "from-accent-red to-accent-orange",
    gradientFrom: "var(--color-accent-red)",
    gradientTo: "var(--color-accent-orange)",
    glow: "shadow-accent-red/30",
    badge: "bg-accent-red/10 text-accent-red border-accent-red/20",
    text: "text-accent-red",
    border: "border-accent-red/30",
    ring: "ring-accent-red/20",
    particle: "bg-accent-red/40",
  },
  "secondary-yellow": {
    gradient: "from-secondary-yellow to-accent-yellow",
    gradientFrom: "var(--color-secondary-yellow)",
    gradientTo: "var(--color-accent-yellow)",
    glow: "shadow-secondary-yellow/30",
    badge: "bg-secondary-yellow/10 text-secondary-yellow border-secondary-yellow/20",
    text: "text-secondary-yellow",
    border: "border-secondary-yellow/30",
    ring: "ring-secondary-yellow/20",
    particle: "bg-secondary-yellow/40",
  },
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Rakiya Shuaibu Mohammed",
    role: "CEO & Founder",
    specialty: "Digital Strategy & Governance",
    color: "primary",
    initials: "RSM",
    yearsExperience: 15,
    bio: "Visionary leader with 15+ years driving digital transformation across Africa and the Middle East. Pioneer in government digitization and enterprise strategy.",
    expertiseTags: ["Leadership", "Strategy", "Digital Policy"],
    focusAreas: ["Enterprise Strategy", "Government Relations", "Innovation"],
    linkedIn: "https://linkedin.com",
    email: "ceo@drkatangablog.com",
  },
  {
    name: "Micha Abdul",
    role: "CTO",
    specialty: "AI & Blockchain Architecture",
    color: "accent-orange",
    initials: "IA",
    yearsExperience: 12,
    bio: "Tech architect with deep expertise in AI/ML systems and distributed ledger technologies. Led blockchain implementations for central banks and Fortune 500 companies.",
    expertiseTags: ["AI/ML", "Blockchain", "Architecture"],
    focusAreas: ["Technical Strategy", "Platform Engineering", "R&D"],
    linkedIn: "https://linkedin.com",
    email: "cto@drkatangablog.com",
  },
  {
    name: "Fatima Hassan",
    role: "VP Cybersecurity",
    specialty: "Zero Trust & Compliance",
    color: "accent-red",
    initials: "FH",
    yearsExperience: 10,
    bio: "Cybersecurity expert specializing in zero-trust architecture and regulatory compliance. Certified CISSP with experience protecting critical national infrastructure.",
    expertiseTags: ["Zero Trust", "Compliance", "Risk"],
    focusAreas: ["Security Operations", "Incident Response", "Compliance"],
    linkedIn: "https://linkedin.com",
    email: "security@drkatangablog.com",
  },
  {
    name: "Dr. Ahmad M",
    role: "Head of AI",
    specialty: "Machine Learning & MLOps",
    color: "secondary-yellow",
    initials: "SO",
    yearsExperience: 8,
    bio: "PhD in Machine Learning with expertise in production ML systems. Published researcher with focus on responsible AI and MLOps best practices.",
    expertiseTags: ["ML/AI", "MLOps", "Research"],
    focusAreas: ["AI Strategy", "Model Development", "Data Science"],
    linkedIn: "https://linkedin.com",
    email: "ai@drkatangablog.com",
  },
  {
    name: "Aisha Aliyu",
    role: "Director of Partnerships",
    specialty: "Enterprise & Government Relations",
    color: "primary",
    initials: "AB",
    yearsExperience: 11,
    bio: "Strategic partnership builder with extensive network across public and private sectors. Expert in government procurement and enterprise sales cycles.",
    expertiseTags: ["Partnerships", "Business Dev", "Relations"],
    focusAreas: ["Strategic Alliances", "Government Bids", "Client Success"],
    linkedIn: "https://linkedin.com",
    email: "partnerships@drkatangablog.com",
  },
  {
    name: "Khalid Al-Mansoor",
    role: "Lead Solutions Architect",
    specialty: "Cloud & Platform Engineering",
    color: "accent-orange",
    initials: "KM",
    yearsExperience: 9,
    bio: "Multi-cloud certified architect with expertise in platform engineering and FinOps. Designed and deployed enterprise-scale cloud solutions across GCC.",
    expertiseTags: ["Cloud", "DevOps", "FinOps"],
    focusAreas: ["Cloud Migration", "Platform Design", "Cost Optimization"],
    linkedIn: "https://linkedin.com",
    email: "solutions@drkatangablog.com",
  },
];

// Calculate total years of experience
const TOTAL_YEARS_EXPERIENCE = TEAM_MEMBERS.reduce(
  (sum, member) => sum + member.yearsExperience,
  0
);

// Generate floating particles
const FLOATING_PARTICLES: FloatingParticle[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    color: ["primary", "accent-orange", "secondary-yellow", "accent-red"][
      Math.floor(Math.random() * 4)
    ],
  })
);

// ============================================
// HOOKS
// ============================================

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function useCountUp(
  end: number,
  duration: number = 2000,
  startCounting: boolean = false
): number {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!startCounting) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min(
        (timestamp - startTimeRef.current) / duration,
        1
      );
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, startCounting]);

  return count;
}

// ============================================
// SUBCOMPONENTS
// ============================================

// Animated gradient avatar with abstract shapes
function GradientAvatar({
  initials,
  gradient,
  isHovered,
}: {
  initials: string;
  gradient: string;
  isHovered: boolean;
}) {
  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
      {/* Animated ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} transition-all duration-500 ${
          isHovered ? "scale-110 opacity-40" : "scale-100 opacity-0"
        }`}
        style={{ filter: "blur(8px)" }}
      />

      {/* Main avatar container */}
      <div
        className={`relative w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transition-all duration-500 overflow-hidden ${
          isHovered ? "scale-105" : "scale-100"
        }`}
      >
        {/* Abstract geometric shapes inside avatar */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient
              id="avatar-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Geometric patterns */}
          <circle
            cx="20"
            cy="20"
            r="15"
            fill="url(#avatar-gradient)"
            className={`transition-transform duration-700 ${
              isHovered ? "translate-x-2 translate-y-2" : ""
            }`}
            style={{
              transform: isHovered ? "translate(5px, 5px)" : "translate(0, 0)",
            }}
          />
          <polygon
            points="70,15 85,40 55,40"
            fill="url(#avatar-gradient)"
            className="transition-transform duration-700"
            style={{
              transform: isHovered ? "translate(-3px, 3px)" : "translate(0, 0)",
            }}
          />
          <rect
            x="60"
            y="60"
            width="25"
            height="25"
            rx="4"
            fill="url(#avatar-gradient)"
            className="transition-transform duration-700"
            style={{
              transform: isHovered
                ? "rotate(15deg) translate(0, -5px)"
                : "rotate(0deg)",
              transformOrigin: "72.5px 72.5px",
            }}
          />
        </svg>

        {/* Initials */}
        <span className="relative z-10 text-white font-bold text-xl sm:text-2xl tracking-wide">
          {initials}
        </span>
      </div>

      {/* Online/Available indicator */}
      <div
        className={`absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md transition-all duration-300 ${
          isHovered ? "scale-110" : "scale-100"
        }`}
      >
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
      </div>
    </div>
  );
}

// Animated role badge
function RoleBadge({
  role,
  colors,
  isVisible,
  delay,
}: {
  role: string;
  colors: (typeof COLOR_MAP)["primary"];
  isVisible: boolean;
  delay: number;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${colors.badge} text-xs font-semibold transition-all duration-700`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.9)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <Award className="w-3 h-3" />
      {role}
    </div>
  );
}

// Expertise tags with animation
function ExpertiseTags({
  tags,
  isHovered,
  colors,
}: {
  tags: string[];
  isHovered: boolean;
  colors: (typeof COLOR_MAP)["primary"];
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag, index) => (
        <span
          key={tag}
          className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all duration-300 ${
            isHovered
              ? `${colors.badge}`
              : "bg-neutral-light border-neutral-light text-neutral-gray"
          }`}
          style={{
            transitionDelay: `${index * 50}ms`,
            transform: isHovered ? "translateY(-2px)" : "translateY(0)",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

// Social links with hover effects
function SocialLinks({
  linkedIn,
  email,
  name,
  isHovered,
}: {
  linkedIn?: string;
  email?: string;
  name: string;
  isHovered: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 transition-all duration-500 ${
        isHovered ? "opacity-100 translate-y-0" : "opacity-60 translate-y-1"
      }`}
    >
      {linkedIn && (
        <a
          href={linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="group/social p-2 rounded-lg text-neutral-gray hover:text-primary hover:bg-primary/10 transition-all duration-300"
          aria-label={`Connect with ${name} on LinkedIn`}
          onClick={(e) => e.stopPropagation()}
        >
          <Linkedin className="w-4 h-4 transition-transform duration-300 group-hover/social:scale-110" />
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="group/social p-2 rounded-lg text-neutral-gray hover:text-primary hover:bg-primary/10 transition-all duration-300"
          aria-label={`Email ${name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className="w-4 h-4 transition-transform duration-300 group-hover/social:scale-110" />
        </a>
      )}
    </div>
  );
}

// Schedule meeting button
function ScheduleMeetingButton({
  name,
  isExpanded,
  colors,
}: {
  name: string;
  isExpanded: boolean;
  colors: (typeof COLOR_MAP)["primary"];
}) {
  return (
    <button
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${colors.gradient} text-white text-sm font-medium shadow-md transition-all duration-500 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
      style={{
        opacity: isExpanded ? 1 : 0,
        transform: isExpanded ? "translateY(0)" : "translateY(10px)",
        transitionDelay: isExpanded ? "200ms" : "0ms",
      }}
      onClick={(e) => {
        e.stopPropagation();
        // In a real app, this would open a scheduling modal or link
        window.open(`#schedule-${name.toLowerCase().replace(/\s+/g, "-")}`, "_blank");
      }}
      aria-label={`Schedule a meeting with ${name}`}
    >
      <Calendar className="w-4 h-4" />
      Schedule a Meeting
      <ExternalLink className="w-3 h-3 opacity-70" />
    </button>
  );
}

// Team card with 3D tilt effect
function TeamCard({
  member,
  index,
  isVisible,
  onExpand,
}: {
  member: TeamMember;
  index: number;
  isVisible: boolean;
  onExpand: (member: TeamMember | null) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const colors = COLOR_MAP[member.color];

  // Entrance animation directions
  const entranceDirections = [
    { x: -50, y: -30 }, // top-left
    { x: 0, y: -50 }, // top
    { x: 50, y: -30 }, // top-right
    { x: -50, y: 30 }, // bottom-left
    { x: 0, y: 50 }, // bottom
    { x: 50, y: 30 }, // bottom-right
  ];

  const direction = entranceDirections[index % entranceDirections.length];

  // 3D tilt effect on mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || isExpanded) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setTilt({ x: y * 8, y: -x * 8 }); // Inverted for natural feel
    },
    [isExpanded]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const toggleExpand = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (newExpanded) {
      onExpand(member);
    } else {
      onExpand(null);
    }
  }, [isExpanded, member, onExpand]);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-2xl bg-white transition-all duration-700 cursor-pointer`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? `translateX(0) translateY(0) perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered && !isExpanded ? 1.02 : 1})`
          : `translateX(${direction.x}px) translateY(${direction.y}px) scale(0.9)`,
        transitionDelay: `${300 + index * 120}ms`,
        transitionProperty: "opacity, transform, box-shadow",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={toggleExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleExpand();
        }
      }}
      aria-expanded={isExpanded}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl p-[2px] overflow-hidden"
        style={{
          background: isHovered || isExpanded
            ? `linear-gradient(135deg, ${colors.gradientFrom}, ${colors.gradientTo}, ${colors.gradientFrom})`
            : "transparent",
          backgroundSize: "200% 200%",
          animation: isHovered || isExpanded ? "gradientBorder 3s linear infinite" : "none",
        }}
      >
        <div className="absolute inset-0 rounded-2xl bg-white" />
      </div>

      {/* Glow effect */}
      <div
        className={`absolute -inset-1 rounded-2xl transition-all duration-500 blur-xl ${
          isHovered || isExpanded ? `${colors.glow} opacity-40` : "opacity-0"
        }`}
        style={{
          background: `linear-gradient(135deg, ${colors.gradientFrom}40, ${colors.gradientTo}40)`,
        }}
      />

      {/* Card content */}
      <div className="relative z-10 p-6 border border-neutral-light rounded-2xl bg-white shadow-lg transition-shadow duration-500 hover:shadow-xl">
        {/* Expand/collapse indicator */}
        <div
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-all duration-300 ${
            isHovered ? "bg-neutral-light" : "bg-transparent"
          }`}
        >
          <ChevronDown
            className={`w-4 h-4 text-neutral-gray transition-transform duration-500 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Avatar section */}
        <div className="flex items-start gap-4 mb-4">
          <GradientAvatar
            initials={member.initials}
            gradient={colors.gradient}
            isHovered={isHovered}
          />
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-lg font-semibold text-secondary truncate mb-1">
              {member.name}
            </h3>
            <RoleBadge
              role={member.role}
              colors={colors}
              isVisible={isVisible}
              delay={400 + index * 120}
            />
            <ExpertiseTags
              tags={member.expertiseTags}
              isHovered={isHovered}
              colors={colors}
            />
          </div>
        </div>

        {/* Specialty */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${colors.badge} mb-3 transition-all duration-300`}
        >
          <Sparkles className="w-3 h-3" />
          {member.specialty}
        </div>

        {/* Expandable content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-4 border-t border-neutral-light space-y-4">
            {/* Bio */}
            <p className="text-sm text-neutral-gray leading-relaxed">
              {member.bio}
            </p>

            {/* Focus areas */}
            <div>
              <p className="text-xs font-semibold text-secondary mb-2">Focus Areas:</p>
              <div className="flex flex-wrap gap-1.5">
                {member.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="px-2.5 py-1 rounded-full bg-neutral-light text-[11px] font-medium text-neutral-gray"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Years experience */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-gray">Experience:</span>
              <span className={`font-semibold ${colors.text}`}>
                {member.yearsExperience}+ years
              </span>
            </div>

            {/* Schedule meeting button */}
            <ScheduleMeetingButton
              name={member.name}
              isExpanded={isExpanded}
              colors={colors}
            />
          </div>
        </div>

        {/* Social links & bottom section */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-light mt-3">
          <SocialLinks
            linkedIn={member.linkedIn}
            email={member.email}
            name={member.name}
            isHovered={isHovered}
          />
          <span className="text-xs text-neutral-gray/60">
            {isExpanded ? "Click to collapse" : "Click to learn more"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Floating particles background
function FloatingParticles({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {FLOATING_PARTICLES.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${
            particle.color === "primary"
              ? "bg-primary/30"
              : particle.color === "accent-orange"
              ? "bg-accent-orange/30"
              : particle.color === "secondary-yellow"
              ? "bg-secondary-yellow/30"
              : "bg-accent-red/30"
          } transition-opacity duration-1000`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: isVisible ? 0.6 : 0,
            animation: isVisible
              ? `floatParticle ${particle.duration}s ease-in-out infinite`
              : "none",
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated experience counter
function ExperienceCounter({
  isVisible,
  totalYears,
}: {
  isVisible: boolean;
  totalYears: number;
}) {
  const [startCounting, setStartCounting] = useState(false);
  const count = useCountUp(totalYears, 2500, startCounting);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setStartCounting(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div
      className={`flex items-center justify-center gap-3 transition-all duration-700 delay-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent-orange/10 border border-primary/20">
        <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-orange bg-clip-text text-transparent tabular-nums">
          {count}+
        </span>
        <span className="text-sm font-medium text-neutral-gray">
          Combined Years of Expertise
        </span>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WebSummitTeam() {
  const { ref: sectionRef, visible: isVisible } = useScrollReveal(0.1);
  const [expandedMember, setExpandedMember] = useState<TeamMember | null>(null);

  const handleExpand = useCallback((member: TeamMember | null) => {
    setExpandedMember(member);
  }, []);

  return (
    <section
      id="team"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-neutral-light overflow-hidden"
      aria-label="Meet our team"
    >
      {/* Floating particles background */}
      <FloatingParticles isVisible={isVisible} />

      {/* Decorative gradient orbs */}
      <div
        className="absolute -left-40 top-20 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -right-40 bottom-20 w-[450px] h-[450px] rounded-full bg-accent-orange/5 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-primary) 0.5px, transparent 0.5px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      {/* Subtle top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          {/* Animated badge */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Meet Our Team
            </span>
          </div>

          {/* Animated title */}
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <span className="inline-block overflow-hidden">
              <span
                className="inline-block transition-transform duration-700"
                style={{
                  transform: isVisible ? "translateY(0)" : "translateY(100%)",
                }}
              >
                The Minds Behind the
              </span>
            </span>{" "}
            <span className="inline-block overflow-hidden">
              <span
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-orange to-secondary-yellow transition-transform duration-700 delay-150"
                style={{
                  transform: isVisible ? "translateY(0)" : "translateY(100%)",
                  backgroundSize: "200% 100%",
                  animation: isVisible ? "shimmerText 3s linear infinite" : "none",
                }}
              >
                Mission
              </span>
            </span>
          </h2>

          {/* Tagline */}
          <p
            className={`text-base sm:text-lg text-neutral-gray max-w-2xl mx-auto mb-6 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            World-class experts in AI, blockchain, cybersecurity, and digital transformation.
            Connect with our leadership and technical specialists at Booth A5-35.
          </p>

          {/* Booth location */}
          <p
            className={`flex items-center justify-center gap-2 text-sm text-neutral-gray transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <MapPin className="w-4 h-4 text-accent-orange flex-shrink-0" />
            <span>Web Summit Qatar 2026 - Booth A5-35</span>
          </p>

          {/* Experience counter */}
          <div className="mt-8">
            <ExperienceCounter
              isVisible={isVisible}
              totalYears={TOTAL_YEARS_EXPERIENCE}
            />
          </div>
        </div>

        {/* Team grid - 2x3 on desktop, stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {TEAM_MEMBERS.map((member, index) => (
            <TeamCard
              key={member.name}
              member={member}
              index={index}
              isVisible={isVisible}
              onExpand={handleExpand}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-16 transition-all duration-700 delay-[1000ms] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-neutral-gray mb-4">
            Ready to discuss your digital transformation journey?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
          >
            <Calendar className="w-5 h-5" />
            Book a Team Consultation
          </a>
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes gradientBorder {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes floatParticle {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10px, -15px) scale(1.1);
          }
          50% {
            transform: translate(-5px, -25px) scale(0.9);
          }
          75% {
            transform: translate(-15px, -10px) scale(1.05);
          }
        }
        @keyframes shimmerText {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </section>
  );
}

export default WebSummitTeam;
