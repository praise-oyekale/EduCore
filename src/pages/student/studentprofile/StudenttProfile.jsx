import { FaEdit, FaKey, FaPumpMedical, FaUser } from "react-icons/fa";
import "../studentprofile/studentprofile.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getStudentProfile } from "../../../services/studentService";
// import Input from "../../../components/common/Input";
import EditProfileModel from "./EditProfileModal";
import { academicSummary } from "../../../data/academicSummary";
export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    async function loadStudent() {
      if (!user) return;

      const data = await getStudentProfile(user.uid);

      setStudent(data);
    }

    loadStudent();
  }, [user]);
  return (
    <div className="student-profilecontainer">
      <section className="profilegreeting-section">
        <div className="profile-welcome-message">
          <h1>My Profile</h1>
          <p>Manage your personal, academic, and contact information.</p>
        </div>
        <div className="profileaction-button">
          <button className="profile-changepass-btn">
            <FaKey />
            Change password{" "}
          </button>
          <button className="profile-edit-btn">
            <FaEdit /> Edit profile{" "}
          </button>
        </div>
      </section>
      <section className="profile-main-section">
        <div className="student-profile-section">
          <div className="stu-profile-details">
            <div className="stu-profile-picture">
              <h1>AR</h1>
            </div>
            <h5 style={{ fontSize: "20px", fontWeight: "700" }}>
              {student?.fullName}
            </h5>
            <p style={{ color: "#9db1c2", fontSize: "13px" }}>
              Student ID: {student?.id}
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
                SSS3 · Science
              </h5>{" "}
              <h5
                style={{
                  color: "#15803D",
                  background: "#EDFBF1",
                  padding: "6px",
                  borderRadius: "7px",
                }}
              >
                IN PROGRESS
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
            ></div>
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
                <h2 style={{ fontWeight: "700" }}>3.78</h2>
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
                <h2>96%</h2>
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
                <h2>6</h2>
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
                  {" "}
                  <FaUser />
                </span>
                <div>
                  <h5>Elena Reyes</h5>
                  <p style={{ color: "#9db1c2", fontSize: "13px" }}>
                    Mother · +1 (555) 019-2231
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
              ></div>

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
                  {" "}
                  <FaPumpMedical />
                </span>
                <div>
                  <h5>Known allergies</h5>
                  <p style={{ color: "#9db1c2", fontSize: "13px" }}>
                    Penicillin
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
                    outline: "none",
                    fontSize: "15px",
                  }}
                >
                  {student?.fullName}
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <h4>Date of birth</h4>
                <div
                  type="text"
                  placeholder={``}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #E7E9EE",
                    marginTop: "5px",
                    outline: "none",
                  }}
                >
                  {student?.dateOfBirth || "Not provided!"}
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
                    outline: "none",
                    fontSize: "15px",
                  }}
                >
                  {student?.email}
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <h4>Phone Number</h4>
                <div
                  type="text"
                  placeholder={``}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #E7E9EE",
                    marginTop: "5px",
                    outline: "none",
                  }}
                >
                  {student?.phoneNumber || "Not provided!"}
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
                    outline: "none",
                    fontSize: "15px",
                  }}
                >
                  {student?.department || "PENDING!"}
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <h4>Gender</h4>
                <div
                  type="text"
                  placeholder={``}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #E7E9EE",
                    marginTop: "5px",
                    outline: "none",
                  }}
                >
                  {student?.gender || "Not provided!"}
                </div>
              </div>
            </div>

            <div style={{ width: "100%", marginTop: "10px" }}>
              <h4>Home Address</h4>
              <div
                type="text"
                placeholder={``}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #E7E9EE",
                  marginTop: "5px",
                  outline: "none",
                }}
              >
                {student?.homeAddress || "Not provided!"}
              </div>
            </div>

            {isEditing && (
              <EditProfileModel
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

              {academicSummary.map((item) => (
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
