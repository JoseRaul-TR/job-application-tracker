// components/profile-image-section.tsx

"use client";

import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { updateProfileImage } from "@/lib/actions/user-profile";
import { Camera, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface ProfileImageSectionProps {
  currentImage?: string | null;
  name?: string;
}

export default function ProfileImageSection({
  currentImage,
  name,
}: ProfileImageSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage ?? "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ error?: string; success?: string }>(
    {},
  );

  const inputRef = useRef<HTMLInputElement>(null);
  // Keep track of the blob URL to revoke it and avoid memory leaks
  const previewBlobRef = useRef<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus({});

    if (!file.type.startsWith("image/")) {
      setStatus({ error: "File must be an image" });
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setStatus({ error: `Image must be under ${MAX_SIZE_MB}MB` });
      return;
    }

    // Revoke previous blob URL before creating a new one
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
    }
    const blobUrl = URL.createObjectURL(file);
    previewBlobRef.current = blobUrl;

    setSelectedFile(file);
    setPreview(blobUrl);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setLoading(true);
    setStatus({});

    const formData = new FormData();
    formData.append("image", selectedFile);

    const result = await updateProfileImage(formData);

    if (result.error) {
      setStatus({ error: result.error });
      // Revert preview to the saved image on error
      if (previewBlobRef.current) {
        URL.revokeObjectURL(previewBlobRef.current);
        previewBlobRef.current = null;
      }
      setPreview(currentImage ?? null);
      setSelectedFile(null);
    } else {
      setStatus({ success: "Profile image updated" });
      // Replace the blob preview with the persisted Cloudinary URL
      if (previewBlobRef.current) {
        URL.revokeObjectURL(previewBlobRef.current);
        previewBlobRef.current = null;
      }
      setPreview(result.data?.imageUrl ?? preview);
      setSelectedFile(null);
      setTimeout(() => window.location.reload(), 1000); // Auto-reload after 1s
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={preview ?? "/public/AvatarFallback.png"}
              alt={name}
            />
            <AvatarFallback className="bg-primary text-white text-2xl">
              {name?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-white hover:bg-primary/90 transition-colors"
            aria-label="Change profile picture"
          >
            <Camera className="h-3 w-3" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 space-y-3">
          <p className="text-sm text-muted-foreground">
            JPG, PNG, GIF or WebP · Max {MAX_SIZE_MB}MB
          </p>
          {status.error && (
            <p className="text-sm text-destructive">{status.error}</p>
          )}
          {status.success && (
            <p className="text-sm text-green-600">{status.success}</p>
          )}
          {selectedFile && (
            <Button onClick={handleUpload} disabled={loading} size="sm">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Uploading..." : "Save Image"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
