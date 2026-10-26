import { useEffect, useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";

import Avatar from "./Avatar";
import { uploadProfilePicture } from "../../services/profilepictureService";

import "./avatar.css";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export default function AvatarUpload({
  collectionName = "teacher",
  uid,
  name = "",
  photoURL = "",
  size = 92,
  onUploaded,
}) {
  const inputRef = useRef(null);

  const [currentUrl, setCurrentUrl] = useState(photoURL);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrentUrl(photoURL || "");
  }, [photoURL]);

  async function handleChange(event) {
    const file = event.target.files?.[0];

    // Allow the same file to be selected again.
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Please choose an image no larger than 15 MB.");
      return;
    }

    if (!uid) {
      setError("Your user session is missing. Please sign in again.");
      return;
    }

    if (!["student", "teacher", "admin"].includes(collectionName)) {
      setError("Invalid user profile collection.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Correct argument order: file, uid, collectionName
      const url = await uploadProfilePicture(file, uid, collectionName);

      setCurrentUrl(url);

      // Notify the profile page and Auth context.
      if (typeof onUploaded === "function") {
        await onUploaded(url);
      }
    } catch (err) {
      console.error("Profile picture upload failed:", err);

      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="avatar-upload">
      <div
        className="avatar-upload-frame"
        style={{ width: size, height: size }}
      >
        <Avatar photoURL={currentUrl} name={name} size={size} />

        <button
          type="button"
          className="avatar-upload-button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile picture"
          title="Change profile picture"
        >
          {uploading ? "…" : <FaCamera />}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          hidden
        />
      </div>

      {uploading && <p role="status">Uploading picture...</p>}

      {error && (
        <p className="avatar-upload-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
