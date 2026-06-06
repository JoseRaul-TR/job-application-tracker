// proxy.ts

import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth session cookies (check both secure and non-secure variants)
  const cookies = request.cookies;
  const sessionCookie =
    cookies.get("better-auth.session_token") ??
    cookies.get("__Secure-better-auth.session_token") ??
    cookies.get("better-auth.session");

  const hasSession = !!sessionCookie?.value;

  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/settings");

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedPage && !hasSession) {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    // Ensure cookies are passed through for the sign-in page
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/sign-in", "/sign-up"],
};
