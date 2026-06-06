"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import {
  updateName,
  updateEmail,
  updatePassword,
} from "@/lib/actions/user-profile";

// ─── DRY helper ───────────────────────────────────────────────────────────────
// Runs an action with loading state and dispatches toast automatically.
// Returns the result so callers can do extra work on success (e.g. reset fields).

async function runWithLoading(
  setLoading: (v: boolean) => void,
  action: () => Promise<{ error?: string; success?: boolean }>,
  successMessage: string,
): Promise<{ error?: string; success?: boolean }> {
  setLoading(true);
  const result = await action();
  if (result.error) {
    toast.error(result.error);
  } else {
    toast.success(successMessage);
  }
  setLoading(false);
  return result;
}

export default function SettingsForm({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [name, setName] = useState(user.name);
  const [nameLoading, setNameLoading] = useState(false);

  const [currentEmail, setCurrentEmail] = useState(user.email);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleUpdateName() {
    await runWithLoading(
      setNameLoading,
      () => updateName(name),
      "Name updated",
    );
  }

  async function handleUpdateEmail(e: React.SubmitEvent) {
    e.preventDefault();
    const result = await runWithLoading(
      setEmailLoading,
      () => updateEmail({ newEmail, currentPassword: emailPassword }),
      "Email updated",
    );
    if (!result.error) {
      setCurrentEmail(newEmail.trim().toLowerCase());
      setNewEmail("");
      setEmailPassword("");
    }
  }

  async function handleUpdatePassword(e: React.SubmitEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    const result = await runWithLoading(
      setPasswordLoading,
      () => updatePassword({ currentPassword, newPassword }),
      "Password updated",
    );
    if (!result.error) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Name ── */}
      <Card>
        <CardHeader>
          <CardTitle>Display Name</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdateName} disabled={nameLoading}>
            {nameLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Name
          </Button>
        </CardContent>
      </Card>

      {/* ── Email ── */}
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Email</Label>
              <Input value={currentEmail} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="newemail@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailPassword">Current Password</Label>
              <Input
                id="emailPassword"
                type="password"
                placeholder="Confirm your identity"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={emailLoading}>
              {emailLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Change Email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Password ── */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
