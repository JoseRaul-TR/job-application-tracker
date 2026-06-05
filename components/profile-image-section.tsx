// components/profile-image-section.tsx

"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileImage } from "@/lib/actions/user-profile";

export default function ProfileImageSection({
  currentImage,
  name,
}: {
  currentImage?: string | null;
  name?: string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(currentImage ?? "");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!selectedFile) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("image", selectedFile);

    const result = await updateProfileImage(formData);

    if (!result.error && result.data?.imageUrl) {
      setPreview(result.data.imageUrl);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profile Image</h2>

      <Avatar className="h-24 w-24">
        <AvatarImage src={preview} />
        <AvatarFallback>
          {name?.charAt(0).toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>

      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          setSelectedFile(file);
          setPreview(URL.createObjectURL(file));
        }}
      />

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
      >
        {loading ? "Uploading..." : "Save Image"}
      </Button>
    </div>
  );
}