import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

import ProfileImageSection from "@/components/profile-image-section";
import SettingsForm from "@/components/settings-form";
import DeleteAccountSection from "@/components/delete-account-section";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Account Settings</h1>

      <div className="space-y-10">
        <ProfileImageSection
          currentImage={session.user.image}
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
