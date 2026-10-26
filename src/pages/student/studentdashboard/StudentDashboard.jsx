import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
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
  FaBullhorn,
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
  if (text.includes("english") || text.includes("language")) {
    return <FaLanguage />;
  }
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

function formatAnnouncementDate(value) {
  let date = null;

  if (typeof value?.toDate === "function") {
    date = value.toDate();
  } else if (typeof value?.seconds === "number") {
    date = new Date(value.seconds * 1000);
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string") {
    date = new Date(value);
  }

  if (!date || Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  const now = new Date();
  const difference = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();

  const firstName =
    profile?.fullName?.trim()?.split(/\s+/)[0] ||
    user?.displayName?.split(" ")[0] ||
    "Student";

  const today = new Date();
  const subjects = Array.isArray(profile?.subjects) ? profile.subjects : [];

  const [attendanceRate, setAttendanceRate] = useState("100%");
  const [announcements, setAnnouncements] = useState([]);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementError, setAnnouncementError] = useState("");

  // Load attendance records for this student.
  useEffect(() => {
    if (!user?.uid) return;

    async function fetchAttendance() {
      try {
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("studentId", "==", user.uid),
        );

        const snapshot = await getDocs(attendanceQuery);

        if (!snapshot.empty) {
          const records = snapshot.docs.map((item) => item.data());
          const total = records.length;

          const presentOrLate = records.filter((record) =>
            ["present", "late"].includes(
              String(record.status || "").toLowerCase(),
            ),
          ).length;

          setAttendanceRate(`${Math.round((presentOrLate / total) * 100)}%`);
        } else {
          setAttendanceRate("100%");
        }
      } catch (error) {
        console.error("Error fetching student attendance:", error);
      }
    }

    fetchAttendance();
  }, [user?.uid]);

  // Subscribe to the shared announcements collection.
  // Updates appear automatically when admins or teachers publish announcements.
  useEffect(() => {
    setAnnouncementLoading(true);
    setAnnouncementError("");

    const announcementsQuery = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      announcementsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        // Show pinned announcements first, then newest announcements.
        items.sort((a, b) => {
          if (Boolean(a.pinned) !== Boolean(b.pinned)) {
            return a.pinned ? -1 : 1;
          }

          const getTime = (value) => {
            if (typeof value?.toMillis === "function") {
              return value.toMillis();
            }
            if (typeof value?.seconds === "number") {
              return value.seconds * 1000;
            }
            return 0;
          };

          return getTime(b.createdAt) - getTime(a.createdAt);
        });

        setAnnouncements(items);
        setAnnouncementLoading(false);
        setAnnouncementError("");
      },
      (error) => {
        console.error("Error loading announcements:", error);
        setAnnouncementError(
          "Announcements could not be loaded. Please check your access or try again later.",
        );
        setAnnouncementLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const scoredSubjects = subjects.filter(
    (subject) => Number(subject?.score) > 0,
  );

  function calculateGPA() {
    if (scoredSubjects.length === 0) {
      return profile?.gpa ?? "N/A";
    }

    let totalPointsTimesCredits = 0;
    let totalCredits = 0;

    scoredSubjects.forEach((subject) => {
      const score = Number(subject.score) || 0;
      const lowerName = String(subject.name || "").toLowerCase();

      const credits =
        lowerName.includes("math") ||
        lowerName.includes("english") ||
        lowerName.includes("physics") ||
        lowerName.includes("chem")
          ? 4
          : 3;

      let points = 0;

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
      : (profile?.gpa ?? "0.00");
  }

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="studashboardcontents-container">
      <section className="greeting-section">
        <div className="dashboard-welcome-message">
          <h1>Welcome back, {firstName} 👋</h1>
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
              <h4>Course progress</h4>
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
                        />

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

          {/* School-wide announcements */}
          <section className="student-announcements-card">
            <div className="student-announcements-heading">
              <div className="student-announcements-title">
                <span className="student-announcements-icon">
                  <FaBullhorn />
                </span>

                <div>
                  <h3>Announcements</h3>
                  <p>Latest school updates</p>
                </div>
              </div>

              <span className="student-announcements-count">
                {announcements.length}
              </span>
            </div>

            {announcementLoading ? (
              <p className="student-announcements-state">
                Loading announcements...
              </p>
            ) : announcementError ? (
              <p className="student-announcements-state student-announcements-error">
                {announcementError}
              </p>
            ) : announcements.length === 0 ? (
              <p className="student-announcements-state">
                No announcements yet. School updates will appear here.
              </p>
            ) : (
              <div className="student-announcements-list">
                {announcements.slice(0, 4).map((announcement) => (
                  <article
                    className="student-announcement-item"
                    key={announcement.id}
                  >
                    <div className="student-announcement-meta">
                      <span className="student-announcement-category">
                        {announcement.category || "Academic"}
                      </span>

                      {announcement.pinned && (
                        <span className="student-announcement-pinned">
                          Pinned
                        </span>
                      )}

                      <span className="student-announcement-time">
                        {formatAnnouncementDate(announcement.createdAt)}
                      </span>
                    </div>

                    <h4>{announcement.title || "School announcement"}</h4>

                    <p className="student-announcement-message">
                      {announcement.message || announcement.description || ""}
                    </p>

                    <p className="student-announcement-author">
                      Posted by {announcement.authorName || "School Admin"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
