// lib/auth/auth.ts

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  user: {
    changeEmail: {
      // No sendChangeEmailVerification callback = changes email immediately.
      // Add a callback here when you add an email provider (Resend, etc.)
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
      delete: {
        before: async (user) => {
          // Cascade-delete all app data before Better Auth removes the user record
          await connectDB();
          const boards = await Board.find({ userId: user.id });
          const boardIds = boards.map((b) => b._id);
          await JobApplication.deleteMany({ userID: user.id });
          await Column.deleteMany({ boardID: { $in: boardIds } });
          await Board.deleteMany({ userId: user.id });
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
