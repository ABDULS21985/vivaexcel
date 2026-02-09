"use client";

// ============================================
// TYPES
// ============================================

interface ProductIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
  variant?: "default" | "outlined" | "filled";
}

// ============================================
// BRAND COLORS
// ============================================

const BRAND_COLORS = {
  primary: "#1E4DB7",
  yellow: "#FFE63B",
  orange: "#F59A23",
  secondary: "#0A1628",
  red: "#E53935",
};

// ============================================
// TRUSTMEHUB ICON (Shield with checkmark)
// ============================================

export function TrustMeHubIcon({
  className = "",
  size = 64,
  animate = true,
  variant = "default",
}: ProductIconProps) {
  const gradientId = `trustmehub-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.orange} />
          <stop offset="100%" stopColor={BRAND_COLORS.yellow} />
        </linearGradient>
        <filter id="trustmehub-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shield shape */}
      <path
        d="M32 6 L54 14 L54 30 C54 44 44 54 32 58 C20 54 10 44 10 30 L10 14 Z"
        fill={variant === "filled" ? `url(#${gradientId})` : "none"}
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      >
        {animate && (
          <animate
            attributeName="stroke-width"
            values="2.5;3.5;2.5"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Inner shield */}
      {variant === "default" && (
        <path
          d="M32 14 L46 20 L46 30 C46 40 38 48 32 50 C26 48 18 40 18 30 L18 20 Z"
          fill={BRAND_COLORS.orange}
          opacity="0.15"
        />
      )}

      {/* Checkmark */}
      <path
        d="M24 32 L30 38 L42 24"
        fill="none"
        stroke={BRAND_COLORS.orange}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={animate ? "url(#trustmehub-glow)" : undefined}
      >
        {animate && (
          <>
            <animate
              attributeName="stroke-dasharray"
              values="0,40;40,0"
              dur="1.5s"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="2s"
              repeatCount="indefinite"
            />
          </>
        )}
      </path>

      {/* Pulse effect */}
      {animate && (
        <circle cx="32" cy="32" r="24" fill="none" stroke={BRAND_COLORS.yellow} strokeWidth="1" opacity="0">
          <animate attributeName="r" values="24;32;24" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

// ============================================
// DIGIGATE ICON (Network gateway)
// ============================================

export function DigiGateIcon({
  className = "",
  size = 64,
  animate = true,
  variant = "default",
}: ProductIconProps) {
  const gradientId = `digigate-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.primary} />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} />
        </linearGradient>
      </defs>

      {/* Gateway frame */}
      <rect
        x="12"
        y="16"
        width="40"
        height="32"
        rx="4"
        fill={variant === "filled" ? `url(#${gradientId})` : "none"}
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
      />

      {/* Center divider */}
      <line x1="32" y1="16" x2="32" y2="48" stroke={BRAND_COLORS.primary} strokeWidth="2" opacity="0.5" />

      {/* Left side nodes */}
      {[24, 32, 40].map((y, i) => (
        <g key={`left-${i}`}>
          <line x1="8" y1={y} x2="18" y2={y} stroke={BRAND_COLORS.primary} strokeWidth="1.5" opacity="0.6">
            {animate && (
              <animate
                attributeName="stroke-dasharray"
                values="0,15;15,0"
                dur="1s"
                begin={`${i * 0.2}s`}
                fill="freeze"
              />
            )}
          </line>
          <circle cx="8" cy={y} r="3" fill={BRAND_COLORS.orange}>
            {animate && (
              <animate attributeName="r" values="3;4;3" dur="1.5s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            )}
          </circle>
        </g>
      ))}

      {/* Right side nodes */}
      {[24, 32, 40].map((y, i) => (
        <g key={`right-${i}`}>
          <line x1="46" y1={y} x2="56" y2={y} stroke={BRAND_COLORS.primary} strokeWidth="1.5" opacity="0.6">
            {animate && (
              <animate
                attributeName="stroke-dasharray"
                values="0,15;15,0"
                dur="1s"
                begin={`${i * 0.2 + 0.5}s`}
                fill="freeze"
              />
            )}
          </line>
          <circle cx="56" cy={y} r="3" fill={BRAND_COLORS.yellow}>
            {animate && (
              <animate attributeName="r" values="3;4;3" dur="1.5s" begin={`${i * 0.2 + 0.5}s`} repeatCount="indefinite" />
            )}
          </circle>
        </g>
      ))}

      {/* Data flow animation */}
      {animate && (
        <>
          <circle r="2" fill={BRAND_COLORS.yellow}>
            <animateMotion dur="2s" repeatCount="indefinite" path="M8,24 L32,32 L56,24" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r="2" fill={BRAND_COLORS.orange}>
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M8,40 L32,32 L56,40" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

// ============================================
// DIGITRUST ICON (Fingerprint/blockchain)
// ============================================

export function DigiTrustIcon({
  className = "",
  size = 64,
  animate = true,
  variant = "default",
}: ProductIconProps) {
  const gradientId = `digitrust-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.yellow} />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} />
        </linearGradient>
      </defs>

      {/* Fingerprint arcs */}
      <g fill="none" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round">
        <path d="M24 42 Q24 26, 32 20 Q40 26, 40 42">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,60;60,0" dur="1.5s" fill="freeze" />
          )}
        </path>
        <path d="M20 44 Q20 24, 32 16 Q44 24, 44 44" opacity="0.7">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,80;80,0" dur="1.8s" fill="freeze" />
          )}
        </path>
        <path d="M16 46 Q16 22, 32 12 Q48 22, 48 46" opacity="0.5">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2.1s" fill="freeze" />
          )}
        </path>
        <path d="M12 48 Q12 20, 32 8 Q52 20, 52 48" opacity="0.3">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,120;120,0" dur="2.4s" fill="freeze" />
          )}
        </path>
      </g>

      {/* Center verification dot */}
      <circle cx="32" cy="32" r="4" fill={BRAND_COLORS.orange}>
        {animate && (
          <>
            <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />
          </>
        )}
      </circle>

      {/* Blockchain chain links */}
      <g stroke={BRAND_COLORS.yellow} strokeWidth="1" opacity="0.4">
        <line x1="28" y1="28" x2="20" y2="20" />
        <line x1="36" y1="28" x2="44" y2="20" />
        <circle cx="18" cy="18" r="3" fill={BRAND_COLORS.yellow} opacity="0.5" />
        <circle cx="46" cy="18" r="3" fill={BRAND_COLORS.yellow} opacity="0.5" />
      </g>
    </svg>
  );
}

// ============================================
// DIGITRACK ICON (Location/tracking)
// ============================================

export function DigiTrackIcon({
  className = "",
  size = 64,
  animate = true,
  variant = "default",
}: ProductIconProps) {
  const gradientId = `digitrack-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.red} />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} />
        </linearGradient>
      </defs>

      {/* Map marker pin */}
      <path
        d="M32 8 C20 8 12 18 12 28 C12 42 32 56 32 56 C32 56 52 42 52 28 C52 18 44 8 32 8 Z"
        fill={variant === "filled" ? `url(#${gradientId})` : "none"}
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
      >
        {animate && (
          <animate
            attributeName="transform"
            values="translate(0,0);translate(0,-3);translate(0,0)"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Inner circle */}
      <circle cx="32" cy="26" r="8" fill={BRAND_COLORS.orange} opacity="0.3" />
      <circle cx="32" cy="26" r="4" fill={BRAND_COLORS.orange}>
        {animate && (
          <animate attributeName="r" values="4;5;4" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Tracking waves */}
      {animate && (
        <>
          <circle cx="32" cy="26" r="12" fill="none" stroke={BRAND_COLORS.yellow} strokeWidth="1" opacity="0">
            <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="26" r="8" fill="none" stroke={BRAND_COLORS.yellow} strokeWidth="1" opacity="0">
            <animate attributeName="r" values="8;18;8" dur="2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

// ============================================
// BOACRM ICON (People/CRM)
// ============================================

export function BoaCRMIcon({
  className = "",
  size = 64,
  animate = true,
  variant = "default",
}: ProductIconProps) {
  const gradientId = `boacrm-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.primary} />
          <stop offset="100%" stopColor={BRAND_COLORS.secondary} />
        </linearGradient>
      </defs>

      {/* Central person */}
      <g fill={`url(#${gradientId})`}>
        <circle cx="32" cy="20" r="8" />
        <path d="M20 48 Q20 34, 32 34 Q44 34, 44 48 L44 52 L20 52 Z" />
      </g>

      {/* Left person */}
      <g fill={BRAND_COLORS.orange} opacity="0.8">
        <circle cx="14" cy="26" r="5">
          {animate && (
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          )}
        </circle>
        <path d="M6 44 Q6 36, 14 36 Q22 36, 22 44 L22 46 L6 46 Z" />
      </g>

      {/* Right person */}
      <g fill={BRAND_COLORS.yellow} opacity="0.8">
        <circle cx="50" cy="26" r="5">
          {animate && (
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.5s" repeatCount="indefinite" />
          )}
        </circle>
        <path d="M42 44 Q42 36, 50 36 Q58 36, 58 44 L58 46 L42 46 Z" />
      </g>

      {/* Connection lines */}
      <g stroke={BRAND_COLORS.primary} strokeWidth="1.5" opacity="0.4">
        <line x1="22" y1="22" x2="26" y2="20">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,10;10,0" dur="1s" fill="freeze" />
          )}
        </line>
        <line x1="42" y1="22" x2="38" y2="20">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,10;10,0" dur="1s" begin="0.3s" fill="freeze" />
          )}
        </line>
      </g>

      {/* Data sync indicator */}
      {animate && (
        <g>
          <circle cx="32" cy="12" r="2" fill={BRAND_COLORS.yellow}>
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  );
}

// ============================================
// AI ADVISORY ICON (Brain/AI)
// ============================================

export function AIAdvisoryIcon({
  className = "",
  size = 64,
  animate = true,
  variant = "default",
}: ProductIconProps) {
  const gradientId = `ai-advisory-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.yellow} />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} />
        </linearGradient>
        <filter id="ai-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Brain shape */}
      <path
        d="M32 8 C22 8 14 16 14 26 C14 32 17 37 20 40 C17 43 14 48 14 52 C14 56 18 58 24 58 L40 58 C46 58 50 56 50 52 C50 48 47 43 44 40 C47 37 50 32 50 26 C50 16 42 8 32 8"
        fill={variant === "filled" ? `url(#${gradientId})` : "none"}
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Neural network lines */}
      <g stroke={BRAND_COLORS.orange} strokeWidth="1" opacity="0.5">
        <path d="M22 22 Q32 18, 42 22" fill="none" />
        <path d="M20 32 Q32 28, 44 32" fill="none" />
        <path d="M22 42 Q32 38, 42 42" fill="none" />
      </g>

      {/* Neural nodes */}
      {[
        { cx: 22, cy: 22 },
        { cx: 42, cy: 22 },
        { cx: 32, cy: 18 },
        { cx: 20, cy: 32 },
        { cx: 32, cy: 28 },
        { cx: 44, cy: 32 },
        { cx: 22, cy: 42 },
        { cx: 32, cy: 38 },
        { cx: 42, cy: 42 },
      ].map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r="2.5"
          fill={i % 2 === 0 ? BRAND_COLORS.orange : BRAND_COLORS.yellow}
          filter={animate ? "url(#ai-glow)" : undefined}
        >
          {animate && (
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur={`${1.5 + i * 0.1}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}

      {/* Thinking pulse */}
      {animate && (
        <circle cx="32" cy="32" r="20" fill="none" stroke={BRAND_COLORS.yellow} strokeWidth="1" opacity="0">
          <animate attributeName="r" values="20;28;20" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

// ============================================
// CYBERSECURITY ICON (Lock/shield)
// ============================================

export function CybersecurityIcon({
  className = "",
  size = 64,
  animate = true,
  variant = "default",
}: ProductIconProps) {
  const gradientId = `cyber-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.red} />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} />
        </linearGradient>
      </defs>

      {/* Lock body */}
      <rect
        x="16"
        y="28"
        width="32"
        height="28"
        rx="4"
        fill={variant === "filled" ? `url(#${gradientId})` : "none"}
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
      />

      {/* Lock shackle */}
      <path
        d="M24 28 L24 18 C24 12 28 8 32 8 C36 8 40 12 40 18 L40 28"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Keyhole */}
      <circle cx="32" cy="40" r="4" fill={BRAND_COLORS.orange}>
        {animate && (
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>
      <rect x="30" y="42" width="4" height="8" rx="1" fill={BRAND_COLORS.orange} />

      {/* Security waves */}
      {animate && (
        <>
          <circle cx="32" cy="42" r="10" fill="none" stroke={BRAND_COLORS.yellow} strokeWidth="1" opacity="0">
            <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

// ============================================
// CLOUD PLATFORM ICON
// ============================================

export function CloudPlatformIcon({
  className = "",
  size = 64,
  animate = true,
  variant = "default",
}: ProductIconProps) {
  const gradientId = `cloud-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.primary} />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} />
        </linearGradient>
      </defs>

      {/* Cloud shape */}
      <path
        d="M48 28 C48 20 42 16 36 16 C32 16 28 18 26 22 C24 20 20 20 18 22 C14 22 10 26 10 32 C10 38 14 42 20 42 L46 42 C52 42 56 38 56 32 C56 28 52 26 48 28 Z"
        fill={variant === "filled" ? `url(#${gradientId})` : "none"}
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
      >
        {animate && (
          <animate
            attributeName="transform"
            values="translate(0,0);translate(0,-2);translate(0,0)"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Server indicators */}
      <g fill={BRAND_COLORS.orange} opacity="0.8">
        <rect x="22" y="32" width="8" height="4" rx="1">
          {animate && (
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
          )}
        </rect>
        <rect x="34" y="32" width="8" height="4" rx="1">
          {animate && (
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" begin="0.3s" repeatCount="indefinite" />
          )}
        </rect>
      </g>

      {/* Upload/download arrows */}
      {animate && (
        <>
          <path d="M28 52 L28 46 L24 50 M28 46 L32 50" fill="none" stroke={BRAND_COLORS.yellow} strokeWidth="2" strokeLinecap="round">
            <animate attributeName="transform" values="translate(0,0);translate(0,-4);translate(0,0)" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M40 46 L40 52 L36 48 M40 52 L44 48" fill="none" stroke={BRAND_COLORS.primary} strokeWidth="2" strokeLinecap="round">
            <animate attributeName="transform" values="translate(0,0);translate(0,4);translate(0,0)" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
}

// ============================================
// COMBINED EXPORT
// ============================================

export const ProductIcons = {
  TrustMeHub: TrustMeHubIcon,
  DigiGate: DigiGateIcon,
  DigiTrust: DigiTrustIcon,
  DigiTrack: DigiTrackIcon,
  BoaCRM: BoaCRMIcon,
  AIAdvisory: AIAdvisoryIcon,
  Cybersecurity: CybersecurityIcon,
  CloudPlatform: CloudPlatformIcon,
};

export default ProductIcons;
