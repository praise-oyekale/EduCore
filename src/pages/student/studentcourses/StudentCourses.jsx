import { useEffect, useState } from "react";

import {
  FaPlus,
  FaSort,
  FaFlask,
  FaCalculator,
  FaLandmark,
  FaLanguage,
  FaDna,
  FaPalette,
  FaTimes,
} from "react-icons/fa";

import "../studentcourses/studentcourses.css";



import { auth } from "../../../firebase";
import { enrollStudentInCourse, getStudentCourses } from "../../../services/courseService";

// ======================================================
// AVAILABLE COURSES
// These are the courses students can choose to enroll in.
// ======================================================

const availableCourses = [
  {
    id: 1,
    name: "Chemistry 201",
    teacher: "Dr. Faulkner",
    schedule: "MWF 9:00 AM",
    grade: "A-",
    progress: 82,
    credits: 4,
    icon: "flask",
    iconBg: "#eef4ff",
    iconColor: "#2563eb",
  },

  {
    id: 2,
    name: "Calculus AB",
    teacher: "Mr. Owusu",
    schedule: "TTh 11:00 AM",
    grade: "B+",
    progress: 74,
    credits: 4,
    icon: "calculator",
    iconBg: "#f3edff",
    iconColor: "#7c3aed",
  },

  {
    id: 3,
    name: "World History",
    teacher: "Ms. Delacroix",
    schedule: "MWF 1:00 PM",
    grade: "A",
    progress: 91,
    credits: 3,
    icon: "history",
    iconBg: "#fff5e6",
    iconColor: "#c45b00",
  },

  {
    id: 4,
    name: "English Literature",
    teacher: "Mrs. Whitfield",
    schedule: "TTh 9:30 AM",
    grade: "A-",
    progress: 88,
    credits: 3,
    icon: "language",
    iconBg: "#edf9f1",
    iconColor: "#16803c",
  },

  {
    id: 5,
    name: "Biology II",
    teacher: "Dr. Sanborn",
    schedule: "MWF 11:00 AM",
    grade: "B",
    progress: 69,
    credits: 4,
    icon: "biology",
    iconBg: "#ecfbfa",
    iconColor: "#07988f",
  },

  {
    id: 6,
    name: "Studio Art",
    teacher: "Mr. Callahan",
    schedule: "TTh 2:00 PM",
    grade: "A",
    progress: 95,
    credits: 2,
    icon: "art",
    iconBg: "#fff0f0",
    iconColor: "#dc2626",
  },
];

// ======================================================
// ICON FUNCTION
// Firestore stores "flask", "calculator", etc.
// React turns that value into the actual icon.
// ======================================================

function getCourseIcon(icon) {
  switch (icon) {
    case "flask":
      return <FaFlask />;

    case "calculator":
      return <FaCalculator />;

    case "history":
      return <FaLandmark />;

    case "language":
      return <FaLanguage />;

    case "biology":
      return <FaDna />;

    case "art":
      return <FaPalette />;

    default:
      return <FaFlask />;
  }
}

// ======================================================
// COMPONENT
// ======================================================

