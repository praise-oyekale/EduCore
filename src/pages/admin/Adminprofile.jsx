import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  createAdminProfile,
  getAdminProfile,
  updateAdminProfile,
  getSchoolPeopleStats,
} from "../../services/adminService";

import AvatarUpload from "../../components/common/AvatarUpload";

import {
  FaKey,
  FaPen,
  FaShieldAlt,
  FaUserLock,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import "./adminprofile.css";

/* =========================================================
   DEFAULT ADMIN PROFILE
========================================================= */

const emptyAdmin = {
  fullName: "",
  title: "",
  staffId: "",
  email: "",
  phoneNumber: "",
  office: "",
  employmentType: "",
  students: 0,
  staff: 0,
  yearsAtSchool: 0,
  dateJoined: "",
  department: "",
  reportingTo: "",
  directReports: "",
  roleName: "",
  twoFactorEnabled: false,
  photoURL: "",
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeDate(value) {
  if (!value) return "";

  let date;

  if (typeof value?.toDate === "function") {
    date = value.toDate();
  } else if (typeof value?.seconds === "number") {
    date = new Date(value.seconds * 1000);
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string") {
    return value;
  } else {
    return "";
  }

  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function displayValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Enabled" : "Not enabled";
  }

  return fallback;
}

function formatDate(value) {
  const normalized = normalizeDate(value);

  if (!normalized) return "Not provided";

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const date = new Date(normalized);

  return Number.isNaN(date.getTime())
    ? "Not provided"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

/* =========================================================
   PROFILE FIELD
========================================================= */

function ProfileField({
  label,
  name,
  value,
  editing,
  onChange,
  type = "text",
  readOnly = false,
}) {
  const safeValue =
    value === null || value === undefined
      ? ""
      : typeof value === "string" || typeof value === "number"
        ? String(value)
        : "";

  return (
    <div className="admin-profile-field">
      <label htmlFor={`admin-${name}`}>{label}</label>

      {editing && !readOnly ? (
        <input
          id={`admin-${name}`}
          name={name}
          type={type}
          value={safeValue}
          onChange={onChange}
        />
      ) : (
        <div className="admin-profile-field-value">{displayValue(value)}</div>
      )}
    </div>
  );
}

/* =========================================================
   ADMIN OVERVIEW
========================================================= */

function AdminOverview({ admin, uid, onAvatarUploaded }) {
  return (
    <section className="admin-profile-card admin-overview-card">
      <div className="admin-profile-identity">
        <div className="admin-profile-avatar-upload">
          <AvatarUpload
            collectionName="admin"
            uid={uid}
            name={admin.fullName || "Admin"}
            photoURL={admin.photoURL || ""}
            size={92}
            onUploaded={onAvatarUploaded}
          />
        </div>

        <h2>{admin.fullName || "Administrator"}</h2>

        <p className="admin-profile-staff-id">
          {displayValue(admin.staffId, "Administrator account")}
        </p>

        <div className="admin-profile-tags">
          <span className="admin-profile-title-tag">
            {displayValue(admin.title, "Administrator")}
          </span>

          <span className="admin-profile-employment-tag">
            {displayValue(admin.employmentType, "Active")}
          </span>
        </div>
      </div>

      <div className="admin-profile-stats">
        <div className="admin-profile-stat">
          <strong>{(Number(admin.students) || 0).toLocaleString()}</strong>
          <span>Students</span>
        </div>

        <div className="admin-profile-stat">
          <strong>{(Number(admin.staff) || 0).toLocaleString()}</strong>
          <span>Staff</span>
        </div>

        <div className="admin-profile-stat">
          <strong>{Number(admin.yearsAtSchool) || 0} yrs</strong>
          <span>At school</span>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ACCESS PERMISSIONS
========================================================= */

function AccessPermissions({ admin }) {
  const items = [
    {
      id: 1,
      title: `${displayValue(admin.roleName, "Super Admin")} role`,
      description: "Full system access",
      icon: <FaShieldAlt />,
      color: "blue",
    },
    {
      id: 2,
      title: "Two-factor authentication",
      description: admin.twoFactorEnabled ? "Enabled" : "Not enabled",
      icon: <FaUserLock />,
      color: "purple",
    },
  ];

  return (
    <section className="admin-profile-card admin-access-card">
      <div className="admin-profile-card-heading">
        <h2>Access &amp; permissions</h2>
      </div>

      <div className="admin-access-list">
        {items.map((item) => (
          <div className="admin-access-item" key={item.id}>
            <div className={`admin-access-icon ${item.color}`}>{item.icon}</div>

            <div className="admin-access-details">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   PERSONAL INFORMATION
========================================================= */

function PersonalInformation({
  admin,
  editing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <section className="admin-profile-card admin-personal-card">
      <div className="admin-profile-card-heading">
        <h2>Personal information</h2>

        {editing ? (
          <div className="admin-profile-edit-actions">
            <button
              type="button"
              className="admin-profile-cancel-button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="admin-profile-save-button"
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
            className="admin-profile-edit-link"
            onClick={onEdit}
          >
            Edit
          </button>
        )}
      </div>

      <div className="admin-profile-fields-grid">
        <ProfileField
          label="Full name"
          name="fullName"
          value={admin.fullName}
          editing={editing}
          onChange={onChange}
        />

        <ProfileField
          label="Title"
          name="title"
          value={admin.title}
          editing={editing}
          onChange={onChange}
        />

        <ProfileField
          label="Email address"
          name="email"
          value={admin.email}
          editing={editing}
          onChange={onChange}
          readOnly
        />

        <ProfileField
          label="Phone number"
          name="phoneNumber"
          value={admin.phoneNumber}
          editing={editing}
          onChange={onChange}
        />

        <div className="admin-profile-office-field">
          <ProfileField
            label="Office"
            name="office"
            value={admin.office}
            editing={editing}
            onChange={onChange}
          />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   EMPLOYMENT SUMMARY
========================================================= */

function EmploymentSummary({ admin }) {
  const details = [
    {
      label: "Date joined",
      value: formatDate(admin.dateJoined),
    },
    {
      label: "Department",
      value: displayValue(admin.department),
    },
    {
      label: "Reports to",
      value: displayValue(admin.reportingTo),
    },
    {
      label: "Direct reports",
      value: displayValue(admin.directReports),
    },
  ];

  return (
    <section className="admin-profile-card admin-employment-card">
      <div className="admin-profile-card-heading">
        <h2>Employment summary</h2>
      </div>

      <div className="admin-employment-table">
        <div className="admin-employment-table-header">
          <span>FIELD</span>
          <span>DETAIL</span>
        </div>

        {details.map((item) => (
          <div className="admin-employment-row" key={item.label}>
            <span className="admin-employment-label">{item.label}</span>

            <span className="admin-employment-value">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   MAIN ADMIN PROFILE
========================================================= */

export default function AdminProfile() {
  const { user } = useAuth();

  const [admin, setAdmin] = useState(emptyAdmin);
  const [originalAdmin, setOriginalAdmin] = useState(emptyAdmin);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  /* ---------------------------------------------------------
     LOAD ADMIN PROFILE AND SCHOOL-WIDE COUNTS
  --------------------------------------------------------- */

  useEffect(() => {
    let active = true;

    async function loadAdminProfile() {
      if (!user?.uid) {
        setAdmin(emptyAdmin);
        setOriginalAdmin(emptyAdmin);
        setLoading(false);
        setError("Please sign in to view your administrator profile.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Load the signed-in administrator's own profile.
        let profile = await getAdminProfile(user.uid);

        if (!profile) {
          await createAdminProfile(user);
          profile = await getAdminProfile(user.uid);
        }

        if (!profile) {
          throw new Error("Your administrator profile could not be loaded.");
        }

        // Load actual school-wide counts from Firestore.
        const peopleStats = await getSchoolPeopleStats();

        if (!active) return;

        const loadedAdmin = {
          ...emptyAdmin,
          ...profile,

          email: profile.email || user.email || "",
          fullName: profile.fullName || user.displayName || "",
          title: profile.title || "",
          phoneNumber: profile.phoneNumber || "",
          office: profile.office || "",

          dateJoined: normalizeDate(profile.dateJoined),

          photoURL: profile.photoURL || user.photoURL || "",

          twoFactorEnabled: Boolean(profile.twoFactorEnabled),

          // These values come from the actual collections,
          // not the admin profile document.
          students: peopleStats.totalStudents,
          staff: peopleStats.totalStaff,
        };

        setAdmin(loadedAdmin);
        setOriginalAdmin(loadedAdmin);
      } catch (err) {
        console.error("Error loading admin profile or school counts:", err);

        if (active) {
          setError(
            err.message || "Unable to load your profile and school statistics.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAdminProfile();

    return () => {
      active = false;
    };
  }, [user?.uid, user?.email, user?.displayName, user?.photoURL]);

  /* ---------------------------------------------------------
     AVATAR UPLOAD CALLBACK
  --------------------------------------------------------- */

  function handleAvatarUploaded(photoURL) {
    setAdmin((previous) => ({
      ...previous,
      photoURL,
    }));

    setOriginalAdmin((previous) => ({
      ...previous,
      photoURL,
    }));

    setNotice("Your profile picture has been updated successfully.");
    setError("");
  }

  /* ---------------------------------------------------------
     EDIT PROFILE
  --------------------------------------------------------- */

  function handleChange(event) {
    const { name, value } = event.target;

    setAdmin((previous) => ({
      ...previous,
      [name]: value,
    }));

    setNotice("");
    setError("");
  }

  function handleEdit() {
    setOriginalAdmin(admin);
    setEditing(true);
    setNotice("");
    setError("");
  }

  function handleCancel() {
    setAdmin(originalAdmin);
    setEditing(false);
    setNotice("");
    setError("");
  }

  /* ---------------------------------------------------------
     SAVE PROFILE
  --------------------------------------------------------- */

  async function handleSave() {
    if (!user?.uid) {
      setError("You must be signed in to update your profile.");
      return;
    }

    if (!admin.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const adminData = {
        fullName: admin.fullName.trim(),
        title: admin.title.trim(),
        phoneNumber: admin.phoneNumber.trim(),
        office: admin.office.trim(),
      };

      await updateAdminProfile(user.uid, adminData);

      const updatedAdmin = {
        ...admin,
        ...adminData,
      };

      setAdmin(updatedAdmin);
      setOriginalAdmin(updatedAdmin);
      setEditing(false);

      setNotice("Your administrator profile has been updated successfully.");
    } catch (err) {
      console.error("Error updating admin profile:", err);

      setError(
        err.message || "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------
     CHANGE PASSWORD NOTICE
  --------------------------------------------------------- */

  function handlePasswordClick() {
    setNotice(
      "Password changing is not connected yet. Use Firebase Authentication to implement a secure password update.",
    );
    setError("");
  }

  /* ---------------------------------------------------------
     LOADING AND ERROR STATES
  --------------------------------------------------------- */

  if (loading) {
    return (
      <main className="admin-profile-page">
        <div className="admin-profile-loading">
          Loading your administrator profile...
        </div>
      </main>
    );
  }

  if (error && !admin.email && !admin.fullName) {
    return (
      <main className="admin-profile-page">
        <div className="admin-profile-error">
          <h2>Unable to load profile</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------
     RENDER PROFILE
  --------------------------------------------------------- */

  return (
    <main className="admin-profile-page">
      <div className="admin-profile-container">
        <header className="admin-profile-page-header">
          <div className="admin-profile-page-title">
            <h1>My Profile</h1>
            <p>Manage your administrator account and permissions.</p>
          </div>

          <div className="admin-profile-header-actions">
            <button
              type="button"
              className="admin-profile-secondary-button"
              onClick={handlePasswordClick}
            >
              <FaKey />
              Change password
            </button>

            <button
              type="button"
              className="admin-profile-primary-button"
              onClick={editing ? handleSave : handleEdit}
              disabled={saving}
            >
              {editing ? <FaSave /> : <FaPen />}
              {saving ? "Saving..." : editing ? "Save profile" : "Edit profile"}
            </button>
          </div>
        </header>

        {error && (
          <div
            className="admin-profile-notice admin-profile-error-notice"
            role="alert"
          >
            <span>{error}</span>

            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {notice && (
          <div className="admin-profile-notice" role="status">
            <span>{notice}</span>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="admin-profile-layout">
          <div className="admin-profile-left-column">
            <AdminOverview
              admin={admin}
              uid={user.uid}
              onAvatarUploaded={handleAvatarUploaded}
            />

            <AccessPermissions admin={admin} />
          </div>

          <div className="admin-profile-right-column">
            <PersonalInformation
              admin={admin}
              editing={editing}
              onEdit={handleEdit}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
            />

            <EmploymentSummary admin={admin} />
          </div>
        </div>
      </div>
    </main>
  );
}
