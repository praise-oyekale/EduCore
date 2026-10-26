import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  createTeacherProfile,
  getAssignedStudents,
  getTeacherProfile,
  updateTeacherProfile,
} from "../../services/teacherService";

import {
  FaKey,
  FaPen,
  FaGraduationCap,
  FaCertificate,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import "../teacher/teacherprofile.css";

const emptyTeacher = {
  title: "",
  fullName: "",
  staffId: "",
  department: "",
  position: "",
  employmentType: "",
  email: "",
  dateOfBirth: "",
  phoneNumber: "",
  office: "",
  dateJoined: "",
  reportingTo: "",
  qualification: "",
  certification: "",
  classTeacherOf: "",
  subject: "",
  subjectsTaught: [],
  assignedClasses: [],
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
      .toUpperCase() || "T"
  );
}

function formatDate(dateString) {
  if (!dateString) return "Not provided";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function yearsSince(dateString) {
  if (!dateString) return 0;

  const start = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(start.getTime())) return 0;

  return Math.max(
    0,
    Math.floor((Date.now() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
  );
}

// Subjects may be a list (new) or a comma-separated string (old data)
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

/* ---------- Pieces ---------- */

function ProfileField({
  label,
  name,
  value,
  editing,
  onChange,
  type = "text",
  readOnly = false,
}) {
  return (
    <div className="teacher-profile-field">
      <label htmlFor={`teacher-${name}`}>{label}</label>

      {editing && !readOnly ? (
        <input
          id={`teacher-${name}`}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
        />
      ) : (
        <div className="teacher-profile-field-value">
          {type === "date" ? formatDate(value) : value || "Not provided"}
        </div>
      )}
    </div>
  );
}

function PersonalInformation({
  teacher,
  editing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <section className="teacher-profile-card teacher-personal-card">
      <div className="teacher-profile-card-heading">
        <h2>Personal information</h2>

        {editing ? (
          <div className="teacher-profile-edit-actions">
            <button
              type="button"
              className="teacher-profile-cancel-button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="teacher-profile-save-button"
              onClick={onSave}
              disabled={saving}
            >
              <FaSave />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="teacher-profile-edit-link"
            onClick={onEdit}
          >
            Edit
          </button>
        )}
      </div>

      <div className="teacher-profile-fields-grid">
        <ProfileField
          label="Full name"
          name="fullName"
          value={teacher.fullName}
          editing={editing}
          onChange={onChange}
        />

        <ProfileField
          label="Date of birth"
          name="dateOfBirth"
          value={teacher.dateOfBirth}
          type="date"
          editing={editing}
          onChange={onChange}
        />

        <ProfileField
          label="Email address"
          name="email"
          value={teacher.email}
          editing={editing}
          onChange={onChange}
          readOnly
        />

        <ProfileField
          label="Phone number"
          name="phoneNumber"
          value={teacher.phoneNumber}
          editing={editing}
          onChange={onChange}
        />

        <div className="teacher-profile-office-field">
          <ProfileField
            label="Office"
            name="office"
            value={teacher.office}
            editing={editing}
            onChange={onChange}
          />
        </div>
      </div>
    </section>
  );
}

function TeacherOverview({ teacher, studentCount }) {
  const classCount = toList(teacher.assignedClasses).length;
  const displayName =
    [teacher.title, teacher.fullName].filter(Boolean).join(" ") ||
    "Teacher name not set";

  return (
    <section className="teacher-profile-card teacher-overview-card">
      <div className="teacher-profile-identity">
        <div className="teacher-profile-avatar">
          {getInitials(teacher.fullName)}
        </div>

        <h2>{displayName}</h2>

        <p className="teacher-profile-staff-id">
          Staff ID: {teacher.staffId || "Not assigned"}
        </p>

        <div className="teacher-profile-tags">
          <span className="teacher-profile-department-tag">
            {teacher.department || teacher.subject || "Department not set"}
          </span>

          <span className="teacher-profile-employment-tag">
            {teacher.employmentType || "Employment type not set"}
          </span>
        </div>
      </div>

      <div className="teacher-profile-stats">
        <div className="teacher-profile-stat">
          <strong>{classCount}</strong>
          <span>Classes</span>
        </div>

        <div className="teacher-profile-stat">
          <strong>{studentCount}</strong>
          <span>Students</span>
        </div>

        <div className="teacher-profile-stat">
          <strong>{yearsSince(teacher.dateJoined)} yrs</strong>
          <span>At school</span>
        </div>
      </div>
    </section>
  );
}

function Qualifications({ teacher }) {
  const items = [
    {
      id: 1,
      title: "Qualification",
      detail: teacher.qualification || "No qualification has been added yet.",
      icon: <FaGraduationCap />,
      color: "purple",
    },
    {
      id: 2,
      title: "Teaching certification",
      detail:
        teacher.certification ||
        "Certification details have not been added yet.",
      icon: <FaCertificate />,
      color: "blue",
    },
  ];

  return (
    <section className="teacher-profile-card teacher-qualifications-card">
      <div className="teacher-profile-card-heading">
        <h2>Qualifications</h2>
      </div>

      <div className="teacher-qualifications-list">
        {items.map((item) => (
          <div className="teacher-qualification-item" key={item.id}>
            <div className={`teacher-qualification-icon ${item.color}`}>
              {item.icon}
            </div>

            <div className="teacher-qualification-details">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmploymentSummary({ teacher }) {
  const subjects = toList(teacher.subjectsTaught);
  const classes = toList(teacher.assignedClasses);

  const details = [
    {
      label: "Date joined",
      value: teacher.dateJoined ? formatDate(teacher.dateJoined) : "",
    },
    { label: "Department", value: teacher.department || teacher.subject },
    { label: "Position", value: teacher.position },
    { label: "Reporting to", value: teacher.reportingTo },
    { label: "Subjects taught", value: subjects.join(", ") || teacher.subject },
    { label: "Assigned classes", value: classes.join(", ") },
    { label: "Class teacher of", value: teacher.classTeacherOf },
  ];

  return (
    <section className="teacher-profile-card teacher-employment-card">
      <div className="teacher-profile-card-heading">
        <h2>Employment summary</h2>
      </div>

      <div className="teacher-employment-table">
        <div className="teacher-employment-table-header">
          <span>FIELD</span>
          <span>DETAIL</span>
        </div>

        {details.map((item) => (
          <div className="teacher-employment-row" key={item.label}>
            <span className="teacher-employment-label">{item.label}</span>

            <span className="teacher-employment-value">
              {item.value || "Not provided"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Page ---------- */

export default function TeacherProfile() {
  const { user } = useAuth();

  const [teacher, setTeacher] = useState(emptyTeacher);
  const [originalTeacher, setOriginalTeacher] = useState(emptyTeacher);
  const [studentCount, setStudentCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTeacherProfile() {
      if (!user?.uid) {
        setLoading(false);
        setError("Please sign in to view your teacher profile.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        let profile = await getTeacherProfile(user.uid);

        // Create a teacher document if one does not exist yet.
        if (!profile) {
          await createTeacherProfile(user);

          profile = await getTeacherProfile(user.uid);
        }

        if (!active) return;

        if (!profile) {
          throw new Error("Your teacher profile could not be loaded.");
        }

        const loadedTeacher = {
          ...emptyTeacher,
          ...profile,
          email: profile.email || user.email || "",
          fullName: profile.fullName || user.displayName || "",
          dateOfBirth: profile.dateOfBirth || "",
          phoneNumber: profile.phoneNumber || "",
          office: profile.office || "",
          department: profile.department || "",
          employmentType: profile.employmentType || "",
          subjectsTaught: toList(profile.subjectsTaught),
          assignedClasses: toList(profile.assignedClasses),
        };

        setTeacher(loadedTeacher);
        setOriginalTeacher(loadedTeacher);

        // Count the students in this teacher's assigned classes
        try {
          const students = await getAssignedStudents(loadedTeacher);
          if (active) setStudentCount(students.length);
        } catch (countError) {
          console.error("Could not count assigned students:", countError);
        }
      } catch (err) {
        console.error("Error loading teacher profile:", err);

        if (active) {
          setError(err.message || "Unable to load your teacher profile.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTeacherProfile();

    return () => {
      active = false;
    };
  }, [user?.uid]);

  function handleChange(event) {
    const { name, value } = event.target;

    setTeacher((previous) => ({
      ...previous,
      [name]: value,
    }));

    setNotice("");
    setError("");
  }

  function handleEdit() {
    setOriginalTeacher(teacher);
    setEditing(true);
    setNotice("");
    setError("");
  }

  function handleCancel() {
    setTeacher(originalTeacher);
    setEditing(false);
    setNotice("");
    setError("");
  }

  async function handleSave() {
    if (!user?.uid) {
      setError("You must be signed in to update your profile.");
      return;
    }

    if (!teacher.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      // Teachers can only edit their personal details.
      // Department, subjects and classes are assigned by the admin.
      const teacherData = {
        fullName: teacher.fullName.trim(),
        dateOfBirth: teacher.dateOfBirth,
        phoneNumber: teacher.phoneNumber.trim(),
        office: teacher.office.trim(),
      };

      await updateTeacherProfile(user.uid, teacherData);

      const updatedTeacher = {
        ...teacher,
        ...teacherData,
      };

      setTeacher(updatedTeacher);
      setOriginalTeacher(updatedTeacher);
      setEditing(false);

      setNotice("Your teacher profile has been updated successfully.");
    } catch (err) {
      console.error("Error updating teacher profile:", err);

      setError(
        err.message || "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="teacher-profile-page">
        <div className="teacher-profile-loading">
          Loading your teacher profile...
        </div>
      </main>
    );
  }

  if (error && !teacher.email && !teacher.fullName) {
    return (
      <main className="teacher-profile-page">
        <div className="teacher-profile-error">
          <h2>Unable to load profile</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="teacher-profile-page">
      <div className="teacher-profile-container">
        <header className="teacher-profile-page-header">
          <div className="teacher-profile-page-title">
            <h1>My Profile</h1>
            <p>Manage your personal, professional, and contact information.</p>
          </div>

          <div className="teacher-profile-header-actions">
            <button
              type="button"
              className="teacher-profile-secondary-button"
              onClick={() =>
                setNotice(
                  "Password changing should be connected to Firebase Authentication.",
                )
              }
            >
              <FaKey />
              Change password
            </button>

            <button
              type="button"
              className="teacher-profile-primary-button"
              onClick={editing ? handleSave : handleEdit}
              disabled={saving}
            >
              {editing ? <FaSave /> : <FaPen />}
              {saving ? "Saving..." : editing ? "Save profile" : "Edit profile"}
            </button>
          </div>
        </header>

        {error && (
          <div className="teacher-profile-notice teacher-profile-error-notice">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              <FaTimes />
            </button>
          </div>
        )}

        {notice && (
          <div className="teacher-profile-notice" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")}>
              <FaTimes />
            </button>
          </div>
        )}

        <div className="teacher-profile-layout">
          <div className="teacher-profile-left-column">
            <TeacherOverview teacher={teacher} studentCount={studentCount} />
            <Qualifications teacher={teacher} />
          </div>

          <div className="teacher-profile-right-column">
            <PersonalInformation
              teacher={teacher}
              editing={editing}
              onEdit={handleEdit}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
            />

            <EmploymentSummary teacher={teacher} />
          </div>
        </div>
      </div>
    </main>
  );
}
