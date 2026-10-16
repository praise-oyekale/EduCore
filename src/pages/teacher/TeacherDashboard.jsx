import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaInbox,
  FaCalendarCheck,
  FaPlus,
  FaClock,
  FaArrowUp,
  FaTasks,
  FaBullhorn,
  FaChartPie,
  FaFlask,
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationCircle,
  FaBookOpen,
  FaArrowRight,
} from "react-icons/fa";

import "../teacher/teacherdashboard.css";


const mockStats = [
  {
    title: "Total Students",
    value: "124",
    change: "+8 this month",
    icon: <FaUsers />,
    color: "blue",
  },
  {
    title: "My Classes",
    value: "6",
    change: "Across 3 levels",
    icon: <FaChalkboardTeacher />,
    color: "purple",
  },
  {
    title: "Pending Grading",
    value: "18",
    change: "Needs your attention",
    icon: <FaInbox />,
    color: "orange",
  },
  {
    title: "Attendance Today",
    value: "94%",
    change: "+2.5% this week",
    icon: <FaCalendarCheck />,
    color: "green",
  },
];

const mockSubmissions = [
  {
    id: 1,
    student: "Daniel Johnson",
    initials: "DJ",
    assignment: "Quadratic Equations",
    subject: "Mathematics",
    submitted: "10 minutes ago",
    status: "Pending",
  },
  {
    id: 2,
    student: "Sarah Williams",
    initials: "SW",
    assignment: "Chemical Bonding",
    subject: "Chemistry",
    submitted: "35 minutes ago",
    status: "Pending",
  },
  {
    id: 3,
    student: "Michael Ade",
    initials: "MA",
    assignment: "Algebra Practice",
    subject: "Mathematics",
    submitted: "1 hour ago",
    status: "Reviewed",
  },
  {
    id: 4,
    student: "Grace Okafor",
    initials: "GO",
    assignment: "Atomic Structure",
    subject: "Chemistry",
    submitted: "2 hours ago",
    status: "Pending",
  },
];

const mockSchedule = [
  {
    id: 1,
    time: "09:00 AM",
    endTime: "10:00 AM",
    subject: "Mathematics",
    className: "SS2 Science",
    room: "Room 204",
    color: "blue",
  },
  {
    id: 2,
    time: "11:00 AM",
    endTime: "12:00 PM",
    subject: "Further Mathematics",
    className: "SS3 Science",
    room: "Room 108",
    color: "purple",
  },
  {
    id: 3,
    time: "01:00 PM",
    endTime: "02:00 PM",
    subject: "Mathematics",
    className: "SS1 Science",
    room: "Room 201",
    color: "green",
  },
];

const mockPerformance = [
  { subject: "Mathematics", score: 82, color: "#2563eb" },
  { subject: "Chemistry", score: 74, color: "#7c3aed" },
  { subject: "Further Maths", score: 68, color: "#0d9488" },
  { subject: "Physics", score: 88, color: "#ea580c" },
];

const mockAnnouncements = [
  {
    id: 1,
    title: "Staff Meeting",
    description:
      "All teachers are expected to attend the staff meeting in the conference room.",
    date: "Today",
    type: "important",
  },
  {
    id: 2,
    title: "Mid-term Assessment",
    description:
      "Please ensure your assessment questions are ready before the deadline.",
    date: "Tomorrow",
    type: "normal",
  },
  {
    id: 3,
    title: "Results Submission",
    description:
      "Submit outstanding student results through the school portal.",
    date: "Friday",
    type: "normal",
  },
];

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
  },
  {
    title: "View Students",
    description: "Check your class lists",
    icon: <FaUsers />,
    color: "orange",
  },
];

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

        <span className="teacher-stat-indicator">
          <FaArrowUp />
        </span>
      </div>

      <p className="teacher-stat-title">{stat.title}</p>
      <h3>{stat.value}</h3>
      <p className="teacher-stat-description">{stat.change}</p>
    </article>
  );
}

function SubmissionStatus({ status }) {
  const reviewed = status === "Reviewed";

  return (
    <span className={`teacher-status ${reviewed ? "reviewed" : "pending"}`}>
      {reviewed ? <FaCheckCircle /> : <FaClock />}
      {status}
    </span>
  );
}

