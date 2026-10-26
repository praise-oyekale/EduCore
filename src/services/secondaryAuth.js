import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { secondaryAuth } from "../firebase";

export async function createStudentAccount({ email, password, fullName }) {
  const credential = await createUserWithEmailAndPassword(
    secondaryAuth,
    email,
    password,
  );

  await updateProfile(credential.user, { displayName: fullName });

  const uid = credential.user.uid;

  // Sign out of the hidden app only. Your admin session is unaffected.
  await signOut(secondaryAuth);

  return { uid, email, displayName: fullName };
}
