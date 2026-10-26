import { useEffect, useMemo, useState } from "react";
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaGraduationCap,
  FaUserGraduate,
  FaUserPlus,
} from "react-icons/fa";
import { FaRightFromBracket } from "react-icons/fa6";

import { createStudentAccount } from "../../services/secondaryAuth";
import {
  createStudent,
  generateStudentId,
  getStudents,
  updateStudent,
} from "../../services/studentService";
import { calculateStudentGPA } from "../../services/teacherService";

import "../admin/adminstudent.css";

const AT_RISK_GPA = 2.5; // GPA below this shows "At risk"
const NEW_TERM_DAYS = 90; // "New this term" = added in the last 90 days

const CLASSES = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];

const AVATAR_COLORS = ["orange", "blue", "red", "green", "purple"];

const STATUS_OPTIONS = [
  { value: "enrolled", label: "Active" },
  { value: "nls", label: "No longer at school" },
  { value: "transferredIn", label: "Transferred in" },
  { value: "transferredOut", label: "Transferred out" },
  { value: "withdrawn", label: "Withdrawn" },
];

const emptyForm = {
  fullName: "",
  studentId: "",
  email: "",
  password: "",
  gender: "",
  dateOfBirth: "",
  phoneNumber: "",
  homeAddress: "",
  guardianName: "",
  guardianPhone: "",
  department: "",
  grade: "",
  section: "",
  gpa: "",
  absences: 0,
  status: "enrolled",
  subjects: [],
};

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

