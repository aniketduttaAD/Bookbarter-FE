import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authPaths = ["/login", "/signup", "/forgot-password"];

const protectedPaths = [
    "/dashboard",
    "/profile",
    "/books/new",
    "/messages",
    "/wishlist",
];

const isProtectedPath = (path: string) =>
    protectedPaths.some(protectedPath =>
        path === protectedPath || path.startsWith(`${protectedPath}/`)
    );

const isAuthPath = (path: string) => authPaths.includes(path);

/**
 * Extracts authentication data from cookies
 */
function getAuthFromCookie(request: NextRequest) {
    const cookieValue = request.cookies.get("auth-storage")?.value;

    if (!cookieValue) {
        return { isAuthenticated: false, userRole: null };
    }

    try {
        const parsed = JSON.parse(cookieValue);

        // Handle both direct state and nested state structure
        const state = parsed.state || parsed;

        return {
            isAuthenticated: Boolean(state.isAuthenticated),
            userRole: state.user?.role || null
        };
    } catch {
        return { isAuthenticated: false, userRole: null };
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get auth from cookies
    const { isAuthenticated, userRole } = getAuthFromCookie(request);

    // If user is authenticated and tries to access auth pages (login, signup), redirect to dashboard
    if (isAuthenticated && isAuthPath(pathname)) {
        const dashboardPath = userRole === "owner" ? "/dashboard/owner" : "/dashboard/seeker";
        return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // If user is not authenticated and tries to access protected routes, redirect to login
    if (!isAuthenticated && isProtectedPath(pathname)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|public|favicon.ico).*)"],
};