// components/settings-form.tsx

"use client";
import {
  updateName,
  updateEmail,
  updatePassword,
} from "@/lib/actions/user-profile";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function SettingsForm({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [passwordForEmail, setPasswordForEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdateName = async () => {
    setIsLoading(true);
    const result = await updateName(name);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Name successfully updated");
    }
    setIsLoading(false);
  };

  const handleUpdateEmail = async () => {
    if (newEmail === email) {
      setError("New email must be different from current email.");
      return;
    }
    setIsLoading(true);
    const result = await updateEmail({
      newEmail,
      password: passwordForEmail,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Email successfully updated!");
      setEmail(newEmail);
      setNewEmail("");
      setPasswordForEmail("");
    }
    setIsLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    const result = await updatePassword({
      currentPassword,
      newPassword,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Password successfully updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Name Section */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <div className="flex gap-2">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={handleUpdateName} disabled={isLoading}>
            Update Name
          </Button>
        </div>
      </div>

      {/* Email Section */}
      <div className="space-y-2">
        <Label htmlFor="name">Email</Label>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="space-y-2">
          <Input
            placeholder="New Email Address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm Password to Change Email"
            value={passwordForEmail}
            onChange={(e) => setPasswordForEmail(e.target.value)}
          />
          <Button onClick={handleUpdateEmail} disabled={isLoading}>
            Update Email
          </Button>
        </div>
      </div>

      {/* Password Section */}
      <div className="space-y-2">
        <Label>Change Password</Label>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button onClick={handleUpdatePassword} disabled={isLoading}>
            Update Password
          </Button>
        </div>
      </div>

      {error && <p className="text-destructive">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
}
