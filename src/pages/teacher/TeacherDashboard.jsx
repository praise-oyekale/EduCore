import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaInbox,
  FaCalendarCheck,
  FaPlus,
  FaClock,
  FaTasks,
  FaBullhorn,
  FaChartPie,
  FaFlask,
  FaGraduationCap,
  FaExclamationCircle,
  FaBookOpen,
  FaArrowRight,
} from "react-icons/fa";

import {
  getTeacherDashboardData,
  getTeacherProfile,
} from "../../services/teacherService";
import { getRecentAnnouncements } from "../../services/adminService";

import "../teacher/teacherdashboard.css";

const SUBJECT_COLORS = ["#2563eb", "#7c3aed", "#0d9488", "#ea580c", "#db2777"];
const CLASS_COLORS = ["blue", "purple", "green"];

const ROUTES = {
  classes: "/teacher/classes",
  students: "/teacher/students",
};

const quickActions = [
  {
    title: "Take Attendance",
    description: "Record attendance for your classes",
    icon: <FaCalendarCheck />,
    color: "blue",
  },
  {
    title: "Create Assignment",
    description: "Give your students a new task",
    icon: <FaPlus />,
    color: "purple",
  },
  {
    title: "Enter Results",
    description: "Record student scores and grades",
    icon: <FaChartPie />,
    color: "green",
    path: ROUTES.classes,
  },
  {
    title: "View Students",
    description: "Check your class lists",
    icon: <FaUsers />,
    color: "orange",
    path: ROUTES.students,
  },
];

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S"
  );
}

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function timeAgo(value) {
  if (!value) return "Recently";

  const ms =
    typeof value === "number"
      ? value
      : typeof value?.toMillis === "function"
        ? value.toMillis()
        : typeof value?.seconds === "number"
          ? value.seconds * 1000
          : new Date(value).getTime();

  if (!Number.isFinite(ms)) return "Recently";

  const mins = Math.max(0, Math.floor((Date.now() - ms) / 60000));
  if (mins < 60) return `${Math.max(1, mins)} min ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;

  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function EmptyState({ children }) {
  return <div className="teacher-empty">{children}</div>;
}

function SectionHeading({ title, subtitle, action, onAction }) {
  return (
    <div className="teacher-section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {action && (
        <button
          type="button"
          className="teacher-text-button"
          onClick={onAction}
        >
          {action} <FaArrowRight />
        </button>
      )}
    </div>
  );
}

function StatCard({ stat }) {
  return (
    <article className="teacher-stat-card">
      <div className="teacher-stat-top">
        <div className={`teacher-stat-icon ${stat.color}`}>{stat.icon}</div>
      </div>

      <p className="teacher-stat-title">{stat.title}</p>
      <h3>{stat.value}</h3>
      <p className="teacher-stat-description">{stat.change}</p>
    </article>
  );
}

function AwaitingScores({ items, onViewAll }) {
  return (
    <section className="teacher-card teacher-grading-card">
      <SectionHeading
        title="Awaiting Scores"
        subtitle="Students with no score yet in your subjects"
        action="Enter scores"
        onAction={onViewAll}
      />

      {items.length === 0 ? (
        <EmptyState>Every student in your subjects has a score.</EmptyState>
      ) : (
        <div className="teacher-submissions-list">
          {items.map((item) => (
            <div className="teacher-submission" key={item.id}>
              <div className="teacher-student-avatar">
                {getInitials(item.student)}
              </div>

              <div className="teacher-submission-info">
                <h3>{item.student}</h3>
                <p>{item.subject}</p>
                <span>{item.className || "Class not set"}</span>
              </div>

              <div className="teacher-submission-right">
                <span className="teacher-status pending">
                  <FaClock />
                  Pending
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ClassPerformance({ performance, overallAverage }) {
  return (
    <section className="teacher-card teacher-performance-card">
      <SectionHeading
        title="Class Performance"
        subtitle="Average scores by subject"
      />

      {performance.length === 0 ? (
        <EmptyState>
          No scores have been recorded yet. Averages will appear here once
          results are entered.
        </EmptyState>
      ) : (
        <>
          <div className="teacher-performance-summary">
            <div>
              <span>Overall average</span>
              <h3>{overallAverage}%</h3>
            </div>
          </div>

          <div className="teacher-performance-list">
            {performance.map((item, index) => (
              <div className="teacher-performance-item" key={item.subject}>
                <div className="teacher-performance-label">
                  <span>{item.subject}</span>
                  <strong>{item.score}%</strong>
                </div>

                <div className="teacher-progress-track">
                  <div
                    className="teacher-progress-fill"
                    style={{
                      width: `${Math.min(item.score, 100)}%`,
                      backgroundColor:
                        SUBJECT_COLORS[index % SUBJECT_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function MyClasses({ classes, subjects, onViewAll }) {
  return (
    <section className="teacher-card teacher-schedule-card">
      <SectionHeading
        title="My Classes"
        subtitle="Classes assigned to you"
        action="View students"
        onAction={onViewAll}
      />

      {classes.length === 0 ? (
        <EmptyState>
          No classes have been assigned to you yet. Please contact the admin.
        </EmptyState>
      ) : (
        <div className="teacher-schedule-list">
          {classes.map((item, index) => (
            <div className="teacher-schedule-item" key={item.name}>
              <div
                className={`teacher-schedule-line ${CLASS_COLORS[index % CLASS_COLORS.length]}`}
              />

              <div className="teacher-schedule-time">
                <strong>{item.name}</strong>
                <span>
                  {item.students} student{item.students === 1 ? "" : "s"}
                </span>
              </div>

              <div className="teacher-schedule-details">
                <h3>
                  {subjects.length ? subjects.join(", ") : "All subjects"}
                </h3>
                <p>
                  {item.isClassTeacher
                    ? "You are the class teacher"
                    : "Subject teacher"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function QuickActions({ onAction }) {
  return (
    <section className="teacher-card teacher-quick-actions-card">
      <SectionHeading
        title="Quick Actions"
        subtitle="Shortcuts to common tasks"
      />

      <div className="teacher-quick-actions-grid">
        {quickActions.map((action) => (
          <button
            type="button"
            className="teacher-quick-action"
            key={action.title}
            onClick={() => onAction(action)}
          >
            <div className={`teacher-quick-action-icon ${action.color}`}>
              {action.icon}
            </div>

            <div className="teacher-quick-action-content">
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>

            <FaArrowRight className="teacher-quick-action-arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}

function Announcements({ announcements, onViewAll }) {
  return (
    <section className="teacher-card teacher-announcements-card">
      <SectionHeading
        title="School Announcements"
        subtitle="Updates from the school"
        action="View all"
        onAction={onViewAll}
      />

      {announcements.length === 0 ? (
        <EmptyState>No announcements have been published yet.</EmptyState>
      ) : (
        <div className="teacher-announcements-list">
          {announcements.map((announcement) => (
            <article className="teacher-announcement" key={announcement.id}>
              <div
                className={`teacher-announcement-icon ${
                  announcement.type === "important" ? "important" : "normal"
                }`}
              >
                <FaBullhorn />
              </div>

              <div className="teacher-announcement-content">
                <div className="teacher-announcement-heading">
                  <h3>{announcement.title || "School announcement"}</h3>
                  <span>{timeAgo(announcement.createdAt)}</span>
                </div>

                {(announcement.description || announcement.message) && (
                  <p>{announcement.description || announcement.message}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [data, setData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const uid = user?.uid || user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const profile = await getTeacherProfile(uid);

        if (!active) return;
        setTeacher(profile);

        const [dashboardData, recentAnnouncements] = await Promise.all([
          getTeacherDashboardData(profile || {}),
          getRecentAnnouncements(3).catch(() => []),
        ]);

        if (!active) return;
        setData(dashboardData);
        setAnnouncements(recentAnnouncements);
      } catch (err) {
        console.error("Failed to load teacher dashboard:", err);

        if (active) {
          setError(
            "We couldn't load your dashboard data. Please check your connection and try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user]);

  const firstName = (
    teacher?.fullName ||
    user?.fullName ||
    user?.displayName ||
    "Teacher"
  )
    .trim()
    .split(" ")[0];
  const greetingName = [teacher?.title, firstName].filter(Boolean).join(" ");

  const subjects = toList(teacher?.subjectsTaught);
  const classes = data?.classes || [];

  const levels = [
    ...new Set(
      classes.map((c) =>
        c.name.startsWith("JSS")
          ? "JSS"
          : c.name.startsWith("SSS")
            ? "SSS"
            : "Other",
      ),
    ),
  ];

  const stats = [
    {
      title: "Total Students",
      value: String(data?.studentCount ?? 0),
      change: classes.length
        ? "In your assigned classes"
        : "No classes assigned yet",
      icon: <FaUsers />,
      color: "blue",
    },
    {
      title: "My Classes",
      value: String(classes.length),
      change: levels.length ? levels.join(" & ") : "None assigned",
      icon: <FaChalkboardTeacher />,
      color: "purple",
    },
    {
      title: "Awaiting Scores",
      value: String(data?.pendingCount ?? 0),
      change: data?.pendingCount ? "Needs your attention" : "All caught up",
      icon: <FaInbox />,
      color: "orange",
    },
    {
      title: "Attendance Today",
      value: data?.attendanceRate == null ? "—" : `${data.attendanceRate}%`,
      change:
        data?.attendanceRate == null
          ? "Not recorded yet today"
          : `${data.attendanceRecorded} students marked`,
      icon: <FaCalendarCheck />,
      color: "green",
    },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleAction(action) {
    if (action.path) {
      navigate(action.path);
      return;
    }

    setNotice(
      `${action.title} will be connected to its page when that feature is implemented.`,
    );
  }

  if (loading) {
    return (
      <main className="teacher-dashboard">
        <div className="teacher-dashboard-container">
          <div className="teacher-empty">Loading your dashboard...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="teacher-dashboard">
      <div className="teacher-dashboard-container">
        <header className="teacher-welcome">
          <div className="teacher-welcome-content">
            <span className="teacher-welcome-label">TEACHER PORTAL</span>

            <h1>Welcome back, {greetingName}!</h1>

            <p>Here is what is happening with your classes today.</p>

            <div className="teacher-welcome-date">
              <FaCalendarCheck />
              <span>{today}</span>
            </div>
          </div>

          <div className="teacher-welcome-illustration">
            <div className="teacher-illustration-circle">
              <FaGraduationCap />
            </div>
            <div className="teacher-illustration-book">
              <FaBookOpen />
            </div>
            <div className="teacher-illustration-flask">
              <FaFlask />
            </div>
          </div>
        </header>

        {teacher?.role && teacher.role !== "teacher" && (
          <div className="teacher-role-notice">
            <FaExclamationCircle />
            <p>
              Your current role is <strong>{teacher.role}</strong>. This
              dashboard is intended for teacher accounts.
            </p>
          </div>
        )}

        {error && (
          <div className="teacher-role-notice">
            <FaExclamationCircle />
            <p>{error}</p>
          </div>
        )}

        {notice && (
          <div className="teacher-feedback">
            <p>{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <section className="teacher-stats-grid">
          {stats.map((stat) => (
            <StatCard stat={stat} key={stat.title} />
          ))}
        </section>

        <div className="teacher-dashboard-grid">
          <AwaitingScores
            items={data?.pending || []}
            onViewAll={() => navigate(ROUTES.classes)}
          />

          <ClassPerformance
            performance={data?.performance || []}
            overallAverage={data?.overallAverage}
          />

          <MyClasses
            classes={classes}
            subjects={subjects}
            onViewAll={() => navigate(ROUTES.students)}
          />

          <QuickActions onAction={handleAction} />

          <Announcements
            announcements={announcements}
            onViewAll={() =>
              setNotice(
                "All announcements will be connected when that page is built.",
              )
            }
          />
        </div>

        <footer className="teacher-dashboard-footer">
          <div className="teacher-footer-icon">
            <FaChalkboardTeacher />
          </div>

          <div>
            <h3>Your classroom, all in one place</h3>
            <p>
              Manage classes, monitor student progress, and keep track of your
              teaching activities.
            </p>
          </div>

          <FaTasks className="teacher-footer-decoration" />
        </footer>
      </div>
    </main>
  );
}
