import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase";

const TEACHER_COLLECTION = "teacher";
const STUDENT_COLLECTION = "student";
const ATTENDANCE_COLLECTION = "attendance";

/* ---------- Helpers ---------- */

const normalizeClass = (value) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toUpperCase();

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const getLocalDateISO = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

/**
 * Calculates weighted GPA from a student's subjects array.
 * Only subjects with scores > 0 are calculated to prevent unscored courses from defaulting to 0.0 GPA.
 * Core subjects (Math, English, Physics, Chem) count as 4 credits, others count as 3.
 */
export function calculateStudentGPA(subjects = []) {
  if (!Array.isArray(subjects) || subjects.length === 0) return "0.00";

  // Filter only subjects that have actual scores assigned (> 0)
  const scoredSubjects = subjects.filter((sub) => Number(sub?.score) > 0);
  if (scoredSubjects.length === 0) return "0.00";

  let totalPointsTimesCredits = 0;
  let totalCredits = 0;

  scoredSubjects.forEach((sub) => {
    const score = Number(sub.score) || 0;
    const lowerName = String(sub.name || "").toLowerCase();

    const credits =
      lowerName.includes("math") ||
      lowerName.includes("english") ||
      lowerName.includes("physics") ||
      lowerName.includes("chem")
        ? 4
        : 3;

    let points = 0.0;
    if (score >= 70) points = 4.0;
    else if (score >= 60) points = 3.0;
    else if (score >= 50) points = 2.5;
    else if (score >= 45) points = 2.0;
    else if (score >= 40) points = 1.5;

    totalPointsTimesCredits += points * credits;
    totalCredits += credits;
  });

  return totalCredits > 0
    ? (totalPointsTimesCredits / totalCredits).toFixed(2)
    : "0.00";
}

/* ---------- Teacher's own profile ---------- */

export async function createTeacherProfile(user, teacherData = {}) {
  const teacherRef = doc(db, TEACHER_COLLECTION, user.uid);

  await setDoc(
    teacherRef,
    {
      fullName: user.displayName || "",
      email: user.email,
      role: "teacher",
      staffType: "Teaching",
      status: "active",
      subject: "",
      subjectsTaught: [],
      assignedClasses: [],
      createdAt: serverTimestamp(),
      ...teacherData,
    },
    { merge: true },
  );
}

