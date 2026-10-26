import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { PageLoader } from "../components/common/PageLoader";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Clean up previous document listener on auth state changes
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const uid = currentUser.uid;
        let detectedRole = null;

        // 1. Check admin collection by UID
        const adminSnap = await getDoc(doc(db, "admin", uid));
        if (adminSnap.exists()) {
          detectedRole = "admin";
        } else {
          // 2. Check teacher collection by UID
          const teacherSnap = await getDoc(doc(db, "teacher", uid));
          if (teacherSnap.exists()) {
            detectedRole = "teacher";
          } else {
            // 3. Check student collection by UID
            const studentSnap = await getDoc(doc(db, "student", uid));
            if (studentSnap.exists()) {
              detectedRole = "student";
            }
          }
        }

        if (!detectedRole) {
          console.warn("No user document found in admin, teacher, or student collections.");
          setProfile(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setRole(detectedRole);

        // 4. Subscribe to REAL-TIME document updates
        const userDocRef = doc(db, detectedRole, uid);
        unsubscribeDoc = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setProfile({ id: docSnap.id, ...docSnap.data() });
            } else {
              setProfile(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error listening to user profile changes:", error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error setting up auth profile:", error);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, role, loading }}>
      {loading ? <PageLoader /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}