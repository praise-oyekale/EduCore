import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

/* ---------- Your existing functions (with fixes) ---------- */

export async function CreateStudentProfile(user) {
  const studentRef = doc(db, "student", user.uid);

  await setDoc(studentRef, {
    fullName: user.displayName,
    email: user.email,
    role: "student",
    profileCompleted: false,
    status: "enrolled",
    createdAt: serverTimestamp(),
  });
} 

export async function getStudentProfile(uid) {
  const studentRef = doc(db, "student", uid);

  const snapshot = await getDoc(studentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateStudentProfile(uid, studentData) {
  const studentRef = doc(db, "student", uid);

  await updateDoc(studentRef, studentData);
}

/* ---------- New: used by the admin Students page ---------- */

export async function getStudents() {
  const snapshot = await getDocs(collection(db, "student"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getStudent(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, "student", id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// `id` is the uid returned by your signup service.
export async function createStudent(id, data) {
  if (!id) throw new Error("A student UID is required.");

  await setDoc(
    doc(db, "student", id),
    {
      ...data,
      role: "student",
      status: data.status || "enrolled",
      absences: Number(data.absences) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateStudent(id, data) {
  if (!id) throw new Error("Student ID is required.");
  if (!data || typeof data !== "object") {
    throw new Error("Student data must be an object.");
  }

  await updateDoc(doc(db, "student", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function generateStudentId() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `STU-${year}${random}`;
}
