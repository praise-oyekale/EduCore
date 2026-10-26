import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaChalkboardTeacher,
  FaTimes,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import {
  getTeacherClassesData,
  getTeacherProfile,
  updateStudentSubjectScore,
} from "../../services/teacherService";

import "../teacher/teacherclasses.css";

const COLORS = ["blue", "purple", "orange", "green"];

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

const percent = (value) => (value == null ? "—" : `${value}%`);

/* ---------- Class card ---------- */

function ClassCard({ classItem, subjects, onManage }) {
  return (
    <article className="teacher-class-card">
      <div className="teacher-class-card-top">
        <div className={`teacher-class-icon ${classItem.color}`}>
          <FaChalkboardTeacher />
        </div>

        <span className="teacher-class-student-badge">
          {classItem.studentCount} student
          {classItem.studentCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="teacher-class-card-info">
        <h2>{classItem.name}</h2>
        <p>
          {classItem.isClassTeacher ? "Class teacher" : "Subject teacher"}
          {subjects.length ? ` · ${subjects.join(", ")}` : ""}
        </p>
      </div>

      <div className="teacher-class-progress">
        <div
          className={`teacher-class-progress-fill ${classItem.color}`}
          style={{ width: `${classItem.averageScore || 0}%` }}
        />
      </div>

      <div className="teacher-class-card-bottom">
        <span>Avg. score {percent(classItem.averageScore)}</span>

        <button
          type="button"
          className="teacher-class-small-button"
          onClick={() => onManage(classItem)}
        >
          Manage
        </button>
      </div>
    </article>
  );
}

/* ---------- Roster modal (view students, enter scores) ---------- */

function RosterModal({ classItem, teacherSubjects, onClose, onSaved }) {
  const [scores, setScores] = useState({});
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const mine = teacherSubjects.map((s) => s.toLowerCase());

  // One row for every student and subject this teacher is responsible for
  const rows = [];
  classItem.students.forEach((student) => {
    const subjects = Array.isArray(student.subjects) ? student.subjects : [];

    subjects
      .filter(
        (subject) =>
          mine.length === 0 ||
          mine.includes(String(subject.name).toLowerCase()),
      )
      .forEach((subject) => {
        rows.push({
          key: `${student.id}::${subject.name}`,
          studentId: student.id,
          student: student.fullName || "Unnamed student",
          subject: subject.name,
          score: Number(subject.score) || 0,
        });
      });
  });

  async function handleSave(row) {
    const value = scores[row.key] ?? row.score;

    setSavingKey(row.key);
    setError("");
    setMessage("");

    try {
      await updateStudentSubjectScore(row.studentId, row.subject, value);
      await onSaved();
      setMessage(`Saved ${row.student}'s ${row.subject} score.`);
    } catch (err) {
      console.error("Error saving score:", err);
      setError(err.message || "Unable to save this score.");
    } finally {
      setSavingKey("");
    }
  }

  return (
    <div
      className="teacher-classes-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="teacher-classes-modal teacher-roster-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="roster-heading"
      >
        <div className="teacher-classes-modal-heading">
          <div>
            <h2 id="roster-heading">{classItem.name} roster</h2>
            <p>
              {classItem.studentCount} student
              {classItem.studentCount === 1 ? "" : "s"} · Enter scores out of
              100
            </p>
          </div>

          <button
            type="button"
            className="teacher-classes-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {error && <p className="teacher-classes-form-error">{error}</p>}
        {message && <p className="teacher-roster-success">{message}</p>}

        {classItem.students.length === 0 ? (
          <p className="teacher-roster-empty">
            No students are in this class yet.
          </p>
        ) : rows.length === 0 ? (
          <p className="teacher-roster-empty">
            The students in this class have no subjects matching yours yet.
          </p>
        ) : (
          <div className="teacher-roster-scroll">
            <table className="teacher-roster-table">
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>SUBJECT</th>
                  <th>SCORE</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td className="teacher-classes-table-name">
                      {row.student}
                    </td>
                    <td>{row.subject}</td>
                    <td>
                      <input
                        className="teacher-roster-score-input"
                        type="number"
                        min="0"
                        max="100"
                        value={scores[row.key] ?? row.score}
                        onChange={(e) =>
                          setScores((previous) => ({
                            ...previous,
                            [row.key]: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="teacher-class-small-button"
                        onClick={() => handleSave(row)}
                        disabled={savingKey === row.key}
                      >
                        {savingKey === row.key ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="teacher-classes-modal-actions">
          <button
            type="button"
            className="teacher-classes-cancel-button"
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

export default function TeacherClasses() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedName, setSelectedName] = useState(null);

  const loadClasses = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const profile = await getTeacherProfile(uid);
      setTeacher(profile);

      const data = await getTeacherClassesData(profile || {});

      setClasses(
        data.map((item, index) => ({
          ...item,
          color: COLORS[index % COLORS.length],
        })),
      );
    } catch (err) {
      console.error("Error loading classes:", err);
      setError("We couldn't load your classes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const subjects = useMemo(
    () => toList(teacher?.subjectsTaught),
    [teacher?.subjectsTaught],
  );

  const filteredClasses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return classes;

    return classes.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        subjects.some((s) => s.toLowerCase().includes(term)),
    );
  }, [classes, search, subjects]);

  // Always read the freshest copy of the selected class after a score save
  const selectedClass = classes.find((item) => item.name === selectedName);

  if (loading) {
    return (
      <main className="teacher-classes-page">
        <div className="teacher-classes-container">
          <div className="teacher-classes-empty">Loading your classes...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="teacher-classes-page">
      <div className="teacher-classes-container">
        <header className="teacher-classes-header">
          <div>
            <h1>My Classes</h1>
            <p>
              {classes.length} assigned class{classes.length === 1 ? "" : "es"}
              {subjects.length ? ` · ${subjects.join(", ")}` : ""}.
            </p>
          </div>
        </header>

        {error && (
          <div className="teacher-classes-notice" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss message"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="teacher-classes-search">
          <FaSearch />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by class or subject..."
            aria-label="Search classes"
          />
        </div>

        <section className="teacher-classes-grid">
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              subjects={subjects}
              onManage={(item) => setSelectedName(item.name)}
            />
          ))}

          {filteredClasses.length === 0 && (
            <div className="teacher-classes-empty">
              <FaSearch />
              <h2>No classes found</h2>
              <p>
                {classes.length === 0
                  ? "No classes have been assigned to you yet. Please contact the admin."
                  : "Try another search term."}
              </p>
            </div>
          )}
        </section>

        <section className="teacher-classes-roster-card">
          <div className="teacher-classes-roster-heading">
            <div>
              <h2>Class roster overview</h2>
              <p>
                Summary of your classes. Attendance covers the last 30 days.
              </p>
            </div>
          </div>

          <div className="teacher-classes-table-wrapper">
            <table className="teacher-classes-table">
              <thead>
                <tr>
                  <th>CLASS</th>
                  <th>ROLE</th>
                  <th>STUDENTS</th>
                  <th>AVG. ATTENDANCE</th>
                  <th>AVG. SCORE</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredClasses.map((classItem) => (
                  <tr key={classItem.id}>
                    <td className="teacher-classes-table-name">
                      {classItem.name}
                    </td>
                    <td>
                      {classItem.isClassTeacher
                        ? "Class teacher"
                        : "Subject teacher"}
                    </td>
                    <td>{classItem.studentCount}</td>
                    <td>{percent(classItem.attendance)}</td>
                    <td>{percent(classItem.averageScore)}</td>
                    <td>
                      <button
                        type="button"
                        className="teacher-classes-open-button"
                        onClick={() => setSelectedName(classItem.name)}
                      >
                        Open <FaArrowRight />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredClasses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="teacher-classes-no-rows">
                      No classes to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedClass && (
        <RosterModal
          key={selectedClass.name}
          classItem={selectedClass}
          teacherSubjects={subjects}
          onClose={() => setSelectedName(null)}
          onSaved={loadClasses}
        />
      )}
    </main>
  );
}
