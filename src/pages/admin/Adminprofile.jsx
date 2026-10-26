import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  createAdminProfile,
  getAdminProfile,
  updateAdminProfile,
} from "../../services/adminService";

import {
  FaKey,
  FaPen,
  FaShieldAlt,
  FaUserLock,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import "./adminprofile.css";

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
      .toUpperCase() || "A"
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
    <div className="admin-profile-field">
      <label htmlFor={`admin-${name}`}>{label}</label>

      {editing && !readOnly ? (
        <input
          id={`admin-${name}`}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
        />
      ) : (
        <div className="admin-profile-field-value">
          {value || "Not provided"}
        </div>
      )}
    </div>
  );
}

function AdminOverview({ admin }) {
  return (
    <section className="admin-profile-card admin-overview-card">
      <div className="admin-profile-identity">
        <div className="admin-profile-avatar">
          {getInitials(admin.fullName)}
        </div>

        <h2>{admin.fullName || "Administrator name not set"}</h2>

        <p className="admin-profile-staff-id">
          Staff ID: {admin.staffId || "Not assigned"}
        </p>

        <div className="admin-profile-tags">
          <span className="admin-profile-title-tag">
            {admin.title || "Title not set"}
          </span>

          <span className="admin-profile-employment-tag">
            {admin.employmentType || "Full-time"}
          </span>
        </div>
      </div>

      <div className="admin-profile-stats">
        <div className="admin-profile-stat">
          <strong>{Number(admin.students || 0).toLocaleString()}</strong>
          <span>Students</span>
        </div>

        <div className="admin-profile-stat">
          <strong>{Number(admin.staff || 0).toLocaleString()}</strong>
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

function AccessPermissions({ admin }) {
  const items = [
    {
      id: 1,
      title: `${admin.roleName || "Super Admin"} role`,
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

function EmploymentSummary({ admin }) {
  const details = [
    { label: "Date joined", value: formatDate(admin.dateJoined) },
    { label: "Department", value: admin.department },
    { label: "Reports to", value: admin.reportingTo },
    { label: "Direct reports", value: admin.directReports },
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
            <span className="admin-employment-value">
              {item.value || "Not provided"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminProfile() {
  const { user } = useAuth();

  const [admin, setAdmin] = useState(emptyAdmin);
  const [originalAdmin, setOriginalAdmin] = useState(emptyAdmin);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAdminProfile() {
      if (!user?.uid) {
        setLoading(false);
        setError("Please sign in to view your administrator profile.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        let profile = await getAdminProfile(user.uid);

        // Create an admin document if one does not exist yet.
        if (!profile) {
          await createAdminProfile(user);
          profile = await getAdminProfile(user.uid);
        }

        if (!active) return;

        if (!profile) {
          throw new Error("Your administrator profile could not be loaded.");
        }

        const loadedAdmin = {
          ...emptyAdmin,
          ...profile,
          email: profile.email || user.email || "",
          fullName: profile.fullName || user.displayName || "",
          title: profile.title || "",
          phoneNumber: profile.phoneNumber || "",
          office: profile.office || "",
        };

        setAdmin(loadedAdmin);
        setOriginalAdmin(loadedAdmin);
      } catch (err) {
        console.error("Error loading admin profile:", err);

        if (active) {
          setError(err.message || "Unable to load your administrator profile.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAdminProfile();

    return () => {
      active = false;
    };
  }, [user?.uid]);

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
      // Save only the fields the administrator can edit.
      const adminData = {
        fullName: admin.fullName.trim(),
        title: admin.title.trim(),
        phoneNumber: admin.phoneNumber.trim(),
        office: admin.office.trim(),
      };

      await updateAdminProfile(user.uid, adminData);

      const updatedAdmin = { ...admin, ...adminData };

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
          <div className="admin-profile-notice admin-profile-error-notice">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              <FaTimes />
            </button>
          </div>
        )}

        {notice && (
          <div className="admin-profile-notice" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")}>
              <FaTimes />
            </button>
          </div>
        )}

        <div className="admin-profile-layout">
          <div className="admin-profile-left-column">
            <AdminOverview admin={admin} />
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
