import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { calculateStudentGPA } from "./teacherService";

/* ---------- Constants ---------- */

// Students are stored in the "student" collection (singular)
const STUDENT_COLLECTION = "student";

const CLASS_ORDER = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];

/* ---------- Admin Profile ---------- */

export async function createAdminProfile(user, adminData = {}) {
  if (!user?.uid) {
    throw new Error(
      "A signed-in Firebase user is required to create an admin profile.",
    );
  }

  const adminRef = doc(db, "admin", user.uid);
  await setDoc(
    adminRef,
    {
      fullName: user.displayName || "",
      email: user.email || "",
      role: "admin",
      ...adminData,
    },
    { merge: true },
  );
}

export async function getAdminProfile(uid) {
  if (!uid) return null;

  const snapshot = await getDoc(doc(db, "admin", uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function updateAdminProfile(uid, adminData) {
  if (!uid) throw new Error("Admin UID is required.");
  if (!adminData || typeof adminData !== "object") {
    throw new Error("Admin profile data must be an object.");
  }

  await updateDoc(doc(db, "admin", uid), adminData);
}

/* ---------- Helpers ---------- */

const mapDocs = (snapshot) =>
  snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

const normalizeGender = (gender) => {
  const value = String(gender || "")
    .trim()
    .toLowerCase();
  if (["m", "male", "boy"].includes(value)) return "M";
  if (["f", "female", "girl"].includes(value)) return "F";
  return null;
};

const tally = (list) => ({
  total: list.length,
  m: list.filter((item) => normalizeGender(item.gender) === "M").length,
  f: list.filter((item) => normalizeGender(item.gender) === "F").length,
});

const normalizeClass = (value) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toUpperCase();

const isDateString = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const getLocalDateISO = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const toMillis = (value) => {
  if (typeof value === "number") return value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

/* ---------- Admin Student Grade & Score Management ---------- */

/**
 * Admin updates a student's entire subjects array.
 * Calculates GPA instantly and updates the student document in Firestore.
 */
export async function updateStudentSubjectsByAdmin(
  studentId,
  newSubjects = [],
) {
  if (!studentId) throw new Error("Student ID is required.");

  const computedGpa = calculateStudentGPA(newSubjects);

  const studentRef = doc(db, STUDENT_COLLECTION, studentId);
  await updateDoc(studentRef, {
    subjects: newSubjects,
    gpa: computedGpa,
    updatedAt: serverTimestamp(),
  });

  return { success: true, gpa: computedGpa };
}

/**
 * Admin updates or adds a single subject score for a student.
 * Calculates GPA instantly and updates the student document in Firestore.
 */
export async function updateStudentScoreByAdmin(studentId, subjectName, score) {
  if (!studentId) throw new Error("Student ID is required.");
  if (!subjectName) throw new Error("Subject name is required.");

  const numericScore = Number(score);
  if (
    !Number.isFinite(numericScore) ||
    numericScore < 0 ||
    numericScore > 100
  ) {
    throw new Error("Score must be a number between 0 and 100.");
  }

  const studentRef = doc(db, STUDENT_COLLECTION, studentId);
  const snap = await getDoc(studentRef);

  if (!snap.exists()) throw new Error("Student record not found.");

  const currentSubjects = Array.isArray(snap.data().subjects)
    ? snap.data().subjects
    : [];

  const exists = currentSubjects.some(
    (s) => String(s.name).toLowerCase() === subjectName.toLowerCase(),
  );

  const updatedSubjects = exists
    ? currentSubjects.map((s) =>
        String(s.name).toLowerCase() === subjectName.toLowerCase()
          ? { ...s, score: numericScore }
          : s,
      )
    : [...currentSubjects, { name: subjectName, score: numericScore }];

  const computedGpa = calculateStudentGPA(updatedSubjects);

  await updateDoc(studentRef, {
    subjects: updatedSubjects,
    gpa: computedGpa,
    updatedAt: serverTimestamp(),
  });

  return { success: true, gpa: computedGpa };
}

/* ---------- Dashboard Statistics ---------- */

export async function getDashboardStats(date = getLocalDateISO()) {
  const [studentsSnapshot, attendanceSnapshot] = await Promise.all([
    getDocs(collection(db, STUDENT_COLLECTION)),
    getDocs(query(collection(db, "attendance"), where("date", "==", date))),
  ]);

  const students = mapDocs(studentsSnapshot);
  const attendance = mapDocs(attendanceSnapshot);

  const statusOf = (student) =>
    String(student.status || "enrolled").toLowerCase();

  const enrolled = students.filter(
    (student) => statusOf(student) === "enrolled",
  );

  const studentById = new Map(students.map((student) => [student.id, student]));

  const attendanceWithGender = attendance.map((record) => {
    if (normalizeGender(record.gender)) return record;
    const linkedStudent = studentById.get(record.studentId);
    return { ...record, gender: linkedStudent?.gender };
  });

  const statusTally = (status) =>
    tally(
      attendanceWithGender.filter(
        (record) => String(record.status || "").toLowerCase() === status,
      ),
    );

  return {
    enrolled: tally(enrolled),
    present: statusTally("present"),
    absent: statusTally("absent"),
    late: statusTally("late"),
    fivePlus: tally(
      enrolled.filter((student) => Number(student.absences || 0) >= 5),
    ),
    nls: tally(students.filter((student) => statusOf(student) === "nls")),
    transferredIn: tally(
      students.filter((student) => statusOf(student) === "transferredin"),
    ),
    transferredOut: tally(
      students.filter((student) => statusOf(student) === "transferredout"),
    ),
  };
}

/* ---------- Attendance History Chart ---------- */

export async function getAttendanceHistory(startDate, endDate) {
  const constraints = [];

  if (isDateString(startDate)) constraints.push(where("date", ">=", startDate));
  if (isDateString(endDate)) constraints.push(where("date", "<=", endDate));
  constraints.push(orderBy("date", "asc"));

  const snapshot = await getDocs(
    query(collection(db, "attendance"), ...constraints),
  );

  const byDate = new Map();

  snapshot.docs.forEach((document) => {
    const record = document.data();
    if (!isDateString(record.date)) return;

    if (!byDate.has(record.date)) {
      byDate.set(record.date, { present: 0, late: 0, absent: 0 });
    }

    const day = byDate.get(record.date);
    const status = String(record.status || "").toLowerCase();

    if (status === "present") day.present += 1;
    if (status === "late") day.late += 1;
    if (status === "absent") day.absent += 1;
  });

  return [...byDate.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, values]) => ({
      date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      present: values.present,
      late: values.late,
      absent: values.absent,
    }));
}

/* ---------- Attendance By Class ---------- */

export async function getAttendanceByGrade(date = getLocalDateISO()) {
  const [attendanceSnapshot, studentsSnapshot] = await Promise.all([
    getDocs(query(collection(db, "attendance"), where("date", "==", date))),
    getDocs(collection(db, STUDENT_COLLECTION)),
  ]);

  const students = mapDocs(studentsSnapshot);
  const studentById = new Map(students.map((student) => [student.id, student]));

  const classes = new Map(
    CLASS_ORDER.map((name) => [name, { attended: 0, total: 0 }]),
  );

  attendanceSnapshot.docs.forEach((document) => {
    const record = document.data();
    const linkedStudent = studentById.get(record.studentId);
    const key =
      normalizeClass(record.grade ?? linkedStudent?.grade) || "Unassigned";

    if (!classes.has(key)) classes.set(key, { attended: 0, total: 0 });
    const entry = classes.get(key);
    entry.total += 1;

    const status = String(record.status || "").toLowerCase();
    if (status === "present" || status === "late") entry.attended += 1;
  });

  return [...classes.entries()]
    .map(([grade, value]) => ({
      grade,
      total: value.total,
      present: value.attended,
      percent: value.total
        ? Math.round((value.attended / value.total) * 100)
        : 0,
    }))
    .sort((a, b) => {
      const aIndex = CLASS_ORDER.indexOf(a.grade);
      const bIndex = CLASS_ORDER.indexOf(b.grade);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.grade.localeCompare(b.grade);
    });
}

/* ---------- Recent Admissions ---------- */

export async function getRecentAdmissions(count = 4) {
  const safeLimit = Math.max(1, Number(count) || 4);

  try {
    const snapshot = await getDocs(
      query(
        collection(db, "admissions"),
        orderBy("createdAt", "desc"),
        limit(safeLimit),
      ),
    );
    return mapDocs(snapshot);
  } catch (error) {
    console.warn("Could not sort admissions by createdAt:", error);
    const snapshot = await getDocs(collection(db, "admissions"));
    return mapDocs(snapshot)
      .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
      .slice(0, safeLimit);
  }
}

/* ---------- Upcoming Events ---------- */

export async function getUpcomingEvents(count = 4) {
  const today = getLocalDateISO();
  const safeLimit = Math.max(1, Number(count) || 4);

  try {
    const snapshot = await getDocs(
      query(
        collection(db, "events"),
        where("date", ">=", today),
        orderBy("date", "asc"),
        limit(safeLimit),
      ),
    );
    return mapDocs(snapshot);
  } catch (error) {
    console.warn("Could not query upcoming events by date:", error);
    const snapshot = await getDocs(collection(db, "events"));
    return mapDocs(snapshot)
      .filter((event) => isDateString(event.date) && event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, safeLimit);
  }
}

/* ---------- Recent Announcements ---------- */

export async function getRecentAnnouncements(count = 4) {
  const safeLimit = Math.max(1, Number(count) || 4);

  try {
    const snapshot = await getDocs(
      query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc"),
        limit(safeLimit),
      ),
    );
    return mapDocs(snapshot);
  } catch (error) {
    console.warn("Could not sort announcements by createdAt:", error);
    const snapshot = await getDocs(collection(db, "announcements"));
    return mapDocs(snapshot)
      .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
      .slice(0, safeLimit);
  }
}
