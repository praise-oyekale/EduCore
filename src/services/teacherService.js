import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { db } from "../firebase";

// 1. Create a teacher profile
export async function createTeacherProfile(user, teacherData = {}) {
  const teacherRef = doc(db, "teacher", user.uid);

  await setDoc(teacherRef, {
    fullName: user.displayName || "",
    email: user.email,
    role: "teacher",
    subject: "",
    assignedClasses: [],
    ...teacherData,
  });
}

// 2. Get a teacher profile
export async function getTeacherProfile(uid) {
  const teacherRef = doc(db, "teacher", uid);

  const snapshot = await getDoc(teacherRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// 3. Update a teacher profile
export async function updateTeacherProfile(uid, teacherData) {
  const teacherRef = doc(db, "teacher", uid);

  await updateDoc(teacherRef, teacherData);

  console.log("Teacher profile updated successfully!");
}
