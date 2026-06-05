// lib/actions/user-profile.ts

"use server";

import { getSession } from "@/lib/auth/auth";
import { auth } from "@/lib/auth/auth";
import cloudinary from "cloudinary";
import connectDB from "@/lib/db";
import { User } from "@/lib/models";
import { headers } from "next/headers";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function updateProfileImage(formData: FormData) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("image") as File;
  if (!file) {
    return { error: "No image provided" };
  }

  try {
    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: "profile-images",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    const imageUrl = (result as { secure_url: string }).secure_url;

    // Save URL to user in DB
    await connectDB();
    await User.findByIdAndUpdate(
      session.user.id,
      { image: imageUrl },
      { new: true },
    );

    return { data: { imageUrl } };
  } catch (err) {
    return { error: "Failed to upload image" };
  }
}

export async function updateName(newName: string) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  if (!newName.trim()) {
    return { error: "Name cannot be empty" };
  }
  await connectDB();
  await User.findByIdAndUpdate(session.user.id, { name: newName.trim() });
  return { data: { name: newName } };
}

export async function updateEmail({
  newEmail,
  password,
}: {
  newEmail: string;
  password: string;
}) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  if (!newEmail.trim()) {
    return { error: "Email cannot be empty" };
  }

  // Verify current password
  const user = await auth.api.getUser({ id: session.user.id });
  if (!user || !(await auth.api.verifyPassword({ password, user }))) {
    return { error: "Incorrect password" };
  }

  // Check if email is unique
  await connectDB();
  const existingUser = await User.findOne({ email: newEmail.trim() });
  if (existingUser) {
    return { error: "Email already in use" };
  }

  // Update email
  await User.findByIdAndUpdate(session.user.id, { email: newEmail.trim() });
  return { data: { email: newEmail } };
}

export async function updatePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  // Verify current password
  const user = await auth.api.getUser({ id: session.user.id });
  if (
    !user ||
    !(await auth.api.verifyPassword({ password: currentPassword, user }))
  ) {
    return { error: "Incorrect current password" };
  }

  // Update password
  await auth.api.updateUser({
    id: session.user.id,
    password: newPassword,
  });

  return { data: { success: true } };
}

export async function deleteAccount(password: string) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  // Verify password
  const user = await auth.api.getUser({ id: session.user.id });
  if (!user || !(await auth.api.verifyPassword({ password, user }))) {
    return { error: "Incorrect password" };
  }

  // Delete user and all related data
  await connectDB();
  await User.findByIdAndDelete(session.user.id);
  // Optionally: Delete boards, job applications, etc.
  // await Board.deleteMany({ userId: session.user.id });
  // await JobApplication.deleteMany({ userId: session.user.id });

  // Sign out the user
  await auth.api.signOut({ headers: await headers() });

  return { data: { success: true } };
}
