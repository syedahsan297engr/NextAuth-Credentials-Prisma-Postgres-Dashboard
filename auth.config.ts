import type { NextAuthConfig } from "next-auth";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export const authConfig = {
  secret: NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        console.log("not authorized bro");
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
  session: {
    strategy: "jwt", // Default strategy; you can also use 'database'
    maxAge: 120, // 120 seconds
    updateAge: 60, // Refresh min
  },
} satisfies NextAuthConfig;

// https://next-auth.js.org/configuration/options