export default function StudentCourses() {
  // Which tab is currently selected?
  const [activeTab, setActiveTab] = useState("all");

  // How should the courses be sorted?
  const [sortBy, setSortBy] = useState("default");

  // Should the sort dropdown be visible?
  const [showSort, setShowSort] = useState(false);

  // Should the enrollment modal be visible?
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Courses actually enrolled by this student
  const [courses, setCourses] = useState([]);

  // Loading courses from Firestore
  const [loading, setLoading] = useState(true);

  // Loading while enrolling
  const [enrolling, setEnrolling] = useState(false);

  // Error message
  const [error, setError] = useState("");

  // ====================================================
  // LOAD STUDENT COURSES FROM FIRESTORE
  // ====================================================

  useEffect(() => {
    async function loadCourses() {
      try {
        const user = auth.currentUser;

        // No logged-in user
        if (!user) {
          setError("You must be logged in to view your courses.");
          return;
        }

        // Get this student's courses
        const studentCourses = await getStudentCourses(user.uid);

        setCourses(studentCourses);
      } catch (error) {
        console.error("Error loading courses:", error);

        setError("Unable to load your courses.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  // ====================================================
  // ENROLL IN COURSE
  // ====================================================

  const handleEnroll = async (course) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in to enroll in a course.");
        return;
      }

      // Prevent duplicate enrollment
      const alreadyEnrolled = courses.some(
        (enrolledCourse) => String(enrolledCourse.id) === String(course.id),
      );

      if (alreadyEnrolled) {
        setError("You are already enrolled in this course.");
        return;
      }

      setEnrolling(true);
      setError("");

      // Save course to Firestore
      await enrollStudentInCourse(user.uid, course);

      // Add the new course immediately to the UI
      const newCourse = {
        ...course,

        // A newly enrolled course starts from zero
        progress: 0,

        // Grade hasn't been given yet
        grade: "",
      };

      setCourses((previousCourses) => [...previousCourses, newCourse]);

      // Close modal
      setShowEnrollModal(false);

      alert(`${course.name} enrolled successfully!`);
    } catch (error) {
      console.error("Enrollment error:", error);

      setError("Unable to enroll in this course.");
    } finally {
      setEnrolling(false);
    }
  };

  // ====================================================
  // FILTER COURSES
  // ====================================================

  const filteredCourses = courses.filter((course) => {
    // Show everything
    if (activeTab === "all") {
      return true;
    }

    // Show courses that haven't reached 100%
    if (activeTab === "inProgress") {
      return course.progress > 0 && course.progress < 100;
    }

    // Show only courses at 100%
    if (activeTab === "completed") {
      return course.progress === 100;
    }

    return true;
  });

  // ====================================================
  // SORT COURSES
  // ====================================================

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    // Alphabetical order
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }

    // Highest progress first
    if (sortBy === "progressHigh") {
      return b.progress - a.progress;
    }

    // Lowest progress first
    if (sortBy === "progressLow") {
      return a.progress - b.progress;
    }

    // Highest credits first
    if (sortBy === "credits") {
      return b.credits - a.credits;
    }

    // Default order
    return 0;
  });

  // ====================================================
  // COURSE COUNTS
  // ====================================================

  const allCount = courses.length;

  const inProgressCount = courses.filter(
    (course) => course.progress > 0 && course.progress < 100,
  ).length;

  const completedCount = courses.filter(
    (course) => course.progress === 100,
  ).length;

  // ====================================================
  // LOADING SCREEN
  // ====================================================

  if (loading) {
    return (
      <div className="studentcourses-container">
        <div className="courses-loading">Loading your courses...</div>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="studentcourses-container">
      {/* ================================================
          HEADER
      ================================================= */}

      <section className="coursegreeting-section">
        <div className="course-welcome-message">
          <h1>Courses</h1>

          <p>{allCount} courses enrolled this semester · Fall 2026.</p>
        </div>

        {/* ============================================
            TOP RIGHT ACTIONS
        ============================================= */}

        <div className="courseaction-button">
          {/* SORT */}

          <div className="sort-wrapper">
            <button
              className="course-sort-btn"
              onClick={() => setShowSort(!showSort)}
            >
              <FaSort />
              Sort
            </button>

            {/* SORT DROPDOWN */}

            {showSort && (
              <div className="sort-menu">
                <button
                  onClick={() => {
                    setSortBy("default");
                    setShowSort(false);
                  }}
                >
                  Default
                </button>

                <button
                  onClick={() => {
                    setSortBy("name");
                    setShowSort(false);
                  }}
                >
                  Course name
                </button>

                <button
                  onClick={() => {
                    setSortBy("progressHigh");
                    setShowSort(false);
                  }}
                >
                  Progress: High → Low
                </button>

                <button
                  onClick={() => {
                    setSortBy("progressLow");
                    setShowSort(false);
                  }}
                >
                  Progress: Low → High
                </button>

                <button
                  onClick={() => {
                    setSortBy("credits");
                    setShowSort(false);
                  }}
                >
                  Credits
                </button>
              </div>
            )}
          </div>

          {/* ENROLL */}

          <button
            className="course-enroll-btn"
            onClick={() => {
              setShowEnrollModal(true);
              setError("");
            }}
          >
            <FaPlus />
            Enroll in course
          </button>
        </div>
      </section>

      {/* ================================================
          ERROR MESSAGE
      ================================================= */}

      {error && <div className="course-error">{error}</div>}

      {/* ================================================
          FILTER TABS
      ================================================= */}

      <div className="courses-toolbar">
        <div className="course-tabs">
          {/* ALL */}

          <button
            className={activeTab === "all" ? "tab active" : "tab"}
            onClick={() => setActiveTab("all")}
          >
            All ({allCount})
          </button>

          {/* IN PROGRESS */}

          <button
            className={activeTab === "inProgress" ? "tab active" : "tab"}
            onClick={() => setActiveTab("inProgress")}
          >
            In progress ({inProgressCount})
          </button>

          {/* COMPLETED */}

          <button
            className={activeTab === "completed" ? "tab active" : "tab"}
            onClick={() => setActiveTab("completed")}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* ================================================
          COURSE CARDS
      ================================================= */}

      {sortedCourses.length === 0 ? (
        <div className="no-courses">
          <h3>No courses found</h3>

          <p>You haven't enrolled in any courses yet.</p>

          <button onClick={() => setShowEnrollModal(true)}>
            <FaPlus />
            Enroll in course
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {sortedCourses.map((course) => (
            <div className="course-card" key={course.id}>
              {/* ======================================
                  TOP
              ====================================== */}

              <div className="course-card-top">
                {/* ICON */}

                <div
                  className="course-icon"
                  style={{
                    backgroundColor: course.iconBg,
                    color: course.iconColor,
                  }}
                >
                  {getCourseIcon(course.icon)}
                </div>

                {/* GRADE */}

                <span className="grade">{course.grade || "—"}</span>
              </div>

              {/* ======================================
                  COURSE NAME
              ====================================== */}

              <h3>{course.name}</h3>

              {/* ======================================
                  TEACHER + TIME
              ====================================== */}

              <p className="course-teacher">
                {course.teacher} · {course.schedule}
              </p>

              {/* ======================================
                  PROGRESS
              ====================================== */}

              <div className="progress-container">
                <div className="progress-background">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${course.progress}%`,
                      backgroundColor: course.iconColor,
                    }}
                  />
                </div>
              </div>

              {/* ======================================
                  BOTTOM
              ====================================== */}

              <div className="course-card-bottom">
                <span>{course.progress}% complete</span>

                <strong>{course.credits} credits</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================
          ENROLLMENT MODAL
      ================================================= */}

      {showEnrollModal && (
        <div className="enroll-overlay">
          <div className="enroll-modal">
            {/* MODAL HEADER */}

            <div className="enroll-modal-header">
              <div>
                <h2>Enroll in a course</h2>

                <p>Select a course you want to enroll in.</p>
              </div>

              <button
                className="close-modal"
                onClick={() => setShowEnrollModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* AVAILABLE COURSES */}

            <div className="available-courses">
              {availableCourses.map((course) => {
                // Check whether student already enrolled
                const alreadyEnrolled = courses.some(
                  (enrolledCourse) =>
                    String(enrolledCourse.id) === String(course.id),
                );

                return (
                  <div className="available-course" key={course.id}>
                    {/* ICON */}

                    <div
                      className="course-icon"
                      style={{
                        backgroundColor: course.iconBg,
                        color: course.iconColor,
                      }}
                    >
                      {getCourseIcon(course.icon)}
                    </div>

                    {/* COURSE INFORMATION */}

                    <div className="available-course-info">
                      <h3>{course.name}</h3>

                      <p>
                        {course.teacher} · {course.credits} credits
                      </p>
                    </div>

                    {/* ENROLL BUTTON */}

                    <button
                      disabled={alreadyEnrolled || enrolling}
                      onClick={() => handleEnroll(course)}
                    >
                      {alreadyEnrolled
                        ? "Enrolled"
                        : enrolling
                          ? "Enrolling..."
                          : "Enroll"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
