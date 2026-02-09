import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

// Cache OG images aggressively
export const revalidate = 31536000; // 1 year

/**
 * Dynamic OG image generation endpoint.
 *
 * Query params:
 *   title    - Post/page title (required for post type)
 *   author   - Author display name
 *   category - Category label
 *   date     - Formatted publication date
 *   type     - "post" | "page" | "default"
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const title = searchParams.get("title") || "KTBlog";
  const author = searchParams.get("author") || "";
  const category = searchParams.get("category") || "";
  const date = searchParams.get("date") || "";
  const type = searchParams.get("type") || "post";

  // Fetch Inter font from Google Fonts for consistent rendering
  const interBold = await fetch(
    "https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap"
  ).then(() =>
    fetch(
      "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf"
    ).then((res) => res.arrayBuffer())
  ).catch(() => null);

  const interMedium = await fetch(
    "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI2fMZhrib2Bg-4.ttf"
  ).then((res) => res.arrayBuffer()).catch(() => null);

  // Determine font size based on title length for graceful handling
  function getTitleFontSize(text: string): number {
    if (text.length > 100) return 36;
    if (text.length > 80) return 40;
    if (text.length > 60) return 46;
    return 54;
  }

  // Truncate title with ellipsis if too long
  function truncateTitle(text: string, maxLen: number = 120): string {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen - 3) + "...";
  }

  // Default type: centered logo + tagline
  if (type === "default") {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0c1929 0%, #1a2d50 25%, #1E4DB7 50%, #0d7377 100%)",
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            position: "relative",
          }}
        >
          {/* Dot pattern overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Decorative gradient orbs */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "320px",
              height: "320px",
              borderRadius: "9999px",
              background: "rgba(245,154,35,0.15)",
              filter: "blur(80px)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-80px",
              left: "-80px",
              width: "320px",
              height: "320px",
              borderRadius: "9999px",
              background: "rgba(13,115,119,0.2)",
              filter: "blur(80px)",
              display: "flex",
            }}
          />

          {/* Logo mark */}
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: 700,
              color: "white",
              marginBottom: "24px",
              boxShadow: "0 20px 40px rgba(59,130,246,0.3)",
            }}
          >
            K
          </div>

          {/* Brand name */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.03em",
              marginBottom: "16px",
              display: "flex",
            }}
          >
            KTBlog
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "22px",
              fontWeight: 500,
              color: "rgba(226,232,240,0.8)",
              letterSpacing: "0.02em",
              display: "flex",
            }}
          >
            Insights, Tutorials & Expert Knowledge
          </div>

          {/* Domain */}
          <div
            style={{
              position: "absolute",
              bottom: "32px",
              right: "48px",
              fontSize: "16px",
              fontWeight: 500,
              color: "rgba(148,163,184,0.6)",
              display: "flex",
            }}
          >
            drkatangablog.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400",
        },
        ...(interBold
          ? {
              fonts: [
                { name: "Inter", data: interBold, weight: 700 as const, style: "normal" as const },
                ...(interMedium
                  ? [{ name: "Inter", data: interMedium, weight: 500 as const, style: "normal" as const }]
                  : []),
              ],
            }
          : {}),
      }
    );
  }

  // Post and page types: full blog post OG image
  const displayTitle = truncateTitle(title);
  const titleFontSize = getTitleFontSize(displayTitle);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 60px",
          background: "linear-gradient(135deg, #0c1929 0%, #1a2d50 25%, #1E4DB7 50%, #0d7377 100%)",
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
          position: "relative",
        }}
      >
        {/* Dot pattern overlay for visual interest */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Decorative gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "9999px",
            background: "rgba(245,154,35,0.12)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "9999px",
            background: "rgba(13,115,119,0.15)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* Top row: KTBlog brand + category badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Logo mark + brand name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 700,
                color: "white",
                boxShadow: "0 8px 20px rgba(59,130,246,0.3)",
              }}
            >
              K
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#e2e8f0",
                letterSpacing: "-0.02em",
              }}
            >
              KTBlog
            </span>
          </div>

          {/* Category badge */}
          {category && (
            <div
              style={{
                display: "flex",
                padding: "8px 22px",
                borderRadius: "9999px",
                background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.35)",
                fontSize: "15px",
                fontWeight: 600,
                color: "#93c5fd",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Title area - centered vertically in remaining space */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            justifyContent: "center",
            paddingTop: "16px",
            paddingBottom: "16px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: `${titleFontSize}px`,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              maxWidth: "92%",
              display: "flex",
            }}
          >
            {displayTitle}
          </div>
        </div>

        {/* Bottom row: author info + domain */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(148, 163, 184, 0.15)",
            paddingTop: "22px",
            position: "relative",
          }}
        >
          {/* Author */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            {author && (
              <>
                {/* Author avatar circle */}
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "9999px",
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "white",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                  }}
                >
                  {author.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "#e2e8f0",
                    }}
                  >
                    {author}
                  </span>
                  {date && (
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 400,
                        color: "#94a3b8",
                      }}
                    >
                      {date}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Domain */}
          <div
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "rgba(148,163,184,0.7)",
              display: "flex",
            }}
          >
            drkatangablog.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400",
      },
      ...(interBold
        ? {
            fonts: [
              { name: "Inter", data: interBold, weight: 700 as const, style: "normal" as const },
              ...(interMedium
                ? [{ name: "Inter", data: interMedium, weight: 500 as const, style: "normal" as const }]
                : []),
            ],
          }
        : {}),
    }
  );
}
