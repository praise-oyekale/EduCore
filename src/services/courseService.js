import { collection, doc, getDocs, setDoc } from "firebase/firestore";

import { db } from "../firebase";

// ======================================================
// GET STUDENT COURSES
// ======================================================

export async function getStudentCourses(uid) {
  const coursesRef = collection(db, "student", uid, "courses");

  const snapshot = await getDocs(coursesRef);

  const courses = snapshot.docs.map((doc) => ({
    id: doc.id,

    ...doc.data(),
  }));

  return courses;
}

// ======================================================
// ENROLL STUDENT IN COURSE
// ======================================================

export async function enrollStudentInCourse(uid, course) {
  const courseRef = doc(db, "student", uid, "courses", String(course.id));

  await setDoc(courseRef, {
    name: course.name,

    teacher: course.teacher,

    schedule: course.schedule,

    credits: course.credits,

    progress: 0,

    grade: "",

    icon: course.icon,

    iconBg: course.iconBg,

    iconColor: course.iconColor,
  });
}
