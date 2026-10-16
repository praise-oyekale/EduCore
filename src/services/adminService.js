import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

/* ---------- Admin profile (same pattern as teacherService) ---------- */

// 1. Create an admin profile
export async function createAdminProfile(user, adminData = {}) {
  const adminRef = doc(db, "admin", user.uid);

  await setDoc(adminRef, {
    fullName: user.displayName || "",
    email: user.email,
    role: "admin",
    ...adminData,
  });
}

// 2. Get an admin profile
export async function getAdminProfile(uid) {
  const adminRef = doc(db, "admin", uid);
  const snapshot = await getDoc(adminRef);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
}

// 3. Update an admin profile
export async function updateAdminProfile(uid, adminData) {
  const adminRef = doc(db, "admin", uid);
  await updateDoc(adminRef, adminData);
  console.log("Admin profile updated successfully!");
}

/* ---------- Helpers ---------- */

const tally = (list) => ({
  total: list.length,
  m: list.filter((s) => s.gender === "M").length,
  f: list.filter((s) => s.gender === "F").length,
});

const mapDocs = (snapshot) =>
  snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

/* ---------- Dashboard: stat cards ---------- */

// students: { fullName, gender: "M"|"F", grade, status, absences }
// status: "enrolled" | "nls" | "transferredIn" | "transferredOut"
// attendance: { studentId, date: "YYYY-MM-DD", grade, gender, status }
// status: "present" | "absent" | "late"
export async function getDashboardStats(date) {
  const [studentsSnap, attendanceSnap] = await Promise.all([
    getDocs(collection(db, "students")),
    getDocs(query(collection(db, "attendance"), where("date", "==", date))),
  ]);

  const students = mapDocs(studentsSnap);
  const attendance = mapDocs(attendanceSnap);

  const enrolled = students.filter((s) => s.status === "enrolled");

  return {
    enrolled: tally(enrolled),
    present: tally(attendance.filter((a) => a.status === "present")),
    absent: tally(attendance.filter((a) => a.status === "absent")),
    late: tally(attendance.filter((a) => a.status === "late")),
    fivePlus: tally(enrolled.filter((s) => (s.absences || 0) >= 5)),
    nls: tally(students.filter((s) => s.status === "nls")),
    transferredIn: tally(students.filter((s) => s.status === "transferredIn")),
    transferredOut: tally(
      students.filter((s) => s.status === "transferredOut"),
    ),
  };
}

/* ---------- Dashboard: attendance line chart ---------- */

// Returns [{ date, label, present }] for the whole school year
export async function getAttendanceHistory(startDate, endDate) {
  const constraints = [orderBy("date")];
  if (startDate) constraints.unshift(where("date", ">=", startDate));
  if (endDate) constraints.unshift(where("date", "<=", endDate));

  const snap = await getDocs(
    query(collection(db, "attendance"), ...constraints),
  );

  const byDate = {};
  snap.docs.forEach((d) => {
    const { date, status } = d.data();
    if (status === "present") byDate[date] = (byDate[date] || 0) + 1;
  });

  return Object.entries(byDate).map(([date, present]) => ({
    date,
    label: new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    present,
  }));
}

/* ---------- Dashboard: attendance by grade ---------- */

export async function getAttendanceByGrade(date) {
  const snap = await getDocs(
    query(collection(db, "attendance"), where("date", "==", date)),
  );

  const grades = {};
  snap.docs.forEach((d) => {
    const { grade, status } = d.data();
    if (!grades[grade]) grades[grade] = { present: 0, total: 0 };
    grades[grade].total += 1;
    if (status === "present" || status === "late") grades[grade].present += 1;
  });

  return Object.entries(grades)
    .map(([grade, v]) => ({
      grade,
      percent: Math.round((v.present / v.total) * 100),
    }))
    .sort((a, b) => Number(a.grade) - Number(b.grade));
}

/* ---------- Dashboard: lists ---------- */

// admissions: { fullName, gradeApplied, submittedAt (string), createdAt (ms), status }
export async function getRecentAdmissions(count = 3) {
  const snap = await getDocs(
    query(
      collection(db, "admissions"),
      orderBy("createdAt", "desc"),
      limit(count),
    ),
  );
  return mapDocs(snap);
}

// events: { title, details, date: "YYYY-MM-DD", type: "meeting"|"drama"|"career" }
export async function getUpcomingEvents(count = 3) {
  const today = new Date().toISOString().slice(0, 10);
  const snap = await getDocs(
    query(
      collection(db, "events"),
      where("date", ">=", today),
      orderBy("date"),
      limit(count),
    ),
  );
  return mapDocs(snap);
}

// announcements: { title, type: "exam"|"fees"|"transport", createdAt (ms) }
export async function getRecentAnnouncements(count = 3) {
  const snap = await getDocs(
    query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc"),
      limit(count),
    ),
  );
  return mapDocs(snap);
}
