import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  createTeacherProfile,
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
  FaUserTie,
} from "react-icons/fa";

import "../teacher/teacherprofile.css";

const emptyTeacher = {
  fullName: "",
  staffId: "",
  department: "",
  employmentType: "",
  email: "",
  dateOfBirth: "",
  phoneNumber: "",
  office: "",
  classes: 0,
  students: 0,
  yearsAtSchool: 0,
  dateJoined: "",
  reportingTo: "",
  subjectsTaught: "",
  subject: "",
  assignedClasses: [],
};

const qualifications = [
  {
    id: 1,
    title: "Qualifications",
    institution: "Add your qualifications when this feature is implemented.",
    icon: <FaGraduationCap />,
    color: "purple",
  },
  {
    id: 2,
    title: "Teaching certification",
    institution: "Certification details have not been added yet.",
    icon: <FaCertificate />,
    color: "blue",
  },
];

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

function TeacherOverview({ teacher }) {
  const assignedClasses = Array.isArray(teacher.assignedClasses)
    ? teacher.assignedClasses.length
    : Number(teacher.classes) || 0;

  return (
    <section className="teacher-profile-card teacher-overview-card">
      <div className="teacher-profile-identity">
        <div className="teacher-profile-avatar">
          {getInitials(teacher.fullName)}
        </div>

        <h2>{teacher.fullName || "Teacher name not set"}</h2>

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
          <strong>{assignedClasses}</strong>
          <span>Classes</span>
        </div>

        <div className="teacher-profile-stat">
          <strong>{Number(teacher.students) || 0}</strong>
          <span>Students</span>
        </div>

        <div className="teacher-profile-stat">
          <strong>{Number(teacher.yearsAtSchool) || 0} yrs</strong>
          <span>At school</span>
        </div>
      </div>
    </section>
  );
}

function Qualifications() {
  return (
    <section className="teacher-profile-card teacher-qualifications-card">
      <div className="teacher-profile-card-heading">
        <h2>Qualifications</h2>
      </div>

      <div className="teacher-qualifications-list">
        {qualifications.map((qualification) => (
          <div className="teacher-qualification-item" key={qualification.id}>
            <div
              className={`teacher-qualification-icon ${qualification.color}`}
            >
              {qualification.icon}
            </div>

            <div className="teacher-qualification-details">
              <h3>{qualification.title}</h3>
              <p>{qualification.institution}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmploymentSummary({ teacher }) {
  const details = [
    { label: "Date joined", value: teacher.dateJoined },
    {
      label: "Department",
      value: teacher.department || teacher.subject,
    },
    { label: "Reporting to", value: teacher.reportingTo },
    {
      label: "Subjects taught",
      value:
        teacher.subjectsTaught ||
        teacher.subject ||
        (Array.isArray(teacher.subjects) ? teacher.subjects.join(", ") : ""),
    },
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

export default function TeacherProfile() {
  const { user } = useAuth();

  const [teacher, setTeacher] = useState(emptyTeacher);
  const [originalTeacher, setOriginalTeacher] = useState(emptyTeacher);
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
          assignedClasses: Array.isArray(profile.assignedClasses)
            ? profile.assignedClasses
            : [],
        };

        setTeacher(loadedTeacher);
        setOriginalTeacher(loadedTeacher);
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
      // Save only the profile fields that the teacher can edit.
      const teacherData = {
        fullName: teacher.fullName.trim(),
        dateOfBirth: teacher.dateOfBirth,
        phoneNumber: teacher.phoneNumber.trim(),
        office: teacher.office.trim(),
        department: teacher.department.trim(),
        employmentType: teacher.employmentType.trim(),
        subjectsTaught: teacher.subjectsTaught.trim(),
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
            <TeacherOverview teacher={teacher} />
            <Qualifications />
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
