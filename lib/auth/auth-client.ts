// lib/auth/auth-client.ts

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Always points to whatever origin the page was loaded from.
  // Works for localhost, network IP, and production without changes.
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
});

export const { signIn, signUp, signOut, useSession } = authClient;
