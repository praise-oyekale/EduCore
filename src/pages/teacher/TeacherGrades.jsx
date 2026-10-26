import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAssignedStudents,
  updateStudentSubjectScore,
} from "../../services/teacherService";
import {
  FaChartLine,
  FaTrophy,
  FaArrowDown,
  FaExclamationTriangle,
  FaFileDownload,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import "../teacher/teachergrades.css";

export function TeacherGrades() {
  const { profile } = useAuth();

  // Memoize arrays with profile as the direct dependency
  const subjectsTaught = useMemo(() => {
    return Array.isArray(profile?.subjectsTaught) ? profile.subjectsTaught : [];
  }, [profile]);

  const assignedClasses = useMemo(() => {
    return Array.isArray(profile?.assignedClasses)
      ? profile.assignedClasses
      : [];
  }, [profile]);
  // Active filters
  const [selectedSubject, setSelectedSubject] = useState(
    subjectsTaught[0] || "",
  );
  const [selectedClass, setSelectedClass] = useState("ALL");

  // State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editScores, setEditScores] = useState({}); // { [studentId]: score }
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync default filter if profile updates
  useEffect(() => {
    if (!selectedSubject && subjectsTaught.length > 0) {
      setSelectedSubject(subjectsTaught[0]);
    }
  }, [profile, subjectsTaught, selectedSubject]);

  // Load students for assigned classes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const roster = await getAssignedStudents(profile, {
          onlyTheirSubjects: false,
        });
        setStudents(roster);
      } catch (err) {
        console.error("Error loading gradebook data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (profile) loadData();
  }, [profile]);

  // Filter students by selected class
  const filteredStudents = students.filter((s) => {
    if (selectedClass === "ALL") return true;
    return String(s.grade || "").toUpperCase() === selectedClass.toUpperCase();
  });

  // Extract score for the selected subject
  const getSubjectScore = (student) => {
    if (!selectedSubject) return 0;
    const subjects = Array.isArray(student.subjects) ? student.subjects : [];
    const match = subjects.find(
      (sub) =>
        String(sub.name || "").toLowerCase() === selectedSubject.toLowerCase(),
    );
    return Number(match?.score) || 0;
  };

  // EduCore Letter Grade Scale
  const getLetterGrade = (score) => {
    if (!score || score <= 0) return { label: "N/A", colorClass: "badge-na" };
    if (score >= 70) return { label: "A", colorClass: "badge-a" };
    if (score >= 60) return { label: "B", colorClass: "badge-b" };
    if (score >= 50) return { label: "C", colorClass: "badge-c" };
    if (score >= 45) return { label: "D", colorClass: "badge-d" };
    if (score >= 40) return { label: "E", colorClass: "badge-e" };
    return { label: "F", colorClass: "badge-f" };
  };

  // Performance Stat Calculations (scores > 0)
  const scoredList = filteredStudents
    .map((s) => getSubjectScore(s))
    .filter((score) => score > 0);

  const classAvg = scoredList.length
    ? Math.round(scoredList.reduce((a, b) => a + b, 0) / scoredList.length)
    : 0;
  const highestScore = scoredList.length ? Math.max(...scoredList) : 0;
  const lowestScore = scoredList.length ? Math.min(...scoredList) : 0;
  const below70Count = scoredList.filter((score) => score < 70).length;

  // Grade Distribution Counts for Chart
  const distribution = {
    A: scoredList.filter((s) => s >= 70).length,
    B: scoredList.filter((s) => s >= 60 && s < 70).length,
    C: scoredList.filter((s) => s >= 50 && s < 60).length,
    D: scoredList.filter((s) => s >= 40 && s < 50).length,
    F: scoredList.filter((s) => s < 40).length,
  };
  const maxDistCount = Math.max(...Object.values(distribution), 1);

  // Toggle Editing State
  const handleStartEditing = () => {
    const initialMap = {};
    filteredStudents.forEach((s) => {
      initialMap[s.id] = getSubjectScore(s);
    });
    setEditScores(initialMap);
    setIsEditing(true);
  };

  // Handle Score Inputs
  const handleScoreChange = (studentId, value) => {
    const num = Math.min(100, Math.max(0, Number(value) || 0));
    setEditScores((prev) => ({ ...prev, [studentId]: num }));
  };

  // Save updated scores to Firestore
  const handleSaveGrades = async () => {
    if (!selectedSubject) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const promises = Object.entries(editScores).map(([studentId, score]) =>
        updateStudentSubjectScore(studentId, selectedSubject, score),
      );

      await Promise.all(promises);

      // Refresh student roster
      const updatedRoster = await getAssignedStudents(profile);
      setStudents(updatedRoster);

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Error saving grades. Please check score values and try again.");
    } finally {
      setSaving(false);
    }
  };

  // Export Grades as CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student ID,Student Name,Class,Subject,Score,Grade\n";

    filteredStudents.forEach((s) => {
      const score = getSubjectScore(s);
      const grade = getLetterGrade(score).label;
      csvContent += `"${s.studentId || ""}","${s.fullName || ""}","${
        s.grade || ""
      }","${selectedSubject}",${score},"${grade}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${selectedSubject || "Grades"}_${selectedClass}_Results.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grades-page-container">
      {/* Top Header */}
      <div className="grades-header">
        <div className="grades-header-title">
          <h2>Results & Grades</h2>
          <p>
            {selectedSubject || "All Subjects"} ·{" "}
            {selectedClass === "ALL" ? "All Classes" : `Class ${selectedClass}`}
          </p>
        </div>

        <div className="grades-header-controls">
          {/* Subject Pills */}
          {subjectsTaught.length > 0 && (
            <div className="subject-filter-pills">
              {subjectsTaught.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className={`subject-pill ${
                    selectedSubject === sub ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedSubject(sub);
                    setIsEditing(false);
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Export Button */}
          <button
            type="button"
            className="export-grades-btn"
            onClick={handleExportCSV}
            disabled={filteredStudents.length === 0}
          >
            <FaFileDownload />
            <span>Export grades</span>
          </button>
        </div>
      </div>

      {/* Class Selector Row */}
      {assignedClasses.length > 1 && (
        <div className="class-selector-bar">
          <span className="selector-label">Filter Class:</span>
          <button
            type="button"
            className={`class-filter-btn ${
              selectedClass === "ALL" ? "active" : ""
            }`}
            onClick={() => setSelectedClass("ALL")}
          >
            All Classes
          </button>
          {assignedClasses.map((cls) => (
            <button
              key={cls}
              type="button"
              className={`class-filter-btn ${
                selectedClass === cls ? "active" : ""
              }`}
              onClick={() => setSelectedClass(cls)}
            >
              {cls}
            </button>
          ))}
        </div>
      )}

      {/* Metric Stats Cards */}
      <div className="grades-stats-grid">
        <div className="grades-stat-card">
          <div className="stat-icon avg-icon">
            <FaChartLine />
          </div>
          <div className="stat-body">
            <h3>{classAvg}%</h3>
            <p>Class average</p>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="stat-icon high-icon">
            <FaTrophy />
          </div>
          <div className="stat-body">
            <h3>{highestScore}%</h3>
            <p>Highest score</p>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="stat-icon low-icon">
            <FaArrowDown />
          </div>
          <div className="stat-body">
            <h3>{lowestScore}%</h3>
            <p>Lowest score</p>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="stat-icon warning-icon">
            <FaExclamationTriangle />
          </div>
          <div className="stat-body">
            <h3>{below70Count}</h3>
            <p>Students below 70%</p>
          </div>
        </div>
      </div>

      {/* Main Content Split: Gradebook + Score Distribution */}
      <div className="grades-content-split">
        {/* Left Column: Gradebook */}
        <div className="gradebook-card">
          <div className="gradebook-card-header">
            <h3>Gradebook</h3>

            {isEditing ? (
              <div className="edit-actions-group">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSaveGrades}
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Saving..." : "Save Scores"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="edit-grades-btn"
                onClick={handleStartEditing}
                disabled={filteredStudents.length === 0}
              >
                <FaEdit /> {saveSuccess ? "Saved!" : "Edit grades"}
              </button>
            )}
          </div>

          {loading ? (
            <div className="gradebook-loading">Loading gradebook...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="gradebook-empty">
              No students found for this selection.
            </div>
          ) : (
            <div className="gradebook-table-wrapper">
              <table className="gradebook-table">
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>SCORE (%)</th>
                    <th>GRADE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const currentScore = getSubjectScore(student);
                    const gradeInfo = getLetterGrade(
                      isEditing
                        ? (editScores[student.id] ?? currentScore)
                        : currentScore,
                    );

                    return (
                      <tr key={student.id}>
                        <td className="student-cell">
                          <span className="student-name">
                            {student.fullName}
                          </span>
                          <span className="student-sub">
                            {student.studentId || "STU-00000"} · {student.grade}
                          </span>
                        </td>

                        <td className="score-cell">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="score-input"
                              value={editScores[student.id] ?? currentScore}
                              onChange={(e) =>
                                handleScoreChange(student.id, e.target.value)
                              }
                            />
                          ) : (
                            <span className="score-text">
                              {currentScore > 0
                                ? `${currentScore}%`
                                : "Not Scored"}
                            </span>
                          )}
                        </td>

                        <td className="grade-cell">
                          <span
                            className={`grade-pill ${gradeInfo.colorClass}`}
                          >
                            {gradeInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Score Distribution Chart */}
        <div className="distribution-card">
          <h3>Score distribution</h3>

          <div className="chart-container">
            <div className="bars-wrapper">
              {/* Grade F */}
              <div className="bar-column">
                <div className="bar-track">
                  <div
                    className="bar-fill fill-f"
                    style={{
                      height: `${(distribution.F / maxDistCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="bar-label">F (&lt;40)</span>
              </div>

              {/* Grade D */}
              <div className="bar-column">
                <div className="bar-track">
                  <div
                    className="bar-fill fill-d"
                    style={{
                      height: `${(distribution.D / maxDistCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="bar-label">D (40-49)</span>
              </div>

              {/* Grade C */}
              <div className="bar-column">
                <div className="bar-track">
                  <div
                    className="bar-fill fill-c"
                    style={{
                      height: `${(distribution.C / maxDistCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="bar-label">C (50-59)</span>
              </div>

              {/* Grade B */}
              <div className="bar-column">
                <div className="bar-track">
                  <div
                    className="bar-fill fill-b"
                    style={{
                      height: `${(distribution.B / maxDistCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="bar-label">B (60-69)</span>
              </div>

              {/* Grade A */}
              <div className="bar-column">
                <div className="bar-track">
                  <div
                    className="bar-fill fill-a"
                    style={{
                      height: `${(distribution.A / maxDistCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="bar-label">A (70+)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
