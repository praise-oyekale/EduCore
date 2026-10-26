import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

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

import { db } from "../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import {
  addStudentSubject,
  getAllSubjects,
} from "../../../services/subjectService";

// ======================================================
// ICON STYLES
// ======================================================

const ICON_STYLES = {
  flask: { icon: <FaFlask />, bg: "#eef4ff", color: "#2563eb" },
  calculator: { icon: <FaCalculator />, bg: "#f3edff", color: "#7c3aed" },
  history: { icon: <FaLandmark />, bg: "#fff5e6", color: "#c45b00" },
  language: { icon: <FaLanguage />, bg: "#edf9f1", color: "#16803c" },
  biology: { icon: <FaDna />, bg: "#ecfbfa", color: "#07988f" },
  art: { icon: <FaPalette />, bg: "#fff0f0", color: "#dc2626" },
};

// Picks an icon from the subject name
function getIconKey(name = "") {
  const text = name.toLowerCase();

  if (text.includes("math") || text.includes("further")) return "calculator";
  if (text.includes("english") || text.includes("language")) return "language";
  if (text.includes("bio")) return "biology";
  if (text.includes("art")) return "art";
  if (
    text.includes("civic") ||
    text.includes("history") ||
    text.includes("government") ||
    text.includes("social")
  ) {
    return "history";
  }
  return "flask";
}

