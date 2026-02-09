import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const title = searchParams.get("title") || "KTBlog";
  const author = searchParams.get("author") || "";
  const category = searchParams.get("category") || "";
  const date = searchParams.get("date") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top row: logo and category badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo text */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
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
                padding: "8px 20px",
                borderRadius: "9999px",
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                fontSize: "16px",
                fontWeight: 600,
                color: "#93c5fd",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            justifyContent: "center",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? "42px" : "52px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: "90%",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom row: author and date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(148, 163, 184, 0.2)",
            paddingTop: "24px",
          }}
        >
          {author && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {/* Author avatar placeholder */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "9999px",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {author.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#cbd5e1",
                }}
              >
                {author}
              </span>
            </div>
          )}

          {date && (
            <span
              style={{
                fontSize: "16px",
                fontWeight: 400,
                color: "#94a3b8",
              }}
            >
              {date}
            </span>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
