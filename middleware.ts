import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the JWT token
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  const isAuthenticated = !!token; // Check if token exists
  console.log("isAuthenticated", isAuthenticated);
  // Case 1: If trying to access /dashboard and not authenticated, redirect to login
  if (req.nextUrl.pathname.startsWith("/dashboard") && !isAuthenticated) {
    console.log("not Authenticated");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Case 2: If trying to access /login and already authenticated, redirect to /dashboard
  if (req.nextUrl.pathname === "/login" && isAuthenticated) {
    console.log("already authenticated");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next(); // Proceed to the next middleware if authenticated or not a protected route
}

// Apply middleware to /dashboard and /login routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ], // Match both /dashboard and /login routes
};
