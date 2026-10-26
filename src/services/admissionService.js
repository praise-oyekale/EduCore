import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Submits an online application for student or teacher portal access.
 * Saves directly to the "admissions" collection for Admin review.
 */
export async function submitApplication(data) {
  if (!data.email || !data.fullName || !data.password) {
    throw new Error("Missing required fields.");
  }

  const admissionsRef = collection(db, "admissions");

  await addDoc(admissionsRef, {
    applicantType: data.applicantType || "student", // "student" or "teacher"
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    intendingPassword: data.password, // Admin uses this to create the account upon physical verification
    phoneNumber: data.phoneNumber?.trim() || "",
    grade: data.grade || "", // Class applied for (e.g. JSS1, SSS2)
    department: data.department?.trim() || "",
    guardianName: data.guardianName?.trim() || "",
    guardianPhone: data.guardianPhone?.trim() || "",
    subjectsTaught: data.subjectsTaught || [], // Array for teachers
    status: "pending", // "pending", "approved", "rejected"
    createdAt: serverTimestamp(),
  });

  return { success: true };
}