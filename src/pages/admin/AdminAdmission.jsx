import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  FaTimes,
  FaCheck,
  FaTrash,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaExclamationTriangle,
} from "react-icons/fa";

// Import your account creation & record creation services
import { createStudentAccount } from "../../services/secondaryAuth";
import {
  createStudent,
  generateStudentId,
} from "../../services/studentService";
import { createStaff, generateStaffId } from "../../services/teacherService";

import "../admin/adminstudent.css"; // Uses your existing admin styling structure

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

function formatDate(timestamp) {
  if (!timestamp) return "Recent";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Recent";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ---------- Review Modal Component ---------- */

function AdmissionModal({ application, onClose, onAdmitted }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const isTeacher = application.applicantType === "teacher";

  async function handleAdmit() {
    try {
      setProcessing(true);
      setError("");

      // 1. Create the Auth account using their intending password
      const createdAccount = await createStudentAccount({
        email: application.email,
        password: application.intendingPassword,
        fullName: application.fullName,
        role: isTeacher ? "teacher" : "student",
      });

      const uid = createdAccount?.uid || createdAccount?.user?.uid;
      if (!uid)
        throw new Error("Authentication signup failed to return a User ID.");

      if (isTeacher) {
        // 2a. Create Teacher Record
        const staffId = generateStaffId();
        const teacherData = {
          fullName: application.fullName,
          staffId: staffId,
          email: application.email,
          phoneNumber: application.phoneNumber || "",
          staffType: "Teaching",
          position: "Subject Teacher",
          subjectsTaught: application.subjectsTaught || [],
          assignedClasses: [],
          status: "active",
          createdAt: serverTimestamp(),
        };
        await createStaff(uid, teacherData);
      } else {
        // 2b. Create Student Record
        const studentId = generateStudentId();
        const studentData = {
          fullName: application.fullName,
          studentId: studentId,
          email: application.email,
          phoneNumber: application.phoneNumber || "",
          grade: application.grade || "JSS1",
          department: application.department || "",
          guardianName: application.guardianName || "",
          guardianPhone: application.guardianPhone || "",
          status: "enrolled",
          gpa: "0.00",
          subjects: [],
          createdAt: serverTimestamp(),
        };
        await createStudent(uid, studentData);
      }

      // 3. Update admission status in Firestore to "accepted"
      const appRef = doc(db, "admissions", application.id);
      await updateDoc(appRef, {
        status: "accepted",
        admittedAt: serverTimestamp(),
      });

      onAdmitted();
      onClose();
    } catch (err) {
      console.error("Error admitting applicant:", err);
      setError(err.message || "Failed to process admission. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    try {
      setProcessing(true);
      const appRef = doc(db, "admissions", application.id);
      await updateDoc(appRef, { status: "declined" });
      onAdmitted();
      onClose();
    } catch (err) {
      console.error("Error declining application:", err);
      setError("Failed to decline application.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="students-modal-backdrop" onMouseDown={onClose}>
      <div
        className="students-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="students-modal-header">
          <h2>Review Application ({isTeacher ? "Teacher" : "Student"})</h2>
          <button
            type="button"
            className="students-icon-button"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="students-modal-body">
          {error && <div className="students-form-error">{error}</div>}

          <div className="students-view-identity">
            <div className="students-avatar large blue">
              {getInitials(application.fullName)}
            </div>
            <div>
              <h3>{application.fullName}</h3>
              <p>{application.email}</p>
            </div>
            <span
              className={`students-status ${application.status === "accepted" ? "active" : "risk"}`}
            >
              {application.status || "under review"}
            </span>
          </div>

          <div className="students-view-grid">
            <div className="students-view-item">
              <span>Applicant Type</span>
              <strong>
                {isTeacher ? "Teacher Application" : "Student Application"}
              </strong>
            </div>
            <div className="students-view-item">
              <span>Phone Number</span>
              <strong>{application.phoneNumber || "Not provided"}</strong>
            </div>

            {!isTeacher ? (
              <>
                <div className="students-view-item">
                  <span>Grade / Class Applied For</span>
                  <strong>{application.grade || "Not specified"}</strong>
                </div>
                <div className="students-view-item">
                  <span>Department</span>
                  <strong>{application.department || "Not specified"}</strong>
                </div>
                <div className="students-view-item">
                  <span>Guardian Name</span>
                  <strong>{application.guardianName || "Not provided"}</strong>
                </div>
                <div className="students-view-item">
                  <span>Guardian Phone</span>
                  <strong>{application.guardianPhone || "Not provided"}</strong>
                </div>
              </>
            ) : (
              <div className="students-view-item full">
                <span>Subjects Taught</span>
                <strong>
                  {Array.isArray(application.subjectsTaught)
                    ? application.subjectsTaught.join(", ")
                    : "None specified"}
                </strong>
              </div>
            )}

            <div className="students-view-item">
              <span>Submitted On</span>
              <strong>{formatDate(application.createdAt)}</strong>
            </div>
          </div>

          <div className="students-modal-footer" style={{ marginTop: "30px" }}>
            <button
              type="button"
              className="students-secondary-button"
              onClick={handleReject}
              disabled={processing || application.status === "accepted"}
              style={{ color: "#ef4444", borderColor: "#fca5a5" }}
            >
              Decline
            </button>
            <button
              type="button"
              className="students-primary-button"
              onClick={handleAdmit}
              disabled={processing || application.status === "accepted"}
              style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
            >
              {processing
                ? "Processing..."
                : application.status === "accepted"
                  ? "Already Admitted"
                  : "Admit & Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Page Component ---------- */

export default function AdminAdmissions() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "pending", "accepted", "declined"
  const [selectedApp, setSelectedApp] = useState(null);

  async function loadApplications() {
    try {
      setError("");
      const snapshot = await getDocs(collection(db, "admissions"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(list);
    } catch (err) {
      console.error("Error loading admissions:", err);
      setError("Unable to load admissions applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(
        (a) =>
          !a.status || a.status === "pending" || a.status === "under review",
      ).length,
      accepted: applications.filter((a) => a.status === "accepted").length,
      declined: applications.filter((a) => a.status === "declined").length,
    };
  }, [applications]);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const status = (app.status || "pending").toLowerCase();
      if (filter === "all") return true;
      if (filter === "pending")
        return status === "pending" || status === "under review";
      if (filter === "accepted") return status === "accepted";
      if (filter === "declined") return status === "declined";
      return true;
    });
  }, [applications, filter]);

  return (
    <main className="students-page">
      <div className="students-container">
        <header className="students-header">
          <div>
            <h1>Admissions &amp; Portal Requests</h1>
            <p>
              Review incoming student and teacher portal registration
              applications.
            </p>
          </div>
        </header>

        {/* Top Metric Cards matching your UI */}
        <section className="students-stats">
          <div className="students-stat-card">
            <div className="students-stat-icon blue">
              <FaUserGraduate />
            </div>
            <strong>{stats.total.toLocaleString()}</strong>
            <span>Total applications</span>
          </div>
          <div className="students-stat-card">
            <div className="students-stat-icon green">
              <FaCheck />
            </div>
            <strong>{stats.pending.toLocaleString()}</strong>
            <span>Pending review</span>
          </div>
          <div className="students-stat-card">
            <div className="students-stat-icon purple">
              <FaChalkboardTeacher />
            </div>
            <strong>{stats.accepted.toLocaleString()}</strong>
            <span>Accepted</span>
          </div>
        </section>

        <section className="students-card">
          <div className="students-card-heading">
            <h2>Application Pipeline</h2>
          </div>

          <div className="students-filters">
            {[
              { value: "all", label: "All applications" },
              { value: "pending", label: "Pending review" },
              { value: "accepted", label: "Accepted" },
              { value: "declined", label: "Declined" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`students-filter ${filter === tab.value ? "active" : ""}`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && <div className="students-form-error">{error}</div>}

          <div className="students-table">
            <div className="students-table-row students-table-head">
              <span>APPLICANT</span>
              <span>ROLE &amp; DETAILS</span>
              <span>SUBMITTED</span>
              <span>STATUS</span>
              <span />
            </div>

            {loading && (
              <div className="students-empty">Loading applications...</div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="students-empty">
                No applications found in this filter.
              </div>
            )}

            {filtered.map((app) => {
              const status = app.status || "pending";
              const isTeacher = app.applicantType === "teacher";

              return (
                <div className="students-table-row" key={app.id}>
                  <div className="students-person">
                    <div
                      className={`students-avatar ${isTeacher ? "purple" : "blue"}`}
                    >
                      {getInitials(app.fullName)}
                    </div>
                    <div>
                      <strong>{app.fullName}</strong>
                      <span>{app.email}</span>
                    </div>
                  </div>

                  <span>
                    {isTeacher
                      ? "Teacher (Staff)"
                      : `Student · Class ${app.grade || "N/A"}`}
                  </span>

                  <span>{formatDate(app.createdAt)}</span>

                  <span>
                    <em
                      className={`students-status ${
                        status === "accepted"
                          ? "active"
                          : status === "declined"
                            ? "muted"
                            : "risk"
                      }`}
                    >
                      {status}
                    </em>
                  </span>

                  <div className="students-row-actions">
                    <button
                      type="button"
                      className="students-primary-button"
                      style={{ padding: "6px 14px", fontSize: "13px" }}
                      onClick={() => setSelectedApp(app)}
                    >
                      {status === "accepted" ? "View" : "Review"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {selectedApp && (
        <AdmissionModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onAdmitted={loadApplications}
        />
      )}
    </main>
  );
}
