import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

import { getTeacherProfile } from "../services/teacherService";
import { getStudentProfile } from "../services/studentService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      setProfile(null);
      setRole(null);
 
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // 1. Check whether the user is an admin
        const adminQuery = query(
          collection(db, "admin"),
          where("email", "==", currentUser.email),
        );

        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
          setRole("admin");
          setProfile({
            ...adminSnapshot.docs[0].data(),
            uid: currentUser.uid,
          });
          return;
        }

        // 2. Get the teacher profile using the user's UID
        const teacherProfile = await getTeacherProfile(currentUser.uid);

        if (teacherProfile) {
          setRole("teacher");
          setProfile(teacherProfile);
          return;
        }

        // 3. If not a teacher, check the student profile
        const studentProfile = await getStudentProfile(currentUser.uid);

        if (studentProfile) {
          setRole("student");
          setProfile(studentProfile);
          return;
        }

        console.warn("No profile found for this user.");
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
