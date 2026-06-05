// lib/auth/auth.ts

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

export const auth = betterAuth({
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? [
    "http://localhost:3000",
  ],
  database: mongodbAdapter(db, {
    client,
  }),
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.id) {
            await initializeUserBoard(user.id);
          }
        },
      },
    },
  },
});

export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  return result;
}

export async function signOut() {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  if (result.success) {
    redirect("/sign-in");
  }
}
