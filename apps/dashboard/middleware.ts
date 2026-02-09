import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

// Static assets and API routes to skip
const SKIP_PATTERNS = [
    "/_next",
    "/api",
    "/favicon.ico",
    "/logo",
    "/images",
    "/fonts",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico",
    ".webp",
];

/**
 * Check if the path matches any skip patterns
 */
function shouldSkipPath(pathname: string): boolean {
    return SKIP_PATTERNS.some(
        (pattern) =>
            pathname.startsWith(pattern) || pathname.endsWith(pattern)
    );
}

/**
 * Check if the route is public (doesn't require auth)
 */
function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verify token validity
 * In a production environment, you might want to verify the JWT signature
 * For now, we just check if the token exists and is not expired
 */
function isTokenValid(token: string | undefined): boolean {
    if (!token) return false;

    try {
        // Basic JWT structure check (header.payload.signature)
        const parts = token.split(".");
        if (parts.length !== 3) return false;

        // Decode and check expiration
        const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString("utf-8")
        );

        if (payload.exp) {
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const bufferTime = 60 * 1000; // 1 minute buffer

            // Token is valid if not expired (with buffer)
            return expirationTime > currentTime - bufferTime;
        }

        // If no expiration, consider valid
        return true;
    } catch {
        // If token can't be parsed, it's invalid
        return false;
    }
}

/**
 * Extract token from request
 * Checks both cookies and Authorization header
 */
function getTokenFromRequest(request: NextRequest): string | undefined {
    // Check Authorization header first
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }

    // Check cookies
    const tokenFromCookie = request.cookies.get("auth_token")?.value;
    if (tokenFromCookie) {
        return tokenFromCookie;
    }

    return undefined;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static assets and API routes
    if (shouldSkipPath(pathname)) {
        return NextResponse.next();
    }

    // Get token from request
    const token = getTokenFromRequest(request);
    const isValid = isTokenValid(token);

    // Handle public routes
    if (isPublicRoute(pathname)) {
        // If user is already authenticated and tries to access login,
        // redirect to dashboard
        if (isValid && pathname === "/login") {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // For protected routes, check authentication
    if (!isValid) {
        // Store the original URL to redirect back after login
        const loginUrl = new URL("/login", request.url);

        // Add the original path as a redirect parameter
        if (pathname !== "/" && pathname !== "/login") {
            loginUrl.searchParams.set("redirect", pathname);
        }

        return NextResponse.redirect(loginUrl);
    }

    // Token is valid, proceed with the request
    const response = NextResponse.next();

    // Add security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );

    return response;
}

// Configure which routes the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
