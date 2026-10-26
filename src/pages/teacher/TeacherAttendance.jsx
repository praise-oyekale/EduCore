import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAssignedStudents } from "../../services/teacherService";
import {
  getClassAttendanceForDate,
  saveClassAttendance,
  getClassAverageAttendance,
} from "../../services/teacherService";
import {
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaChartBar,
  FaCheck,
} from "react-icons/fa";
import "../teacher/teacherattendance.css";

export function TeacherAttendance() {
  const { profile } = useAuth();

  const assignedClasses = Array.isArray(profile?.assignedClasses)
    ? profile.assignedClasses
    : [];

  const [selectedClass, setSelectedClass] = useState(assignedClasses[0] || "");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { [studentId]: "present" | "late" | "absent" }
  const [classAvg, setClassAvg] = useState(100);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Today's date YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Load students and saved attendance whenever selected class changes
  useEffect(() => {
    if (!selectedClass && assignedClasses.length > 0) {
      setSelectedClass(assignedClasses[0]);
      return;
    }

    async function loadData() {
      if (!selectedClass) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch class roster
        const classStudents = await getAssignedStudents(
          { assignedClasses: [selectedClass] },
          { onlyTheirSubjects: false },
        );
        setStudents(classStudents);

        // Fetch today's saved attendance map
        const savedMap = await getClassAttendanceForDate(selectedClass, today);

        // Populate state; default unsaved students to "present"
        const initialMap = {};
        classStudents.forEach((student) => {
          initialMap[student.id] = savedMap[student.id] || "present";
        });
        setAttendance(initialMap);

        // Calculate term average
        const avg = await getClassAverageAttendance(selectedClass);
        setClassAvg(avg);
      } catch (err) {
        console.error("Error loading attendance data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedClass, profile]);

  // Handle single status change
  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Mark all students present
  const handleMarkAllPresent = () => {
    const allPresent = {};
    students.forEach((s) => {
      allPresent[s.id] = "present";
    });
    setAttendance(allPresent);
  };

  // Save to Firebase Firestore
  const handleSaveAttendance = async () => {
    if (!selectedClass || students.length === 0) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const records = students.map((s) => ({
        studentId: s.id,
        status: attendance[s.id] || "present",
        gender: s.gender || "male",
      }));

      await saveClassAttendance(selectedClass, today, records);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const counts = {
    present: Object.values(attendance).filter((s) => s === "present").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
  };

  // Helper for Student Initials Avatar
  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="attendance-page-container">
      {/* Header Section */}
      <div className="attendance-header">
        <div className="attendance-header-info">
          <h2>Attendance</h2>
          <p>
            {selectedClass ? `${selectedClass} · ` : ""}
            {formattedDate}
          </p>
        </div>

        {/* Top Controls: Class Switcher Filter & Save Button */}
        <div className="attendance-header-actions">
          {assignedClasses.length > 0 && (
            <div className="class-filter-pills">
              {assignedClasses.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  className={`class-pill ${selectedClass === cls ? "active" : ""}`}
                  onClick={() => setSelectedClass(cls)}
                >
                  {cls}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="save-attendance-btn"
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
          >
            <FaCheck />
            <span>
              {saving
                ? "Saving..."
                : saveSuccess
                  ? "Saved!"
                  : "Save attendance"}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="attendance-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg present-bg">
            <FaUserCheck />
          </div>
          <div className="stat-info">
            <h3>{counts.present}</h3>
            <p>Present today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg late-bg">
            <FaUserClock />
          </div>
          <div className="stat-info">
            <h3>{counts.late}</h3>
            <p>Late today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg absent-bg">
            <FaUserTimes />
          </div>
          <div className="stat-info">
            <h3>{counts.absent}</h3>
            <p>Absent today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg avg-bg">
            <FaChartBar />
          </div>
          <div className="stat-info">
            <h3>{classAvg}%</h3>
            <p>Class avg. this term</p>
          </div>
        </div>
      </div>

      {/* Main Attendance Sheet Card */}
      <div className="attendance-sheet-card">
        <div className="sheet-card-header">
          <h3>
            Mark attendance — <span>{students.length} students</span>
          </h3>
          <button
            type="button"
            className="mark-all-btn"
            onClick={handleMarkAllPresent}
            disabled={students.length === 0}
          >
            Mark all present
          </button>
        </div>

        {loading ? (
          <div className="sheet-loading-state">Loading student roster...</div>
        ) : students.length === 0 ? (
          <div className="sheet-empty-state">
            No students found in {selectedClass || "this class"}.
          </div>
        ) : (
          <div className="attendance-table">
            <div className="table-header-row">
              <span className="col-student">STUDENT</span>
              <span className="col-status">STATUS</span>
            </div>

            <div className="table-body">
              {students.map((student) => {
                const currentStatus = attendance[student.id] || "present";
                const initials = getInitials(student.fullName);

                return (
                  <div className="table-row" key={student.id}>
                    {/* Student Info */}
                    <div className="student-info-col">
                      <div className="student-avatar">{initials}</div>
                      <div className="student-details">
                        <span className="student-name">{student.fullName}</span>
                        <span className="student-code">
                          {student.studentId || "STU-00000"}
                        </span>
                      </div>
                    </div>

                    {/* Status Button Toggle Group */}
                    <div className="status-toggle-col">
                      <button
                        type="button"
                        className={`status-btn present ${
                          currentStatus === "present" ? "active" : ""
                        }`}
                        onClick={() =>
                          handleStatusChange(student.id, "present")
                        }
                      >
                        Present
                      </button>

                      <button
                        type="button"
                        className={`status-btn late ${
                          currentStatus === "late" ? "active" : ""
                        }`}
                        onClick={() => handleStatusChange(student.id, "late")}
                      >
                        Late
                      </button>

                      <button
                        type="button"
                        className={`status-btn absent ${
                          currentStatus === "absent" ? "active" : ""
                        }`}
                        onClick={() => handleStatusChange(student.id, "absent")}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
