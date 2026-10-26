import { useCallback, useEffect, useMemo, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import {
  getTeacherProfile,
  getTeacherStudentsData,
} from "../../services/teacherService";

import "../teacher/teacherstudents.css";

const AVATAR_COLORS = ["blue", "purple", "green", "red", "orange", "teal"];

// A student "needs attention" below these numbers
const PASS_MARK = 50;
const MIN_ATTENDANCE = 75;

/* ---------- Helpers ---------- */

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S"
  );
}

function avatarColor(name = "") {
  let hash = 0;
  for (const char of name) hash = (hash + char.charCodeAt(0)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function letterGrade(score) {
  if (score == null) return "—";
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

function getStatus(student) {
  const lowScore = student.average != null && student.average < PASS_MARK;
  const lowAttendance =
    student.attendance != null && student.attendance < MIN_ATTENDANCE;

  if (lowScore || lowAttendance) {
    return { label: "Needs attention", tone: "attention" };
  }
  if (student.average == null && student.attendance == null) {
    return { label: "No data yet", tone: "muted" };
  }
  return { label: "On track", tone: "track" };
}

function formatDate(value) {
  if (!value) return "Not provided";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

/* ---------- Profile modal ---------- */

function StudentModal({ student, onClose }) {
  const status = getStatus(student);

  const details = [
    [
      "Class / Section",
      [student.className, student.section].filter(Boolean).join(" · "),
    ],
    ["Department", student.department],
    ["Student ID", student.studentId],
    ["Gender", capitalize(student.gender)],
    ["Date of birth", formatDate(student.dateOfBirth)],
    ["Phone", student.phoneNumber],
    ["Email", student.email],
    ["Guardian", student.guardianName],
    ["Guardian phone", student.guardianPhone],
    ["Absences", student.absences ?? 0],
  ];

  return (
    <div
      className="teacher-students-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="teacher-students-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-profile-heading"
      >
        <div className="teacher-students-modal-heading">
          <div className="teacher-students-modal-identity">
            <div
              className={`teacher-students-avatar large ${avatarColor(student.fullName)}`}
            >
              {getInitials(student.fullName)}
            </div>

            <div>
              <h2 id="student-profile-heading">
                {student.fullName || "Unnamed student"}
              </h2>
              <p>{student.studentId || student.id}</p>
            </div>
          </div>

          <button
            type="button"
            className="teacher-students-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="teacher-students-modal-summary">
          <div>
            <strong>{letterGrade(student.average)}</strong>
            <span>Current grade</span>
          </div>
          <div>
            <strong>
              {student.attendance == null ? "—" : `${student.attendance}%`}
            </strong>
            <span>Attendance</span>
          </div>
          <div>
            <span className={`teacher-students-status ${status.tone}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="teacher-students-detail-grid">
          {details.map(([label, value]) => (
            <div className="teacher-students-detail" key={label}>
              <span>{label}</span>
              <strong>
                {value === "" || value == null ? "Not provided" : value}
              </strong>
            </div>
          ))}
        </div>

        <h3 className="teacher-students-modal-title">Your subjects</h3>

        {student.mySubjects.length === 0 ? (
          <p className="teacher-students-muted">
            This student has none of your subjects yet.
          </p>
        ) : (
          <div className="teacher-students-subjects">
            {student.mySubjects.map((subject) => (
              <div className="teacher-students-subject-row" key={subject.name}>
                <span>{subject.name}</span>
                <strong>
                  {subject.score > 0 ? `${subject.score} / 100` : "Not scored"}
                </strong>
              </div>
            ))}
          </div>
        )}

        <div className="teacher-students-modal-actions">
          <button
            type="button"
            className="teacher-students-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------- Page ---------- */

export default function TeacherStudents() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const loadStudents = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const profile = await getTeacherProfile(uid);
      setTeacher(profile);

      setStudents(await getTeacherStudentsData(profile || {}));
    } catch (err) {
      console.error("Error loading students:", err);
      setError("We couldn't load your students. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const assignedClasses = useMemo(
    () =>
      toList(teacher?.assignedClasses).map((name) =>
        String(name).replace(/\s+/g, "").toUpperCase(),
      ),
    [teacher?.assignedClasses],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students
      .filter((s) => classFilter === "all" || s.className === classFilter)
      .filter(
        (s) =>
          !term ||
          (s.fullName || "").toLowerCase().includes(term) ||
          (s.studentId || "").toLowerCase().includes(term),
      );
  }, [students, search, classFilter]);

  const selectedStudent = students.find((s) => s.id === selectedId);

  if (loading) {
    return (
      <main className="teacher-students-page">
        <div className="teacher-students-container">
          <div className="teacher-students-empty">Loading your students...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="teacher-students-page">
      <div className="teacher-students-container">
        <header className="teacher-students-header">
          <div>
            <h1>Students</h1>
            <p>
              {students.length} student{students.length === 1 ? "" : "s"} across{" "}
              {assignedClasses.length} class
              {assignedClasses.length === 1 ? "" : "es"}.
            </p>
          </div>

          <div className="teacher-students-search">
            <FaSearch />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              aria-label="Search students"
            />
          </div>
        </header>

        <div className="teacher-students-filters">
          <button
            type="button"
            className={`teacher-students-filter ${classFilter === "all" ? "active" : ""}`}
            onClick={() => setClassFilter("all")}
          >
            All classes
          </button>

          {assignedClasses.map((name) => (
            <button
              type="button"
              key={name}
              className={`teacher-students-filter ${classFilter === name ? "active" : ""}`}
              onClick={() => setClassFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {error && <div className="teacher-students-error">{error}</div>}

        <section className="teacher-students-card">
          <div className="teacher-students-row teacher-students-head">
            <span>STUDENT</span>
            <span>CURRENT GRADE</span>
            <span>ATTENDANCE</span>
            <span>STATUS</span>
            <span />
          </div>

          {filtered.length === 0 && (
            <div className="teacher-students-empty">
              {assignedClasses.length === 0
                ? "No classes have been assigned to you yet. Please contact the admin."
                : students.length === 0
                  ? "There are no students in your classes yet."
                  : "No students match your search."}
            </div>
          )}

          {filtered.map((student) => {
            const status = getStatus(student);
            const subjectNames = student.mySubjects
              .map((s) => s.name)
              .join(", ");

            return (
              <div className="teacher-students-row" key={student.id}>
                <div className="teacher-students-person">
                  <div
                    className={`teacher-students-avatar ${avatarColor(student.fullName)}`}
                  >
                    {getInitials(student.fullName)}
                  </div>

                  <div>
                    <strong>{student.fullName || "Unnamed student"}</strong>
                    <span>
                      {[student.className, subjectNames]
                        .filter(Boolean)
                        .join(" · ") || "Class not set"}
                    </span>
                  </div>
                </div>

                <span>{letterGrade(student.average)}</span>

                <span>
                  {student.attendance == null ? "—" : `${student.attendance}%`}
                </span>

                <span>
                  <em className={`teacher-students-status ${status.tone}`}>
                    {status.label}
                  </em>
                </span>

                <div className="teacher-students-action">
                  <button
                    type="button"
                    className="teacher-students-button"
                    onClick={() => setSelectedId(student.id)}
                  >
                    View profile
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {selectedStudent && (
        <StudentModal
          key={selectedStudent.id}
          student={selectedStudent}
          onClose={() => setSelectedId(null)}
        />
      )}
    </main>
  );
}
