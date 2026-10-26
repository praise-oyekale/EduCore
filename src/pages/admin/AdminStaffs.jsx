import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";

import {
  createStaff,
  generateStaffId,
  getStaffList,
  updateStaff,
} from "../../services/teacherService";

// Same function used for students: creates the login on the hidden second app
// so your admin session stays signed in. Change the path/name if yours differs.
import { createStudentAccount as createAccount } from "../../services/secondaryAuth";

import "../admin/adminstaffs.css";

const CLASSES = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
const TITLES = ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Engr", "Pastor"];
const DEPARTMENTS = [
  "Science",
  "Arts",
  "Commercial",
  "Languages",
  "Technology",
  "Social Studies",
  "Vocational",
  "Administration",
  "Accounts",
  "Library",
  "Security & Maintenance",
];
const POSITIONS = [
  "Subject Teacher",
  "Class Teacher",
  "Head of Department",
  "Vice Principal",
  "Principal",
  "Bursar",
  "Secretary",
  "Librarian",
  "Counsellor",
  "Laboratory Technician",
  "Other",
];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Volunteer"];
const QUALIFICATIONS = [
  "OND",
  "HND",
  "B.Sc / B.A / B.Ed",
  "PGDE",
  "M.Sc / M.Ed",
  "PhD",
  "Other",
];
const SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Civic Education",
  "Economics",
  "Government",
  "Literature in English",
  "Agricultural Science",
  "Computer Studies",
  "Further Mathematics",
  "Geography",
  "Yoruba",
  "Christian Religious Studies",
  "Basic Science",
  "Basic Technology",
  "Business Studies",
];

const STAFF_TYPES = [
  { value: "Teaching", label: "Teaching staff" },
  { value: "Non-teaching", label: "Non-teaching staff" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "onLeave", label: "On leave" },
  { value: "suspended", label: "Suspended" },
  { value: "resigned", label: "Resigned" },
  { value: "retired", label: "Retired" },
];

const AVATAR_COLORS = ["orange", "blue", "red", "green", "purple"];

const emptyForm = {
  title: "",
  fullName: "",
  staffId: "",
  email: "",
  password: "",
  gender: "",
  dateOfBirth: "",
  phoneNumber: "",
  homeAddress: "",
  nextOfKinName: "",
  nextOfKinPhone: "",
  staffType: "Teaching",
  position: "",
  department: "",
  employmentType: "Full-time",
  dateJoined: "",
  qualification: "",
  certification: "",
  reportingTo: "",
  office: "",
  status: "active",
  assignedClasses: [],
  classTeacherOf: "",
  subjectsTaught: [],
  periodsPerWeek: "",
  about: "",
};

/* ---------- Helpers ---------- */

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