function GradingQueue({ onViewAll }) {
  return (
    <section className="teacher-card teacher-grading-card">
      <SectionHeading
        title="Recent Submissions"
        subtitle="Review your students' latest work"
        action="View all"
        onAction={onViewAll}
      />

      <div className="teacher-submissions-list">
        {mockSubmissions.map((submission) => (
          <div className="teacher-submission" key={submission.id}>
            <div className="teacher-student-avatar">{submission.initials}</div>

            <div className="teacher-submission-info">
              <h3>{submission.student}</h3>
              <p>{submission.assignment}</p>
              <span>{submission.subject}</span>
            </div>

            <div className="teacher-submission-right">
              <SubmissionStatus status={submission.status} />
              <span className="teacher-submission-time">
                {submission.submitted}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClassPerformance() {
  return (
    <section className="teacher-card teacher-performance-card">
      <SectionHeading
        title="Class Performance"
        subtitle="Average scores by subject"
      />

      <div className="teacher-performance-summary">
        <div>
          <span>Overall average</span>
          <h3>78%</h3>
        </div>

        <div className="teacher-performance-badge">
          <FaArrowUp />
          4.8%
        </div>
      </div>

      <div className="teacher-performance-list">
        {mockPerformance.map((item) => (
          <div className="teacher-performance-item" key={item.subject}>
            <div className="teacher-performance-label">
              <span>{item.subject}</span>
              <strong>{item.score}%</strong>
            </div>

            <div className="teacher-progress-track">
              <div
                className="teacher-progress-fill"
                style={{
                  width: `${item.score}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="teacher-demo-note">
        <FaExclamationCircle />
        Sample data for demonstration. Connect real student results later.
      </p>
    </section>
  );
}

function TodaysSchedule({ onViewAll }) {
  return (
    <section className="teacher-card teacher-schedule-card">
      <SectionHeading
        title="Today's Schedule"
        subtitle="Your classes for today"
        action="Full timetable"
        onAction={onViewAll}
      />

      <div className="teacher-schedule-list">
        {mockSchedule.map((item) => (
          <div className="teacher-schedule-item" key={item.id}>
            <div className={`teacher-schedule-line ${item.color}`} />

            <div className="teacher-schedule-time">
              <strong>{item.time}</strong>
              <span>{item.endTime}</span>
            </div>

            <div className="teacher-schedule-details">
              <h3>{item.subject}</h3>
              <p>{item.className}</p>
              <span>{item.room}</span>
            </div>
          </div>
        ))}
      </div>
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
            onClick={() => onAction(action.title)}
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

function Announcements({ onViewAll }) {
  return (
    <section className="teacher-card teacher-announcements-card">
      <SectionHeading
        title="School Announcements"
        subtitle="Updates from the school"
        action="View all"
        onAction={onViewAll}
      />

      <div className="teacher-announcements-list">
        {mockAnnouncements.map((announcement) => (
          <article className="teacher-announcement" key={announcement.id}>
            <div className={`teacher-announcement-icon ${announcement.type}`}>
              <FaBullhorn />
            </div>

            <div className="teacher-announcement-content">
              <div className="teacher-announcement-heading">
                <h3>{announcement.title}</h3>
                <span>{announcement.date}</span>
              </div>

              <p>{announcement.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function TeacherDashboard() {
  const { user, profile } = useAuth();
  const [notice, setNotice] = useState("");

  const teacherName = profile?.fullName?.trim()?.split(" ")[0] || "Teacher";

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleAction(action) {
    setNotice(
      `${action} will be connected to its page when that feature is implemented.`,
    );
  }

  return (
    <main className="teacher-dashboard">
      <div className="teacher-dashboard-container">
        <header className="teacher-welcome">
          <div className="teacher-welcome-content">
            <span className="teacher-welcome-label">TEACHER PORTAL</span>

            <h1>Welcome back, Dr. {teacherName}!</h1>

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

        {user?.role && user.role !== "teacher" && (
          <div className="teacher-role-notice">
            <FaExclamationCircle />
            <p>
              Your current role is <strong>{user.role}</strong>. This dashboard
              is intended for teacher accounts.
            </p>
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
          {mockStats.map((stat) => (
            <StatCard stat={stat} key={stat.title} />
          ))}
        </section>

        <div className="teacher-dashboard-grid">
          <GradingQueue onViewAll={() => handleAction("All submissions")} />

          <ClassPerformance />

          <TodaysSchedule onViewAll={() => handleAction("Full timetable")} />

          <QuickActions onAction={handleAction} />

          <Announcements onViewAll={() => handleAction("All announcements")} />
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