export async function getTeacherProfile(uid) {
  if (!uid) return null;

  const snapshot = await getDoc(doc(db, TEACHER_COLLECTION, uid));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateTeacherProfile(uid, teacherData) {
  if (!uid) throw new Error("Teacher UID is required.");

  await updateDoc(doc(db, TEACHER_COLLECTION, uid), {
    ...teacherData,
    updatedAt: serverTimestamp(),
  });
}

/* ---------- Admin: manage all staff ---------- */

export async function getStaffList() {
  const snapshot = await getDocs(collection(db, TEACHER_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createStaff(id, data) {
  if (!id) throw new Error("A staff UID is required.");

  await setDoc(
    doc(db, TEACHER_COLLECTION, id),
    {
      ...data,
      role: "teacher",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateStaff(id, data) {
  if (!id) throw new Error("Staff ID is required.");
  if (!data || typeof data !== "object") {
    throw new Error("Staff data must be an object.");
  }

  await updateDoc(doc(db, TEACHER_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function generateStaffId() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `STF-${year}${random}`;
}

export async function getStaffStats() {
  const staff = await getStaffList();
  const status = (s) => String(s.status || "active").toLowerCase();

  return {
    total: staff.length,
    active: staff.filter((s) => status(s) === "active").length,
    teaching: staff.filter((s) => (s.staffType || "Teaching") === "Teaching")
      .length,
    nonTeaching: staff.filter((s) => s.staffType === "Non-teaching").length,
    onLeave: staff.filter((s) => status(s) === "onleave").length,
  };
}

/* ---------- Teacher <-> students ---------- */

export async function getAssignedStudents(
  teacher,
  { onlyTheirSubjects = false } = {},
) {
  const classes = toList(teacher?.assignedClasses).map(normalizeClass);

  if (classes.length === 0) return [];

  const snapshot = await getDocs(
    query(collection(db, STUDENT_COLLECTION), where("grade", "in", classes)),
  );

  let students = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (onlyTheirSubjects) {
    const mine = toList(teacher?.subjectsTaught).map((s) => s.toLowerCase());

    students = students.filter((student) =>
      (Array.isArray(student.subjects) ? student.subjects : []).some(
        (subject) => mine.includes(String(subject.name || "").toLowerCase()),
      ),
    );
  }

  return students.sort((a, b) =>
    (a.fullName || "").localeCompare(b.fullName || ""),
  );
}

/**
 * Teacher records a score for one subject on a student's profile.
 * Automatically recalculates and updates overall GPA in Firestore.
 */
export async function updateStudentSubjectScore(studentId, subjectName, score) {
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
  const snapshot = await getDoc(studentRef);

  if (!snapshot.exists()) throw new Error("Student not found.");

  const subjects = Array.isArray(snapshot.data().subjects)
    ? snapshot.data().subjects
    : [];

  const exists = subjects.some(
    (s) => String(s.name).toLowerCase() === subjectName.toLowerCase(),
  );

  const updatedSubjects = exists
    ? subjects.map((s) =>
        String(s.name).toLowerCase() === subjectName.toLowerCase()
          ? { ...s, score: numericScore }
          : s,
      )
    : [...subjects, { name: subjectName, score: numericScore }];

  const computedGpa = calculateStudentGPA(updatedSubjects);

  await updateDoc(studentRef, {
    subjects: updatedSubjects,
    gpa: computedGpa,
    updatedAt: serverTimestamp(),
  });
}

/* ---------- Attendance Management ---------- */

export async function getClassAttendanceForDate(className, dateString) {
  const normalized = normalizeClass(className);
  if (!normalized || !dateString) return {};

  try {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where("grade", "==", normalized),
      where("date", "==", dateString),
    );
    const snapshot = await getDocs(q);
    const attendanceMap = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      attendanceMap[data.studentId] = data.status;
    });
    return attendanceMap;
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    return {};
  }
}

export async function saveClassAttendance(className, dateString, records) {
  const normalized = normalizeClass(className);
  if (!normalized || !dateString || !Array.isArray(records)) {
    return { success: false };
  }

  try {
    const batch = writeBatch(db);

    records.forEach(({ studentId, status, gender }) => {
      const docId = `${studentId}_${dateString}`;
      const docRef = doc(db, ATTENDANCE_COLLECTION, docId);

      batch.set(
        docRef,
        {
          studentId,
          date: dateString,
          status: String(status || "present").toLowerCase(),
          grade: normalized,
          gender: String(gender || "male").toLowerCase(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error saving attendance batch:", error);
    throw error;
  }
}

export async function getClassAverageAttendance(className) {
  const normalized = normalizeClass(className);
  if (!normalized) return 100;

  try {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where("grade", "==", normalized),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return 100;

    let presentOrLate = 0;
    const total = snapshot.size;

    snapshot.forEach((docSnap) => {
      const status = String(docSnap.data().status || "").toLowerCase();
      if (status === "present" || status === "late") {
        presentOrLate++;
      }
    });

    return Math.round((presentOrLate / total) * 100);
  } catch (error) {
    console.error("Error calculating average attendance:", error);
    return 100;
  }
}

/* ---------- Student/admin <-> teachers ---------- */

export async function getTeachersForClass(className) {
  const normalized = normalizeClass(className);
  if (!normalized) return [];

  const snapshot = await getDocs(
    query(
      collection(db, TEACHER_COLLECTION),
      where("assignedClasses", "array-contains", normalized),
    ),
  );

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTeacherDashboardData(
  teacher,
  date = getLocalDateISO(),
) {
  const students = await getAssignedStudents(teacher);
  const studentIds = new Set(students.map((s) => s.id));

  const mine = toList(teacher?.subjectsTaught).map((s) => s.toLowerCase());
  const isMine = (name) =>
    mine.length === 0 || mine.includes(String(name || "").toLowerCase());

  const pending = [];
  const totals = new Map();

  students.forEach((student) => {
    const subjects = Array.isArray(student.subjects) ? student.subjects : [];

    subjects.forEach((subject) => {
      if (!isMine(subject.name)) return;

      const score = Number(subject.score) || 0;

      if (score > 0) {
        const entry = totals.get(subject.name) || { sum: 0, count: 0 };
        entry.sum += score;
        entry.count += 1;
        totals.set(subject.name, entry);
      } else {
        pending.push({
          id: `${student.id}-${subject.name}`,
          student: student.fullName || "Unnamed student",
          subject: subject.name,
          className: normalizeClass(student.grade),
        });
      }
    });
  });

  const performance = [...totals.entries()]
    .map(([subject, value]) => ({
      subject,
      score: Math.round(value.sum / value.count),
      graded: value.count,
    }))
    .sort((a, b) => b.score - a.score);

  const allScores = [...totals.values()];
  const scoreCount = allScores.reduce((sum, v) => sum + v.count, 0);
  const overallAverage = scoreCount
    ? Math.round(allScores.reduce((sum, v) => sum + v.sum, 0) / scoreCount)
    : null;

  const classes = toList(teacher?.assignedClasses)
    .map(normalizeClass)
    .map((name) => ({
      name,
      students: students.filter((s) => normalizeClass(s.grade) === name).length,
      isClassTeacher: normalizeClass(teacher?.classTeacherOf) === name,
    }));

  const attendanceSnapshot = await getDocs(
    query(collection(db, ATTENDANCE_COLLECTION), where("date", "==", date)),
  );

  const records = attendanceSnapshot.docs
    .map((d) => d.data())
    .filter((record) => studentIds.has(record.studentId));

  const attended = records.filter((record) =>
    ["present", "late"].includes(String(record.status || "").toLowerCase()),
  ).length;

  return {
    studentCount: students.length,
    classes,
    pendingCount: pending.length,
    pending: pending.slice(0, 5),
    performance,
    overallAverage,
    attendanceRate: records.length
      ? Math.round((attended / records.length) * 100)
      : null,
    attendanceRecorded: records.length,
  };
}

export async function getTeacherClassesData(teacher) {
  const students = await getAssignedStudents(teacher);
  const classNames = toList(teacher?.assignedClasses).map(normalizeClass);

  const mine = toList(teacher?.subjectsTaught).map((s) => s.toLowerCase());
  const isMine = (name) =>
    mine.length === 0 || mine.includes(String(name || "").toLowerCase());

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sinceISO = new Date(since.getTime() - since.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const attendanceSnapshot = await getDocs(
    query(collection(db, ATTENDANCE_COLLECTION), where("date", ">=", sinceISO)),
  );
  const attendance = attendanceSnapshot.docs.map((d) => d.data());

  return classNames.map((name) => {
    const classStudents = students.filter(
      (s) => normalizeClass(s.grade) === name,
    );
    const ids = new Set(classStudents.map((s) => s.id));

    const scores = [];
    classStudents.forEach((student) => {
      (Array.isArray(student.subjects) ? student.subjects : []).forEach(
        (subject) => {
          const score = Number(subject.score) || 0;
          if (isMine(subject.name) && score > 0) scores.push(score);
        },
      );
    });

    const records = attendance.filter((r) => ids.has(r.studentId));
    const attended = records.filter((r) =>
      ["present", "late"].includes(String(r.status || "").toLowerCase()),
    ).length;

    return {
      id: name,
      name,
      isClassTeacher: normalizeClass(teacher?.classTeacherOf) === name,
      students: classStudents,
      studentCount: classStudents.length,
      attendance: records.length
        ? Math.round((attended / records.length) * 100)
        : null,
      averageScore: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null,
    };
  });
}

export async function getTeacherStudentsData(teacher) {
  const students = await getAssignedStudents(teacher);

  const mine = toList(teacher?.subjectsTaught).map((s) => s.toLowerCase());
  const isMine = (name) =>
    mine.length === 0 || mine.includes(String(name || "").toLowerCase());

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sinceISO = new Date(since.getTime() - since.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const attendanceSnapshot = await getDocs(
    query(collection(db, ATTENDANCE_COLLECTION), where("date", ">=", sinceISO)),
  );

  const byStudent = new Map();
  attendanceSnapshot.docs.forEach((d) => {
    const record = d.data();
    if (!byStudent.has(record.studentId)) byStudent.set(record.studentId, []);
    byStudent.get(record.studentId).push(record);
  });

  return students.map((student) => {
    const mySubjects = (Array.isArray(student.subjects) ? student.subjects : [])
      .filter((subject) => isMine(subject.name))
      .map((subject) => ({
        name: subject.name,
        score: Number(subject.score) || 0,
      }));

    const scored = mySubjects.filter((subject) => subject.score > 0);
    const average = scored.length
      ? Math.round(scored.reduce((sum, s) => sum + s.score, 0) / scored.length)
      : null;

    const records = byStudent.get(student.id) || [];
    const attended = records.filter((r) =>
      ["present", "late"].includes(String(r.status || "").toLowerCase()),
    ).length;

    return {
      ...student,
      className: normalizeClass(student.grade),
      mySubjects,
      average,
      attendance: records.length
        ? Math.round((attended / records.length) * 100)
        : null,
    };
  });
}
