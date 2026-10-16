import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { data } from "react-router-dom";

export async function CreateStudentProfile(user) {
  const studentRef = doc(db, "student", user.uid);
 
  await setDoc(studentRef, {
    fullName: user.displayName,
    email: user.email,
    role: "student",
    profileCompleted: false,
  });
}

export async function getStudentProfile(uid) {
  const studentRef = doc(db, "student", uid);

  const snapshot = await getDoc(studentRef);

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateStudentProfile(uid, studentData) {
  console.log("UID:", uid);
  console.log("Data being updated:", data);

  const studentRef = doc(db, "student", uid);

  await updateDoc(studentRef, studentData);

  console.log("Firestore update successful!");
}
