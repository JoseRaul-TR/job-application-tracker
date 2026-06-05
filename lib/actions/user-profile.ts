// lib/actions/user-profile.ts

"use server";

import { revalidatePath } from "next/cache";
import { auth, getSession } from "@/lib/auth/auth";
import { v2 as cloudinary } from "cloudinary";
import { headers } from "next/headers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_url: process.env.CLOUDINARY_URL,
});

// ––– Profile Image –––

export async function updateProfileImage(formData: FormData) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };

  const file = formData.get("image") as File | null;
  if (!file || !file.size) return { error: "No image provided" };
  if (!file.type.startsWith("image/")) return { error: "File mus be an image" };
  if (file.size > 2 * 1024 * 1024) return { error: "Image must be under 2MB" };

  try {
    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const imageUrl = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "job-tracker/profile-images",
            resource_type: "image",
            // Overwrite previous image using ID as public_id
            public_id: `user-${session.user.id}`,
            overwrite: true,
          },
          (error, result) => {
            if (error || !result) reject(error ?? new Error("Upload failed"));
            else resolve(result.secure_url);
          },
        )
        .end(buffer);
    });

    // Save Cloudinary URL to Better Auth's own user record
    await auth.api.updateUser({
      body: { image: imageUrl },
      headers: await headers(),
    });

    revalidatePath("/settings");
    return { data: { imageUrl } };
  } catch (err) {
    console.error("Image upload error:", err);
    return { error: "Failed to upload image" };
  }
}

// ––– Name –––

export async function updateName(newName: string) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };

  const trimmed = newName.trim();
  if (!trimmed) return { error: "Name cannot be empty" };

  try {
    await auth.api.updateUser({
      body: { name: trimmed },
      headers: await headers(),
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Update name error:", err);
    return { error: "Failed to update name" };
  }
}

// ––– Email –––

export async function updateEmail({
  newEmail,
  currentPassword,
}: {
  newEmail: string;
  currentPassword: string;
}) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };

  const trimmed = newEmail.trim().toLowerCase();
  if (!trimmed) return { error: "Email cannot be empty" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return { error: "Invalid email address" };

  if (trimmed === session.user.email.toLowerCase()) {
    return { error: "New email must be different from your current email" };
  }

  // Require current password before a sensitive account change
  try {
    await auth.api.signInEmail({
      body: { email: session.user.email, password: currentPassword },
    });
  } catch {
    return { error: "Incorrect password" };
  }

  try {
    await auth.api.changeEmail({
      body: { newEmail: trimmed },
      headers: await headers(),
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (err: unknown) {
    console.error("Update email error", err);
    const message = err instanceof Error ? err.message : "";
    // Better Auth throws when the email is already taken
    if (message.toLowerCase().includes("email")) {
      return { error: "Email already in use by another account" };
    }
    return { error: "Failed to update email" };
  }
}

// ––– Password –––

export async function updatePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to change password";
    // Better Auth returns "Invalid password" when currentPassword is wrong
    return { error: message };
  }
}

// ––– Delete Account –––

export async function deleteAccount(password: string) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  if (!password) return { error: "Password is required" };

  // Verify password by attempting sign-in before destructive action
  // The session created here is cleaned up when deleteUser runs below
  try {
    await auth.api.signInEmail({
      body: {
        email: session.user.email,
        password,
      },
    });
  } catch {
    return { error: "Incorrect password" };
  }

try {
    // databaseHooks.user.delete.before in auth.ts handles cascade deletion
    await auth.api.deleteUser({
      body: {},
      headers: await headers(),
    });
    return { success: true };
  } catch (err) {
    console.error("Delete account error:", err);
    return { error: "Failed to delete account" };
  }
}
