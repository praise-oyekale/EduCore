import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaFolder,
  FaBook,
  FaFlask,
  FaCalculator,
  FaGlobe,
  FaAtom,
  FaGraduationCap,
} from "react-icons/fa";
import "../teacher/teachersubject.css";

export function TeacherSubjects() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();


  const subjectsTaught = Array.isArray(profile?.subjectsTaught)
    ? profile.subjectsTaught
    : [];
  const assignedClasses = Array.isArray(profile?.assignedClasses)
    ? profile.assignedClasses
    : [];

 
  const getSubjectCode = (subjectName) => {
    if (!subjectName) return "SUBJ-101";
    const clean = subjectName.trim().toUpperCase().replace(/\s+/g, "");
    const prefix = clean.substring(0, 4);
    return `${prefix}-101`;
  };


  const getSubjectIcon = (subjectName) => {
    const lower = subjectName?.toLowerCase() || "";
    if (lower.includes("math") || lower.includes("calc"))
      return <FaCalculator />;
    if (lower.includes("chem") || lower.includes("lab")) return <FaFlask />;
    if (lower.includes("phys") || lower.includes("sci")) return <FaAtom />;
    if (lower.includes("geo") || lower.includes("soc")) return <FaGlobe />;
    return <FaBook />;
  };

  if (loading) {
    return (
      <div className="subjects-loading-state">
        <p>Loading your assigned subjects...</p>
      </div>
    );
  }

  return (
    <div className="subjects-page-container">
      {/* Top Header Section */}
      <div className="subjects-header">
        <div className="subjects-header-title">
          <h2>Subjects</h2>
          <p>Subjects you are certified and scheduled to teach.</p>
        </div>

      
        <div className="subjects-active-badge">
          <FaGraduationCap className="badge-icon" />
          <span>
            {subjectsTaught.length}{" "}
            {subjectsTaught.length === 1 ? "Active Subject" : "Active Subjects"}
          </span>
        </div>
      </div>

    
      {subjectsTaught.length === 0 ? (
        <div className="subjects-empty-card">
          <FaBook className="empty-state-icon" />
          <h3>No Subjects Assigned</h3>
          <p>
            You do not have any subjects linked to your teaching profile yet.
            Please contact the administrator to assign subjects to your account.
          </p>
        </div>
      ) : (
      
        <div className="subjects-grid">
          {subjectsTaught.map((subjectName, index) => {
            const subjectCode = getSubjectCode(subjectName);
            const classesCount = assignedClasses.length || 1;

            return (
              <div className="subject-card" key={subjectName || index}>
               
                <div className="subject-card-top">
                  <div
                    className={`subject-icon-wrapper icon-theme-${index % 4}`}
                  >
                    {getSubjectIcon(subjectName)}
                  </div>
                  <span className="subject-code">{subjectCode}</span>
                </div>

              
                <div className="subject-card-body">
                  <h3>{subjectName}</h3>
                  <p className="subject-meta-text">
                    {classesCount} {classesCount === 1 ? "class" : "classes"} ·{" "}
                    {profile?.department || "General"}
                  </p>
                </div>

                <div className="subject-card-divider" />

                {/* Card Footer Action: Only Resources */}
                <div className="subject-card-footer">
                  <button
                    type="button"
                    className="subject-resource-button disabled" 
                    disabled
                    title="Resources feature coming in a future update"
                    // onClick={() =>
                    //   navigate("/teacher/teachingResources", {
                    //     state: { selectedSubject: subjectName },
                    //   })
                    // }
                  >
                    <FaFolder className="btn-folder-icon" />
                    <span>Resources (Coming Soon)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