function capitalize(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function displayName(staff) {
  return (
    [staff.title, staff.fullName].filter(Boolean).join(" ") || "Unnamed staff"
  );
}

function getDisplayStatus(staff) {
  switch (String(staff.status || "active").toLowerCase()) {
    case "active":
      return { label: "Active", tone: "active" };
    case "onleave":
      return { label: "On leave", tone: "leave" };
    case "suspended":
      return { label: "Suspended", tone: "risk" };
    case "resigned":
      return { label: "Resigned", tone: "muted" };
    case "retired":
      return { label: "Retired", tone: "muted" };
    default:
      return { label: capitalize(staff.status), tone: "muted" };
  }
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

function yearsSince(value) {
  if (!value) return "";
  const start = new Date(`${value}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "";
  const years = Math.floor(
    (Date.now() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  return years < 1
    ? "Less than a year"
    : `${years} yr${years === 1 ? "" : "s"}`;
}

function summarizeClasses(staff) {
  const list = Array.isArray(staff.assignedClasses)
    ? staff.assignedClasses
    : [];
  if (list.length === 0)
    return staff.staffType === "Non-teaching" ? "—" : "None assigned";
  return list.join(", ");
}

/* ---------- Small form pieces ---------- */

function Field({ label, children, full = false }) {
  return (
    <div className={`staff-field ${full ? "full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function TagInput({ values, onChange, placeholder }) {
  const [text, setText] = useState("");

  function addTag(raw) {
    const value = raw.trim();
    if (!value) return;
    if (values.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setText("");
      return;
    }
    onChange([...values, value]);
    setText("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(text);
    } else if (event.key === "Backspace" && !text && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="staff-tags-box">
      {values.map((value) => (
        <span className="staff-chip" key={value}>
          {value}
          <button
            type="button"
            aria-label={`Remove ${value}`}
            onClick={() => onChange(values.filter((item) => item !== value))}
          >
            <FaTimes />
          </button>
        </span>
      ))}
      <input
        list="staff-subject-suggestions"
        value={text}
        placeholder={values.length ? "" : placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(text)}
      />
    </div>
  );
}

/* ---------- Modal ---------- */

function StaffModal({ mode, staff, onClose, onSaved, onModeChange }) {
  const [form, setForm] = useState(() =>
    mode === "add"
      ? { ...emptyForm, staffId: generateStaffId() }
      : {
          ...emptyForm,
          ...staff,
          gender: String(staff.gender || "").toLowerCase(),
          homeAddress: staff.homeAddress || staff.address || "",
          assignedClasses: Array.isArray(staff.assignedClasses)
            ? staff.assignedClasses
            : [],
          subjectsTaught: Array.isArray(staff.subjectsTaught)
            ? staff.subjectsTaught
            : staff.subjectsTaught
              ? String(staff.subjectsTaught)
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
              : [],
          periodsPerWeek: staff.periodsPerWeek ?? "",
        },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isView = mode === "view";
  const isAdd = mode === "add";
  const isTeaching = form.staffType === "Teaching";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  function toggleClass(className) {
    setForm((previous) => {
      const has = previous.assignedClasses.includes(className);
      const assignedClasses = has
        ? previous.assignedClasses.filter((item) => item !== className)
        : [...previous.assignedClasses, className];

      return {
        ...previous,
        assignedClasses,
        // class teacher must be one of the assigned classes
        classTeacherOf: assignedClasses.includes(previous.classTeacherOf)
          ? previous.classTeacherOf
          : "",
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName.trim()) return setError("Please enter the full name.");
    if (isAdd && !form.email.trim()) return setError("Email is required.");
    if (isAdd && form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setSaving(true);
    setError("");

    const data = {
      title: form.title,
      fullName: form.fullName.trim(),
      staffId: form.staffId.trim(),
      email: form.email.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      phoneNumber: form.phoneNumber.trim(),
      homeAddress: form.homeAddress.trim(),
      nextOfKinName: form.nextOfKinName.trim(),
      nextOfKinPhone: form.nextOfKinPhone.trim(),
      staffType: form.staffType,
      position: form.position,
      department: form.department.trim(),
      employmentType: form.employmentType,
      dateJoined: form.dateJoined,
      qualification: form.qualification,
      certification: form.certification.trim(),
      reportingTo: form.reportingTo.trim(),
      office: form.office.trim(),
      status: form.status,
      assignedClasses: isTeaching ? form.assignedClasses : [],
      classTeacherOf: isTeaching ? form.classTeacherOf : "",
      subjectsTaught: isTeaching ? form.subjectsTaught : [],
      periodsPerWeek: isTeaching ? Number(form.periodsPerWeek) || 0 : 0,
      about: form.about.trim(),
    };

    try {
      if (isAdd) {
        const created = await createAccount({
          email: data.email,
          password: form.password,
          fullName: data.fullName,
        });

        const uid = created?.uid;
        if (!uid) throw new Error("Account creation did not return a user ID.");

        await createStaff(uid, data);
      } else {
        await updateStaff(staff.id, data);
      }

      await onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving staff:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Unable to save. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  const title = isAdd ? "Add staff" : isView ? "Staff details" : "Edit staff";

  const viewSubjects = Array.isArray(staff?.subjectsTaught)
    ? staff.subjectsTaught
    : staff?.subjectsTaught
      ? String(staff.subjectsTaught)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const viewClasses = Array.isArray(staff?.assignedClasses)
    ? staff.assignedClasses
    : [];

  return (
    <div className="staff-modal-backdrop" onMouseDown={onClose}>
      <div
        className="staff-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="staff-modal-header">
          <h2>{title}</h2>
          <button type="button" className="staff-icon-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {isView ? (
          <div className="staff-modal-body">
            <div className="staff-view-identity">
              <div
                className={`staff-avatar large ${avatarColor(staff.fullName)}`}
              >
                {getInitials(staff.fullName)}
              </div>
              <div>
                <h3>{displayName(staff)}</h3>
                <p>{staff.staffId || staff.id}</p>
              </div>
              <span className={`staff-status ${getDisplayStatus(staff).tone}`}>
                {getDisplayStatus(staff).label}
              </span>
            </div>

            <div className="staff-view-grid">
              {[
                ["Staff type", staff.staffType || "Teaching"],
                ["Position", staff.position],
                ["Department", staff.department],
                ["Employment type", staff.employmentType],
                ["Date joined", formatDate(staff.dateJoined)],
                ["Time at school", yearsSince(staff.dateJoined)],
                ["Qualification", staff.qualification],
                ["Certification / TRCN no.", staff.certification],
                ["Reports to", staff.reportingTo],
                ["Office", staff.office],
                ["Gender", capitalize(staff.gender)],
                ["Date of birth", formatDate(staff.dateOfBirth)],
                ["Email", staff.email],
                ["Phone", staff.phoneNumber],
                ["Next of kin", staff.nextOfKinName],
                ["Next of kin phone", staff.nextOfKinPhone],
                ["Address", staff.homeAddress || staff.address],
              ].map(([label, value]) => (
                <div className="staff-view-item" key={label}>
                  <span>{label}</span>
                  <strong>
                    {value === "" || value == null ? "Not provided" : value}
                  </strong>
                </div>
              ))}
            </div>

            {staff.staffType !== "Non-teaching" && (
              <>
                <h4 className="staff-section-title">Teaching assignment</h4>

                <div className="staff-view-item">
                  <span>Assigned classes</span>
                  {viewClasses.length ? (
                    <div className="staff-chip-row">
                      {viewClasses.map((c) => (
                        <span className="staff-chip static" key={c}>
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <strong>None assigned</strong>
                  )}
                </div>

                <div className="staff-view-item spaced">
                  <span>Subjects taught</span>
                  {viewSubjects.length ? (
                    <div className="staff-chip-row">
                      {viewSubjects.map((s) => (
                        <span className="staff-chip static" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <strong>None added</strong>
                  )}
                </div>

                <div className="staff-view-grid spaced">
                  <div className="staff-view-item">
                    <span>Class teacher of</span>
                    <strong>
                      {staff.classTeacherOf || "Not a class teacher"}
                    </strong>
                  </div>
                  <div className="staff-view-item">
                    <span>Periods per week</span>
                    <strong>{staff.periodsPerWeek || "Not set"}</strong>
                  </div>
                </div>
              </>
            )}

            {staff.about && (
              <>
                <h4 className="staff-section-title">About</h4>
                <p className="staff-about">{staff.about}</p>
              </>
            )}

            <div className="staff-modal-footer">
              <button
                type="button"
                className="staff-secondary-button"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="staff-primary-button"
                onClick={() => onModeChange("edit")}
              >
                Edit staff
              </button>
            </div>
          </div>
        ) : (
          <form className="staff-modal-body" onSubmit={handleSubmit}>
            {error && <div className="staff-form-error">{error}</div>}

            <h4 className="staff-section-title first">Personal</h4>
            <div className="staff-form-grid">
              <Field label="Title">
                <select name="title" value={form.title} onChange={handleChange}>
                  <option value="">Select title</option>
                  {TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Full name">
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Staff ID">
                <input
                  name="staffId"
                  value={form.staffId}
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
              <Field label="Next of kin">
                <input
                  name="nextOfKinName"
                  value={form.nextOfKinName}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Next of kin phone">
                <input
                  name="nextOfKinPhone"
                  value={form.nextOfKinPhone}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <h4 className="staff-section-title">Employment</h4>
            <div className="staff-form-grid">
              <Field label="Staff type">
                <select
                  name="staffType"
                  value={form.staffType}
                  onChange={handleChange}
                >
                  {STAFF_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Position">
                <select
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                >
                  <option value="">Select position</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Department">
                <input
                  name="department"
                  list="staff-departments"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Science"
                />
              </Field>
              <Field label="Employment type">
                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date joined">
                <input
                  name="dateJoined"
                  type="date"
                  value={form.dateJoined}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Highest qualification">
                <select
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {QUALIFICATIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Certification / TRCN number">
                <input
                  name="certification"
                  value={form.certification}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Reports to">
                <input
                  name="reportingTo"
                  value={form.reportingTo}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Office">
                <input
                  name="office"
                  value={form.office}
                  onChange={handleChange}
                />
              </Field>
            </div>

            {isTeaching && (
              <>
                <h4 className="staff-section-title">Teaching assignment</h4>

                <div className="staff-field">
                  <label>Assigned classes</label>
                  <div className="staff-chip-row">
                    {CLASSES.map((className) => (
                      <button
                        type="button"
                        key={className}
                        className={`staff-chip toggle ${
                          form.assignedClasses.includes(className)
                            ? "active"
                            : ""
                        }`}
                        onClick={() => toggleClass(className)}
                      >
                        {className}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="staff-field spaced">
                  <label>Subjects taught (press Enter to add)</label>
                  <TagInput
                    values={form.subjectsTaught}
                    onChange={(subjectsTaught) =>
                      setForm((previous) => ({ ...previous, subjectsTaught }))
                    }
                    placeholder="e.g. Mathematics"
                  />
                </div>

                <div className="staff-form-grid spaced">
                  <Field label="Class teacher of">
                    <select
                      name="classTeacherOf"
                      value={form.classTeacherOf}
                      onChange={handleChange}
                      disabled={form.assignedClasses.length === 0}
                    >
                      <option value="">Not a class teacher</option>
                      {form.assignedClasses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Periods per week">
                    <input
                      name="periodsPerWeek"
                      type="number"
                      min="0"
                      value={form.periodsPerWeek}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              </>
            )}

            <h4 className="staff-section-title">About</h4>
            <Field label="Short profile / notes" full>
              <textarea
                name="about"
                rows="3"
                value={form.about}
                onChange={handleChange}
                placeholder="A short bio, achievements or notes"
              />
            </Field>

            <div className="staff-modal-footer">
              <button
                type="button"
                className="staff-secondary-button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="staff-primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : isAdd ? "Add staff" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      <datalist id="staff-departments">
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
      <datalist id="staff-subject-suggestions">
        {SUBJECT_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}

/* ---------- Page ---------- */

export default function AdminStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modal, setModal] = useState(null); // { mode, staff }

  async function loadStaff() {
    try {
      setError("");
      setStaffList(await getStaffList());
    } catch (err) {
      console.error("Error loading staff:", err);
      setError(err.message || "Unable to load staff.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  const stats = useMemo(() => {
    const status = (s) => String(s.status || "active").toLowerCase();
    const type = (s) => s.staffType || "Teaching";

    return {
      total: staffList.length,
      active: staffList.filter((s) => status(s) === "active").length,
      teaching: staffList.filter((s) => type(s) === "Teaching").length,
      nonTeaching: staffList.filter((s) => type(s) === "Non-teaching").length,
      away: staffList.filter((s) =>
        ["onleave", "resigned", "retired", "suspended"].includes(status(s)),
      ).length,
    };
  }, [staffList]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return staffList
      .filter(
        (s) =>
          typeFilter === "all" || (s.staffType || "Teaching") === typeFilter,
      )
      .filter(
        (s) =>
          !term ||
          (s.fullName || "").toLowerCase().includes(term) ||
          (s.staffId || "").toLowerCase().includes(term) ||
          (s.department || "").toLowerCase().includes(term),
      )
      .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
  }, [staffList, search, typeFilter]);

  return (
    <main className="staff-page">
      <div className="staff-container">
        <header className="staff-header">
          <div>
            <h1>Teachers &amp; Staff</h1>
            <p>
              {stats.active.toLocaleString()} active staff members ·{" "}
              {stats.teaching} teaching · {stats.nonTeaching} non-teaching.
            </p>
          </div>

          <div className="staff-header-actions">
            <button type="button" className="staff-secondary-button">
              Bulk import
            </button>
            <button
              type="button"
              className="staff-primary-button"
              onClick={() => setModal({ mode: "add", staff: null })}
            >
              Add staff
            </button>
          </div>
        </header>

        <section className="staff-stats">
          <div className="staff-stat-card">
            <div className="staff-stat-icon blue" />
            <strong>{stats.total.toLocaleString()}</strong>
            <span>Total staff</span>
          </div>
          <div className="staff-stat-card">
            <div className="staff-stat-icon green" />
            <strong>{stats.teaching.toLocaleString()}</strong>
            <span>Teaching staff</span>
          </div>
          <div className="staff-stat-card">
            <div className="staff-stat-icon purple" />
            <strong>{stats.away.toLocaleString()}</strong>
            <span>On leave or left</span>
          </div>
        </section>

        <section className="staff-card">
          <div className="staff-card-heading">
            <h2>All staff</h2>
            <input
              className="staff-search"
              type="search"
              placeholder="Search by name, ID or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="staff-filters">
            {[
              { value: "all", label: "All staff" },
              { value: "Teaching", label: "Teaching" },
              { value: "Non-teaching", label: "Non-teaching" },
            ].map((option) => (
              <button
                type="button"
                key={option.value}
                className={`staff-filter ${typeFilter === option.value ? "active" : ""}`}
                onClick={() => setTypeFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {error && <div className="staff-form-error">{error}</div>}

          <div className="staff-table">
            <div className="staff-table-row staff-table-head">
              <span>STAFF</span>
              <span>DEPARTMENT / POSITION</span>
              <span>CLASSES</span>
              <span>STATUS</span>
              <span />
            </div>

            {loading && <div className="staff-empty">Loading staff...</div>}

            {!loading && filtered.length === 0 && (
              <div className="staff-empty">No staff found.</div>
            )}

            {filtered.map((staff) => {
              const status = getDisplayStatus(staff);

              return (
                <div className="staff-table-row" key={staff.id}>
                  <div className="staff-person">
                    <div
                      className={`staff-avatar ${avatarColor(staff.fullName)}`}
                    >
                      {getInitials(staff.fullName)}
                    </div>
                    <div>
                      <strong>{displayName(staff)}</strong>
                      <span>{staff.staffId || staff.id}</span>
                    </div>
                  </div>

                  <div className="staff-stack">
                    <strong>{staff.department || "Not set"}</strong>
                    <span>{staff.position || "Position not set"}</span>
                  </div>

                  <span>{summarizeClasses(staff)}</span>

                  <span>
                    <em className={`staff-status ${status.tone}`}>
                      {status.label}
                    </em>
                  </span>

                  <div className="staff-row-actions">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "view", staff })}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", staff })}
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
        <StaffModal
          key={`${modal.mode}-${modal.staff?.id || "new"}`}
          mode={modal.mode}
          staff={modal.staff}
          onClose={() => setModal(null)}
          onSaved={loadStaff}
          onModeChange={(mode) => setModal((prev) => ({ ...prev, mode }))}
        />
      )}
    </main>
  );
}
