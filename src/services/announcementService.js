import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const ANNOUNCEMENTS_COLLECTION = "announcements";

const mapDocs = (snapshot) =>
  snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

// Publish a new school announcement.
export async function createAnnouncement({
  title,
  message,
  category = "Academic",
  pinned = false,
  authorId,
  authorName,
}) {
  if (!title?.trim()) {
    throw new Error("Please enter an announcement title.");
  }

  if (!message?.trim()) {
    throw new Error("Please enter an announcement message.");
  }

  if (!authorId) {
    throw new Error("You must be signed in to publish an announcement.");
  }

  const validCategories = ["Academic", "Events", "Finance"];

  if (!validCategories.includes(category)) {
    throw new Error("Please select a valid announcement category.");
  }

  const announcement = {
    title: title.trim(),
    message: message.trim(),
    category,
    pinned: Boolean(pinned),
    authorId,
    authorName: authorName?.trim() || "School Admin",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, ANNOUNCEMENTS_COLLECTION),
    announcement,
  );

  return {
    id: docRef.id,
    ...announcement,
  };
}

// Load announcements for the admin page and other school portals.
export async function getAnnouncements() {
  const announcementsQuery = query(
    collection(db, ANNOUNCEMENTS_COLLECTION),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(announcementsQuery);
  const announcements = mapDocs(snapshot);

  // Pinned announcements appear first.
  return announcements.sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) {
      return a.pinned ? -1 : 1;
    }

    return getTime(b.createdAt) - getTime(a.createdAt);
  });
}

function getTime(value) {
  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000;
  }

  return 0;
}

// Delete an announcement.
export async function deleteAnnouncement(announcementId) {
  if (!announcementId) {
    throw new Error("Announcement ID is required.");
  }

  await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, announcementId));
}
