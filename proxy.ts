// proxy.ts

import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth session cookie (http in dev, __Secure- in prod)
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const hasSession = !!sessionCookie?.value;

  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/settings");

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedPage && !hasSession) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/sign-in", "/sign-up"],
};
