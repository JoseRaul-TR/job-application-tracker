"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  updateName,
  updateEmail,
  updatePassword,
} from "@/lib/actions/user-profile";

interface StatusState {
  error?: string;
  success?: string;
}

export default function SettingsForm({
  user,
}: {
  user: { name: string; email: string };
}) {
  // –– Name states –––
  const [name, setName] = useState(user.name);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameStatus, setNameStatus] = useState<StatusState>({});
  // –– Email states –––
  const [currentEmail, setCurrentEmail] = useState(user.email);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<StatusState>({});
  // –– Password states –––
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<StatusState>({});

  // ––– Handlers –––

  async function handleUpdateName() {
    setNameLoading(true);
    setNameStatus({});
    const result = await updateName(name);
    setNameStatus(
      result.error
        ? { error: result.error }
        : { success: "Name updated successfully" },
    );
    setNameLoading(false);
  }

  async function handleUpdateEmail(e: React.SubmitEvent) {
    e.preventDefault();
    setEmailStatus({});

    setEmailLoading(true);
    const result = await updateEmail({
      newEmail,
      currentPassword: emailPassword,
    });

    if (result.error) {
      setEmailStatus({ error: result.error });
    } else {
      setEmailStatus({ success: "Email updated successfully" });
      setCurrentEmail(newEmail.trim().toLowerCase());
      setNewEmail("");
      setEmailPassword("");
    }
    setEmailLoading(false);
  }

  async function handleUpdatePassword(e: React.SubmitEvent) {
    e.preventDefault();
    setPasswordStatus({});

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ error: "Password must be at least 8 characters" });
      return;
    }

    setPasswordLoading(true);
    const result = await updatePassword({ currentPassword, newPassword });

    if (result.error) {
      setPasswordStatus({ error: result.error });
    } else {
      setPasswordStatus({ success: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
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
          {nameStatus.error && (
            <p className="text-sm text-destructive">{nameStatus.error}</p>
          )}
          {nameStatus.success && (
            <p className="text-sm text-green-600">{nameStatus.success}</p>
          )}
          <Button onClick={handleUpdateName} disabled={nameLoading}>
            {nameLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Name
          </Button>
        </CardContent>
      </Card>

      {/* ––– Email ––– */}
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
                placeholder="Introduce your password to confirm your identity"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                required
              />
            </div>
            {emailStatus.error && (
              <p className="text-sm text-destructive">{emailStatus.error}</p>
            )}
            {emailStatus.success && (
              <p className="text-sm text-green-600">{emailStatus.success}</p>
            )}
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
            {passwordStatus.error && (
              <p className="text-sm text-destructive">{passwordStatus.error}</p>
            )}
            {passwordStatus.success && (
              <p className="text-sm text-green-600">{passwordStatus.success}</p>
            )}
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
