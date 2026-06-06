// app/settings/page.tsx

import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import ProfileImageSection from "@/components/profile-image-section";
import SettingsForm from "@/components/settings-form";
import DeleteAccountSection from "@/components/delete-account-section";
import { Suspense } from "react";

async function SettingsContent() {
  const session = await getSession();

  // Middleware handles the redirect, but this is a server-side safety net
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-3xl font-bold text-black">Account Settings</h1>
      <p className="mb-8 text-gray-600">Manage your profile and account</p>

      <div className="space-y-8">
        <ProfileImageSection
          currentImage={session.user.image ?? null}
          name={session.user.name}
        />

        <SettingsForm
          user={{
            name: session.user.name,
            email: session.user.email,
          }}
        />

        <DeleteAccountSection />
      </div>
    </div>
  );
}

// Outer shell – exported default, owns the Suspense boundry
export default async function SettingsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense
        fallback={
          <div className="container mx-auto max-w-2xl p-6">
            <p className="p-6 text-muted-foreground">Loading settings…</p>
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </div>
  );
}
