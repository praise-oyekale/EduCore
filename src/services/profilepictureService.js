import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const ALLOWED_COLLECTIONS = ["student", "teacher", "admin"];

export async function uploadProfilePicture(file, uid, collectionName) {
  if (!file) {
    throw new Error("Please select an image.");
  }

  if (!uid) {
    throw new Error("You must be logged in to upload a profile picture.");
  }

  console.log("Collection received:", collectionName);

  if (!ALLOWED_COLLECTIONS.includes(collectionName)) {
    throw new Error("Invalid user profile collection.");
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Check your environment variables.",
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Please select a JPG, PNG, or WebP image.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image size must not exceed 15 MB.");
  }

  try {
    // Prepare the image for Cloudinary.
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", `profilePictures/${collectionName}`);

    // Give each upload a unique public ID.
    formData.append("public_id", `${uid}_${Date.now()}`);

    // Upload the image to Cloudinary.
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error?.message || "Unable to upload your profile picture.",
      );
    }

    const photoURL = result.secure_url;

    if (!photoURL) {
      throw new Error("Cloudinary did not return an image URL.");
    }

    // Save the image URL in the user's Firestore document.
    await setDoc(
      doc(db, collectionName, uid),
      {
        photoURL,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return photoURL;
  } catch (error) {
    console.error("Profile picture upload failed:", error);

    // Preserve the original error for debugging.
    throw new Error(error.message || "Failed to upload profile picture.", {
      cause: error,
    });
  }
}
