import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

import {
  FaCalculator,
  FaLanguage,
  FaFlask,
  FaAtom,
  FaDna,
  FaLandmark,
  FaBook,
  FaCalendarCheck,
  FaChartLine,
  FaClipboardList,
  FaCreditCard,
  FaDownload,
} from "react-icons/fa";

import { useAuth } from "../../../context/AuthContext";
import "../studentdashboard/studentdashboard.css";
import StudentStatCard from "../../../components/student/StudentStatCard";
import StudentPerformanceChart, {
  AttendanceChart,
} from "../../../components/common/StudentPerformanceChart";

function getSubjectIcon(name = "") {
  const text = name.toLowerCase();

  if (text.includes("math")) return <FaCalculator />;
  if (text.includes("english") || text.includes("language"))
    return <FaLanguage />;
  if (text.includes("chem")) return <FaFlask />;
  if (text.includes("phys")) return <FaAtom />;
  if (text.includes("bio")) return <FaDna />;
  if (
    text.includes("civic") ||
    text.includes("history") ||
    text.includes("government")
  ) {
    return <FaLandmark />;
  }
  return <FaBook />;
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();

  const firstName = user?.displayName?.split(" ")[0] || "Student";
  const today = new Date();
  const subjects = Array.isArray(profile?.subjects) ? profile.subjects : [];

  const [attendanceRate, setAttendanceRate] = useState("100%");

  useEffect(() => {
    if (!user?.uid) return;

    async function fetchAttendance() {
      try {
        const q = query(
          collection(db, "attendance"),
          where("studentId", "==", user.uid)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const records = snapshot.docs.map((d) => d.data());
          const total = records.length;
          const presentOrLate = records.filter((r) =>
            ["present", "late"].includes(String(r.status || "").toLowerCase())
          ).length;

          const rate = Math.round((presentOrLate / total) * 100);
          setAttendanceRate(`${rate}%`);
        } else {
          setAttendanceRate("100%");
        }
      } catch (err) {
        console.error("Error fetching student attendance:", err);
      }
    }

    fetchAttendance();
  }, [user?.uid]);

  const scoredSubjects = subjects.filter((s) => Number(s?.score) > 0);

  // Dynamic live weighted GPA calculation
  const calculateGPA = () => {
    if (scoredSubjects.length === 0) return profile?.gpa || "N/A";

    let totalPointsTimesCredits = 0;
    let totalCredits = 0;

    scoredSubjects.forEach((sub) => {
      const score = Number(sub.score) || 0;
      const lowerName = String(sub.name || "").toLowerCase();

      const credits =
        lowerName.includes("math") ||
        lowerName.includes("english") ||
        lowerName.includes("physics") ||
        lowerName.includes("chem")
          ? 4
          : 3;

      let points = 0.0;
      if (score >= 70) points = 4.0;
      else if (score >= 60) points = 3.0;
      else if (score >= 50) points = 2.5;
      else if (score >= 45) points = 2.0;
      else if (score >= 40) points = 1.5;

      totalPointsTimesCredits += points * credits;
      totalCredits += credits;
    });

    return totalCredits > 0
      ? (totalPointsTimesCredits / totalCredits).toFixed(2)
      : profile?.gpa || "0.00";
  };

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="studashboardcontents-container">
      <section className="greeting-section">
        <div className="dashboard-welcome-message">
          <h1>Welcome back, {firstName}👋</h1>
          <p>
            {formattedDate} · Here's what's happening in your academics today.
          </p>
        </div>
        <div className="action-button">
          <button className="dashoboard-welcome-download">
            <FaDownload /> Download Report
          </button>
          <button className="dashoboard-welcome-payfees">
            <FaCreditCard /> Pay fees
          </button>
        </div>
      </section>

      <section className="statcard-section">
        <StudentStatCard
          icon={<FaChartLine />}
          digit={calculateGPA()}
          text="Overall GPA"
        />
        <StudentStatCard
          icon={<FaCalendarCheck />}
          digit={attendanceRate}
          text="Attendance rate"
        />
        <StudentStatCard
          icon={<FaClipboardList />}
          digit="0"
          text="Pending assignment"
        />
        <StudentStatCard
          icon={<FaCreditCard />}
          digit="$0"
          text="Fees Outstanding"
        />
      </section>

      <section className="performancestat-section">
        <div className="studentchart-container">
          <StudentPerformanceChart subjects={subjects} />

          <div className="course-progress-container">
            <div className="course-progress-titles">
              <h4>course progress</h4>
              <h5>View all courses</h5>
            </div>
            {subjects.length === 0 ? (
              <p className="course-empty">
                No subjects yet. Your subjects will appear here once they are
                added.
              </p>
            ) : (
              subjects.map((subject, index) => {
                const score = Math.min(Number(subject?.score) || 0, 100);

                return (
                  <div
                    className="course-math-container"
                    key={`${subject?.name}-${index}`}
                  >
                    <div className="course-math-text-contents">
                      <span>{getSubjectIcon(subject?.name)}</span>

                      <div className="course-math-text">
                        <h5>{subject?.name ?? "Not Available"}</h5>
                        <p>{profile?.grade || "Class not set"}</p>
                      </div>
                    </div>

                    <div className="course-math-progress-container">
                      <div className="progress" style={{ width: "100%" }}>
                        <div
                          className="progress-fill"
                          style={{ width: `${score}%` }}
                        ></div>
                        <span
                          style={{
                            color: "#7774A7",
                            fontWeight: "600",
                            fontSize: "13px",
                          }}
                        >
                          {score}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="attendance-section">
          <AttendanceChart studentId={user?.uid} />
        </div>
      </section>
    </div>
  );
}