function toMillis(value) {
  if (typeof value === "number") return value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeClass(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

/**
 * Helper: Formats display GPA using subjects array weighted calculation
 */
function getStudentDisplayGpa(student) {
  const computed = calculateStudentGPA(student?.subjects);
  if (computed !== "0.00") return computed;
  if (student?.gpa !== "" && student?.gpa != null) {
    return Number(student.gpa).toFixed(2);
  }
  return "—";
}

function getDisplayStatus(student) {
  const status = String(student.status || "enrolled").toLowerCase();
  const displayGpaStr = getStudentDisplayGpa(student);
  const gpa = Number(displayGpaStr);

  if (status === "enrolled") {
    if (!Number.isNaN(gpa) && gpa > 0 && gpa < AT_RISK_GPA) {
      return { label: "At risk", tone: "risk" };
    }
    return { label: "Active", tone: "active" };
  }
  if (status === "withdrawn") return { label: "Withdrawn", tone: "muted" };
  if (status === "nls") return { label: "NLS", tone: "muted" };
  if (status === "transferredin")
    return { label: "Transferred in", tone: "active" };
  if (status === "transferredout")
    return { label: "Transferred out", tone: "muted" };
  return { label: student.status, tone: "muted" };
}

function formatClassSection(student) {
  if (!student.grade) return "Not assigned";
  return `${normalizeClass(student.grade)}${
    student.section ? `-${student.section}` : ""
  }`;
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

/* ---------- Modal ---------- */

function Field({ label, children, full = false }) {
  return (
    <div className={`students-field ${full ? "full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function StudentModal({ mode, student, onClose, onSaved, onModeChange }) {
  const [form, setForm] = useState(() =>
    mode === "add"
      ? { ...emptyForm, studentId: generateStudentId() }
      : {
          ...emptyForm,
          ...student,
          homeAddress: student.homeAddress || student.address || "",
          gender: String(student.gender || "").toLowerCase(),
          grade: normalizeClass(student.grade),
          gpa: student.gpa ?? "",
          subjects: Array.isArray(student.subjects) ? student.subjects : [],
        },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isView = mode === "view";
  const isAdd = mode === "add";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  function handleSubjectChange(index, key, value) {
    setForm((previous) => ({
      ...previous,
      subjects: previous.subjects.map((subject, i) =>
        i === index ? { ...subject, [key]: value } : subject,
      ),
    }));
  }

  function addSubject() {
    setForm((previous) => ({
      ...previous,
      subjects: [...previous.subjects, { name: "", score: "" }],
    }));
  }

  function removeSubject(index) {
    setForm((previous) => ({
      ...previous,
      subjects: previous.subjects.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName.trim())
      return setError("Please enter the student's full name.");
    if (!form.grade.toString().trim())
      return setError("Please select the class.");
    if (isAdd && !form.email.trim()) return setError("Email is required.");
    if (isAdd && form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setSaving(true);
    setError("");

    const cleanedSubjects = form.subjects
      .filter((s) => s.name.trim())
      .map((s) => ({ name: s.name.trim(), score: Number(s.score) || 0 }));

    // Calculate dynamic weighted GPA from subject list
    const computedGpa = calculateStudentGPA(cleanedSubjects);
    const finalGpa =
      computedGpa !== "0.00"
        ? computedGpa
        : form.gpa === ""
          ? ""
          : Number(form.gpa);

    const data = {
      fullName: form.fullName.trim(),
      studentId: form.studentId.trim(),
      email: form.email.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      phoneNumber: form.phoneNumber.trim(),
      homeAddress: form.homeAddress.trim(),
      guardianName: form.guardianName.trim(),
      guardianPhone: form.guardianPhone.trim(),
      department: form.department.trim(),
      grade: normalizeClass(form.grade),
      section: form.section.trim().toUpperCase(),
      gpa: finalGpa,
      absences: Number(form.absences) || 0,
      status: form.status,
      subjects: cleanedSubjects,
    };

    try {
      if (isAdd) {
        const created = await createStudentAccount({
          email: data.email,
          password: form.password,
          fullName: data.fullName,
          role: "student",
        });

        const uid = created?.uid || created?.user?.uid;
        if (!uid) throw new Error("Signup did not return a user ID.");

        await createStudent(uid, data);
      } else {
        await updateStudent(student.id, data);
      }

      await onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving student:", err);
      setError(err.message || "Unable to save student. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const title = isAdd
    ? "Add student"
    : isView
      ? "Student details"
      : "Edit student";

  const classOptions =
    form.grade && !CLASSES.includes(form.grade)
      ? [form.grade, ...CLASSES]
      : CLASSES;

  return (
    <div className="students-modal-backdrop" onMouseDown={onClose}>
      <div
        className="students-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="students-modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="students-icon-button"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {isView ? (
          <div className="students-modal-body">
            <div className="students-view-identity">
              <div
                className={`students-avatar large ${avatarColor(
                  student.fullName,
                )}`}
              >
                {getInitials(student.fullName)}
              </div>
              <div>
                <h3>{student.fullName}</h3>
                <p>{student.studentId || student.id}</p>
              </div>
              <span
                className={`students-status ${getDisplayStatus(student).tone}`}
              >
                {getDisplayStatus(student).label}
              </span>
            </div>

            <div className="students-view-grid">
              {[
                ["Class / Section", formatClassSection(student)],
                ["Department", student.department],
                ["GPA", getStudentDisplayGpa(student)],
                ["Absences", student.absences ?? 0],
                ["Gender", capitalize(student.gender)],
                ["Date of birth", formatDate(student.dateOfBirth)],
                ["Email", student.email],
                ["Phone", student.phoneNumber],
                ["Guardian", student.guardianName],
                ["Guardian phone", student.guardianPhone],
                ["Address", student.homeAddress || student.address],
              ].map(([label, value]) => (
                <div className="students-view-item" key={label}>
                  <span>{label}</span>
                  <strong>
                    {value === "" || value == null ? "Not provided" : value}
                  </strong>
                </div>
              ))}
            </div>

            <h4 className="students-section-title">Subject grades</h4>
            {Array.isArray(student.subjects) && student.subjects.length > 0 ? (
              <div className="students-subjects-view">
                {student.subjects.map((subject, index) => (
                  <div
                    className="students-subject-row"
                    key={`${subject.name}-${index}`}
                  >
                    <span>{subject.name}</span>
                    <strong>{subject.score}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="students-muted-text">
                No subject grades added yet.
              </p>
            )}

            <div className="students-modal-footer">
              <button
                type="button"
                className="students-secondary-button"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="students-primary-button"
                onClick={() => onModeChange("edit")}
              >
                Edit student
              </button>
            </div>
          </div>
        ) : (
          <form className="students-modal-body" onSubmit={handleSubmit}>
            {error && <div className="students-form-error">{error}</div>}

            <h4 className="students-section-title first">Personal</h4>
            <div className="students-form-grid">
              <Field label="Full name">
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Student ID">
                <input
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!isAdd}
                />
              </Field>
              {isAdd && (
                <Field label="Temporary password">
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </Field>
              )}
              <Field label="Gender">
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>
              <Field label="Date of birth">
                <input
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Phone number">
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Address" full>
                <input
                  name="homeAddress"
                  value={form.homeAddress}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Guardian name">
                <input
                  name="guardianName"
                  value={form.guardianName}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Guardian phone">
                <input
                  name="guardianPhone"
                  value={form.guardianPhone}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <h4 className="students-section-title">Academic</h4>
            <div className="students-form-grid">
              <Field label="Department">
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Class">
                <select name="grade" value={form.grade} onChange={handleChange}>
                  <option value="">Select class</option>
                  {classOptions.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Section">
                <input
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  placeholder="e.g. B"
                />
              </Field>
              <Field label="GPA (Auto-calculated from subjects)">
                <input
                  name="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={form.gpa}
                  onChange={handleChange}
                  placeholder="Calculated on save"
                />
              </Field>
              <Field label="Absences">
                <input
                  name="absences"
                  type="number"
                  min="0"
                  value={form.absences}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <div className="students-subjects-heading">
              <h4 className="students-section-title">Subject grades</h4>
              <button
                type="button"
                className="students-link-button"
                onClick={addSubject}
              >
                <FaPlus /> Add subject
              </button>
            </div>

            {form.subjects.length === 0 && (
              <p className="students-muted-text">No subjects yet.</p>
            )}

            {form.subjects.map((subject, index) => (
              <div className="students-subject-edit" key={index}>
                <input
                  placeholder="Subject"
                  value={subject.name}
                  onChange={(e) =>
                    handleSubjectChange(index, "name", e.target.value)
                  }
                />
                <input
                  placeholder="Score"
                  type="number"
                  min="0"
                  max="100"
                  value={subject.score}
                  onChange={(e) =>
                    handleSubjectChange(index, "score", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="students-icon-button"
                  onClick={() => removeSubject(index)}
                  aria-label="Remove subject"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            <div className="students-modal-footer">
              <button
                type="button"
                className="students-secondary-button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="students-primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : isAdd ? "Add student" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function Adminstudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [modal, setModal] = useState(null);

  async function loadStudents() {
    try {
      setError("");
      setStudents(await getStudents());
    } catch (err) {
      console.error("Error loading students:", err);
      setError(err.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const stats = useMemo(() => {
    const cutoff = Date.now() - NEW_TERM_DAYS * 24 * 60 * 60 * 1000;
    const status = (s) => String(s.status || "enrolled").toLowerCase();

    return {
      total: students.length,
      enrolled: students.filter((s) => status(s) === "enrolled").length,
      newThisTerm: students.filter((s) => toMillis(s.createdAt) >= cutoff)
        .length,
      withdrawn: students.filter((s) =>
        ["withdrawn", "transferredout", "nls"].includes(status(s)),
      ).length,
    };
  }, [students]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students
      .filter(
        (s) => classFilter === "all" || normalizeClass(s.grade) === classFilter,
      )
      .filter(
        (s) =>
          !term ||
          (s.fullName || "").toLowerCase().includes(term) ||
          (s.studentId || "").toLowerCase().includes(term),
      )
      .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
  }, [students, search, classFilter]);

  return (
    <main className="students-page">
      <div className="students-container">
        <header className="students-header">
          <div>
            <h1>Students</h1>
            <p>
              {stats.enrolled.toLocaleString()} students enrolled across{" "}
              {CLASSES.length} classes.
            </p>
          </div>

          <div className="students-header-actions">
            <button type="button" className="students-secondary-button">
              Bulk import
            </button>
            <button
              type="button"
              className="students-primary-button"
              onClick={() => setModal({ mode: "add", student: null })}
            >
              Add student
            </button>
          </div>
        </header>

        <section className="students-stats">
          <div className="students-stat-card">
            <div className="students-stat-icon blue">
              <FaUserGraduate />
            </div>
            <strong>{stats.total.toLocaleString()}</strong>
            <span>Total students</span>
          </div>
          <div className="students-stat-card">
            <div className="students-stat-icon green">
              <FaUserPlus />
            </div>
            <strong>{stats.newThisTerm.toLocaleString()}</strong>
            <span>New this term</span>
          </div>
          <div className="students-stat-card">
            <div className="students-stat-icon purple">
              <FaRightFromBracket />
            </div>
            <strong>{stats.withdrawn.toLocaleString()}</strong>
            <span>Withdrawn this term</span>
          </div>
        </section>

        <section className="students-card">
          <div className="students-card-heading">
            <h2>All students</h2>
            <input
              className="students-search"
              type="search"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="students-filters">
            <button
              type="button"
              className={`students-filter ${
                classFilter === "all" ? "active" : ""
              }`}
              onClick={() => setClassFilter("all")}
            >
              All classes
            </button>
            {CLASSES.map((className) => (
              <button
                type="button"
                key={className}
                className={`students-filter ${
                  classFilter === className ? "active" : ""
                }`}
                onClick={() => setClassFilter(className)}
              >
                {className}
              </button>
            ))}
          </div>

          {error && <div className="students-form-error">{error}</div>}

          <div className="students-table">
            <div className="students-table-row students-table-head">
              <span>STUDENT</span>
              <span>CLASS / SECTION</span>
              <span>GPA</span>
              <span>STATUS</span>
              <span />
            </div>

            {loading && (
              <div className="students-empty">Loading students...</div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="students-empty">No students found.</div>
            )}

            {filtered.map((student) => {
              const status = getDisplayStatus(student);

              return (
                <div className="students-table-row" key={student.id}>
                  <div className="students-person">
                    <div
                      className={`students-avatar ${avatarColor(
                        student.fullName,
                      )}`}
                    >
                      {getInitials(student.fullName)}
                    </div>
                    <div>
                      <strong>{student.fullName || "Unnamed student"}</strong>
                      <span>{student.studentId || student.id}</span>
                    </div>
                  </div>

                  <span>{formatClassSection(student)}</span>

                  <span>{getStudentDisplayGpa(student)}</span>

                  <span>
                    <em className={`students-status ${status.tone}`}>
                      {status.label}
                    </em>
                  </span>

                  <div className="students-row-actions">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "view", student })}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", student })}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {modal && (
        <StudentModal
          key={`${modal.mode}-${modal.student?.id || "new"}`}
          mode={modal.mode}
          student={modal.student}
          onClose={() => setModal(null)}
          onSaved={loadStudents}
          onModeChange={(mode) => setModal((prev) => ({ ...prev, mode }))}
        />
      )}
    </main>
  );
}