// Converts a score (0-100) into a letter grade
function getLetterGrade(score) {
  if (!score) return "";
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

// Turns { name, score } from Firestore into what the cards need
function toSubjectCard(subject, index, studentClass, term) {
  const name = subject.name || "Untitled subject";
  const score = Number(subject.score) || 0;
  const style = ICON_STYLES[getIconKey(name)];

  return {
    id: `${name}-${index}`,
    name,
    score,
    grade: getLetterGrade(score),
    detail: [studentClass, term].filter(Boolean).join(" · ") || "Not assigned",
    icon: style.icon,
    iconBg: style.bg,
    iconColor: style.color,
  };
}

// ======================================================
// COMPONENT
// ======================================================

export default function StudentSubjects() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [showSort, setShowSort] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // The student's document (live)
  const [student, setStudent] = useState(null);

  // Subjects from the "subjects" collection, for the enroll list
  const [availableSubjects, setAvailableSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // ====================================================
  // LISTEN TO THE STUDENT DOCUMENT (updates live)
  // ====================================================

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setError("You must be logged in to view your subjects.");
      return undefined;
    }

    const unsubscribe = onSnapshot(
      doc(db, "student", user.uid),
      (snapshot) => {
        setStudent(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading subjects:", err);
        setError("Unable to load your subjects.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  // Load the subjects available to enroll in
  useEffect(() => {
    getAllSubjects()
      .then(setAvailableSubjects)
      .catch((err) => console.error("Error loading subject list:", err));
  }, []);

  // ====================================================
  // BUILD CARDS FROM student.subjects
  // ====================================================

  const subjects = Array.isArray(student?.subjects)
    ? student.subjects.map((subject, index) =>
        toSubjectCard(subject, index, student.grade, student.section),
      )
    : [];

  // ====================================================
  // ENROLL IN SUBJECT
  // ====================================================

  const handleEnroll = async (subject) => {
    try {
      if (!user?.uid) {
        setError("You must be logged in to enroll in a subject.");
        return;
      }

      const alreadyEnrolled = subjects.some(
        (item) => item.name.toLowerCase() === subject.name.toLowerCase(),
      );

      if (alreadyEnrolled) {
        setError("You are already enrolled in this subject.");
        return;
      }

      setEnrolling(true);
      setError("");

      await addStudentSubject(user.uid, subject.name);

      // No manual state update needed: the live listener refreshes the list
      setShowEnrollModal(false);
    } catch (err) {
      console.error("Enrollment error:", err);
      setError("Unable to enroll in this subject.");
    } finally {
      setEnrolling(false);
    }
  };

  // ====================================================
  // FILTER + SORT
  // ====================================================

  const filteredSubjects = subjects.filter((subject) => {
    if (activeTab === "graded") return subject.score > 0;
    if (activeTab === "ungraded") return subject.score === 0;
    return true;
  });

  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "scoreHigh") return b.score - a.score;
    if (sortBy === "scoreLow") return a.score - b.score;
    return 0;
  });

  const allCount = subjects.length;
  const gradedCount = subjects.filter((s) => s.score > 0).length;
  const ungradedCount = allCount - gradedCount;

  // ====================================================
  // LOADING SCREEN
  // ====================================================

  if (loading) {
    return (
      <div className="studentcourses-container">
        <div className="courses-loading">Loading your subjects...</div>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="studentcourses-container">
      {/* HEADER */}

      <section className="coursegreeting-section">
        <div className="course-welcome-message">
          <h1>Subjects</h1>

          <p>
            {allCount} subjects this term
            {student?.grade ? ` · ${student.grade}` : ""}.
          </p>
        </div>

        <div className="courseaction-button">
          <div className="sort-wrapper">
            <button
              className="course-sort-btn"
              onClick={() => setShowSort(!showSort)}
            >
              <FaSort />
              Sort
            </button>

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
                  Subject name
                </button>

                <button
                  onClick={() => {
                    setSortBy("scoreHigh");
                    setShowSort(false);
                  }}
                >
                  Score: High → Low
                </button>

                <button
                  onClick={() => {
                    setSortBy("scoreLow");
                    setShowSort(false);
                  }}
                >
                  Score: Low → High
                </button>
              </div>
            )}
          </div>

          <button
            className="course-enroll-btn"
            onClick={() => {
              setShowEnrollModal(true);
              setError("");
            }}
          >
            <FaPlus />
            Add subject
          </button>
        </div>
      </section>

      {error && <div className="course-error">{error}</div>}

      {/* FILTER TABS */}

      <div className="courses-toolbar">
        <div className="course-tabs">
          <button
            className={activeTab === "all" ? "tab active" : "tab"}
            onClick={() => setActiveTab("all")}
          >
            All ({allCount})
          </button>

          <button
            className={activeTab === "graded" ? "tab active" : "tab"}
            onClick={() => setActiveTab("graded")}
          >
            Graded ({gradedCount})
          </button>

          <button
            className={activeTab === "ungraded" ? "tab active" : "tab"}
            onClick={() => setActiveTab("ungraded")}
          >
            Not graded ({ungradedCount})
          </button>
        </div>
      </div>

      {/* SUBJECT CARDS */}

      {sortedSubjects.length === 0 ? (
        <div className="no-courses">
          <h3>No subjects found</h3>

          <p>No subjects have been added to your profile yet.</p>

          <button onClick={() => setShowEnrollModal(true)}>
            <FaPlus />
            Add subject
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {sortedSubjects.map((subject) => (
            <div className="course-card" key={subject.id}>
              <div className="course-card-top">
                <div
                  className="course-icon"
                  style={{
                    backgroundColor: subject.iconBg,
                    color: subject.iconColor,
                  }}
                >
                  {subject.icon}
                </div>

                <span className="grade">{subject.grade || "—"}</span>
              </div>

              <h3>{subject.name}</h3>

              <p className="course-teacher">{subject.detail}</p>

              <div className="progress-container">
                <div className="progress-background">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(subject.score, 100)}%`,
                      backgroundColor: subject.iconColor,
                    }}
                  />
                </div>
              </div>

              <div className="course-card-bottom">
                <span>Score</span>

                <strong>{subject.score} / 100</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD SUBJECT MODAL */}

      {showEnrollModal && (
        <div className="enroll-overlay">
          <div className="enroll-modal">
            <div className="enroll-modal-header">
              <div>
                <h2>Add a subject</h2>

                <p>Select a subject to add to your profile.</p>
              </div>

              <button
                className="close-modal"
                onClick={() => setShowEnrollModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="available-courses">
              {availableSubjects.length === 0 && (
                <p className="no-courses">
                  No subjects are available yet. Please check back later.
                </p>
              )}

              {availableSubjects.map((subject) => {
                const name = subject.name || "Untitled subject";
                const style = ICON_STYLES[getIconKey(name)];

                const alreadyEnrolled = subjects.some(
                  (item) => item.name.toLowerCase() === name.toLowerCase(),
                );

                return (
                  <div className="available-course" key={subject.id}>
                    <div
                      className="course-icon"
                      style={{
                        backgroundColor: style.bg,
                        color: style.color,
                      }}
                    >
                      {style.icon}
                    </div>

                    <div className="available-course-info">
                      <h3>{name}</h3>
                    </div>

                    <button
                      disabled={alreadyEnrolled || enrolling}
                      onClick={() => handleEnroll({ ...subject, name })}
                    >
                      {alreadyEnrolled
                        ? "Added"
                        : enrolling
                          ? "Adding..."
                          : "Add"}
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
