import { useEffect, useState } from "react";
import { FaEdit, FaKey, FaPumpMedical, FaUser } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import {
  getStudentProfile,
  updateStudentProfile,
} from "../../../services/studentService";
import EditProfileModal from "./EditProfileModal";
import { academicSummary } from "../../../data/academicSummary";
import AvatarUpload from "../../../components/common/AvatarUpload";
import "../studentprofile/studentprofile.css";

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const { user, profile, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState("");

  const courseLength =
    profile?.subjects?.length || student?.subjects?.length || 0;
  const activeUid = user?.uid || user?.id;

  useEffect(() => {
    async function loadStudent() {
      if (!activeUid) return;
      try {
        const data = await getStudentProfile(activeUid);
        setStudent(data);
      } catch (err) {
        console.error("Error loading student profile:", err);
      }
    }

    loadStudent();
  }, [activeUid]);

  async function handlePhotoUploaded(photoURL) {
    // 1. Update local student state
    setStudent((prev) => ({ ...prev, photoURL }));

    // 2. Persist to Firestore
    if (activeUid) {
      await updateStudentProfile(activeUid, { photoURL }).catch(console.error);
    }

    // 3. Update Auth Context so Navbar syncs instantly
    if (typeof updateUser === "function") {
      updateUser({ photoURL });
    }

    setNotice("Profile picture updated successfully!");
  }

  return (
    <div className="student-profilecontainer">
      <section className="profilegreeting-section">
        <div className="profile-welcome-message">
          <h1>My Profile</h1>
          <p>Manage your personal, academic, and contact information.</p>
        </div>
        <div className="profileaction-button">
          <button
            className="profile-changepass-btn"
            onClick={() =>
              alert("Password changes are managed via Firebase Auth.")
            }
          >
            <FaKey /> Change password
          </button>
          <button
            className="profile-edit-btn"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit /> Edit profile
          </button>
        </div>
      </section>

      {notice && (
        <div className="profile-notice-banner">
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>×</button>
        </div>
      )}

      <section className="profile-main-section">
        <div className="student-profile-section">
          <div className="stu-profile-details">
            <AvatarUpload
              collectionName="student"
              uid={activeUid}
              name={student?.fullName || user?.displayName}
              photoURL={student?.photoURL || user?.photoURL}
              onUploaded={handlePhotoUploaded}
            />
            <h5 style={{ fontSize: "20px", fontWeight: "700" }}>
              {student?.fullName || user?.displayName}
            </h5>
            <p style={{ color: "#9db1c2", fontSize: "13px" }}>
              Student ID: {profile?.studentId || student?.studentId || "N/A"}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "15px",
                fontSize: "15px",
              }}
            >
              <h5
                style={{
                  color: "blue",
                  background: "#EEF3FF",
                  padding: "6px",
                  borderRadius: "7px",
                }}
              >
                {profile?.grade || student?.grade || "Grade"} ·{" "}
                {profile?.department || student?.department || "General"}
              </h5>
              <h5
                style={{
                  color: "#15803D",
                  background: "#EDFBF1",
                  padding: "6px",
                  borderRadius: "7px",
                }}
              >
                {profile?.status || student?.status || "Active"}
              </h5>
            </div>
            <div
              className="profile-divisor"
              style={{
                height: "1px",
                backgroundColor: "#E7E9EE",
                width: "100%",
                marginTop: "10px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h2 style={{ fontWeight: "700" }}>
                  {profile?.gpa || student?.gpa || "0.0"}
                </h2>
                <h5 style={{ color: "#9db1c2" }}>GPA</h5>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h2>{student?.attendanceRate || "96"}%</h2>
                <h5 style={{ color: "#9db1c2" }}>Attendance</h5>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h2>{courseLength}</h2>
                <h5 style={{ color: "#9db1c2" }}>Courses</h5>
              </div>
            </div>
          </div>

          <div className="stu-profile-emergency">
            <h3>Emergency contact</h3>
            <div style={{ padding: "10px", marginTop: "15px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    color: "blue",
                    background: "#f4f1fd",
                    padding: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "43px",
                    borderRadius: "7px",
                  }}
                >
                  <FaUser />
                </span>
                <div>
                  <h5>
                    {profile?.guardianName ||
                      student?.guardianName ||
                      "Not provided"}
                  </h5>
                  <p style={{ color: "#9db1c2", fontSize: "13px" }}>
                    {profile?.guardianPhone ||
                      student?.guardianPhone ||
                      "Not provided"}
                  </p>
                </div>
              </div>
              <div
                className="profile-divisor"
                style={{
                  height: "1px",
                  backgroundColor: "#E7E9EE",
                  width: "100%",
                  marginTop: "10px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <span
                  style={{
                    color: "blue",
                    background: "#f4f1fd",
                    padding: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "43px",
                    borderRadius: "7px",
                  }}
                >
                  <FaPumpMedical />
                </span>
                <div>
                  <h5>Known allergies</h5>
                  <p style={{ color: "#9db1c2", fontSize: "13px" }}>
                    {student?.allergies || "None reported"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="student-profile-info-section">
          <div className="student-personal-info">
            <div
              className="info-sec1"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: "17px" }}>Personal information</h3>
              <span
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <div style={{ width: "100%" }}>
                <h4>Full name</h4>
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #E7E9EE",
                    marginTop: "5px",
                    fontSize: "15px",
                  }}
                >
                  {student?.fullName || user?.displayName}
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <h4>Date of birth</h4>
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #E7E9EE",
                    marginTop: "5px",
                  }}
                >
                  {student?.dateOfBirth || "Not provided"}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <div style={{ width: "100%" }}>
                <h4>Email address</h4>
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #E7E9EE",
                    marginTop: "5px",
                    fontSize: "15px",
                  }}
                >
                  {student?.email || user?.email}
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <h4>Phone Number</h4>
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #E7E9EE",
                    marginTop: "5px",
                  }}
                >
                  {student?.phoneNumber || "Not provided"}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <div style={{ width: "100%" }}>
                <h4>Department</h4>
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #E7E9EE",
                    marginTop: "5px",
                    fontSize: "15px",
                  }}
                >
                  {student?.department || "General"}
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <h4>Gender</h4>
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #E7E9EE",
                    marginTop: "5px",
                  }}
                >
                  {student?.gender || "Not provided"}
                </div>
              </div>
            </div>

            <div style={{ width: "100%", marginTop: "10px" }}>
              <h4>Home Address</h4>
              <div
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #E7E9EE",
                  marginTop: "5px",
                }}
              >
                {student?.homeAddress || "Not provided"}
              </div>
            </div>

            {isEditing && (
              <EditProfileModal
                student={student}
                onClose={() => setIsEditing(false)}
              />
            )}
          </div>

          <div className="student-academicsummary">
            <div>
              <h2 style={{ fontSize: "17px" }}>Academic Summary</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  borderBottom: "1px solid #ddd",
                  padding: "12px 0",
                  fontWeight: "600",
                }}
              >
                <span style={{ color: "#B3A2B3" }}>Field</span>
                <span style={{ color: "#B3A2B3" }}>Detail</span>
              </div>

              {(academicSummary || []).map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    padding: "12px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span style={{ color: "#B3A2B3" }}>{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
