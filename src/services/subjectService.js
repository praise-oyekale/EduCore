import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

// Subjects an admin has created (collection: "subjects"), used by the enroll list
export async function getAllSubjects() {
  const snapshot = await getDocs(collection(db, "subjects"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Adds a subject to the student's own "subjects" array,
// the same array the admin Students page edits.
export async function addStudentSubject(uid, subjectName) {
  if (!uid) throw new Error("A student UID is required.");
  if (!subjectName) throw new Error("A subject name is required.");

  await updateDoc(doc(db, "student", uid), {
    subjects: arrayUnion({ name: subjectName, score: 0 }),
  });
}