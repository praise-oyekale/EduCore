import { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaExclamationTriangle,
  FaUserMinus,
  FaSignInAlt,
  FaSignOutAlt,
  FaDownload,
  FaBullhorn,
  FaMoneyBillWave,
  FaBus,
  FaCalendarAlt,
  FaTheaterMasks,
  FaUserFriends,
  FaGraduationCap,
  FaBookOpen,
  FaFlask,
  FaArrowUp,
  FaChartLine,
  FaClipboardCheck,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardStats,
  getAttendanceHistory,
  getAttendanceByGrade,
  getRecentAdmissions,
  getUpcomingEvents,
  getRecentAnnouncements,
} from "../../services/adminService";
import "../admin/admindashboard.css";

const todayISO = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const GRADE_COLORS = ["#2563eb", "#16a34a", "#7c3aed", "#f97316", "#db2777"];

const EVENT_ICONS = {
  meeting: <FaCalendarAlt />,
  drama: <FaTheaterMasks />,
  career: <FaUserFriends />,
};

const ANNOUNCEMENT_ICONS = {
  exam: <FaBullhorn />,
  fees: <FaMoneyBillWave />,
  transport: <FaBus />,
};

const timeAgo = (value) => {
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
};

const formatDate = (value) => {
  if (!value) return "Date not set";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const safeName = (value) => {
  if (typeof value !== "string" || !value.trim()) return "Applicant";
  return value.trim();
};

function StatCard({ icon, label, stat, percent, tone, note }) {
  const total = Number(stat?.total) || 0;

  return (
    <article className="admin-stat-card">
      <div className="admin-stat-card__top">
        <span className={`admin-stat-card__icon tone-${tone}`}>{icon}</span>
        {percent !== undefined && (
          <span className={`admin-stat-card__trend tone-${tone}`}>
            <FaArrowUp aria-hidden="true" />
            {percent}%
          </span>
        )}
      </div>
      <p className="admin-stat-card__label">{label}</p>
      <div className="admin-stat-card__value">{total.toLocaleString()}</div>
      <div className="admin-stat-card__foot">
        <span>{note || `Male: ${stat?.m || 0} · Female: ${stat?.f || 0}`}</span>
      </div>
    </article>
  );
}

function EmptyState({ children }) {
  return <div className="admin-empty-state">{children}</div>;
}

export default function AdminDashboard() {
  const [date, setDate] = useState(todayISO);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [grades, setGrades] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [
          nextStats,
          nextHistory,
          nextGrades,
          nextAdmissions,
          nextEvents,
          nextAnnouncements,
        ] = await Promise.all([
          getDashboardStats(date),
          getAttendanceHistory(),
          getAttendanceByGrade(date),
          getRecentAdmissions(4),
          getUpcomingEvents(4),
          getRecentAnnouncements(4),
        ]);

        if (cancelled) return;
        setStats(nextStats);
        setHistory(nextHistory);
        setGrades(nextGrades);
        setAdmissions(nextAdmissions);
        setEvents(nextEvents);
        setAnnouncements(nextAnnouncements);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
        if (!cancelled) {
          setError(
            "We couldn't load the dashboard data. Check your Firebase collections and try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const attendanceRate = useMemo(() => {
    if (!stats?.enrolled?.total) return 0;
    const attended = (stats.present?.total || 0) + (stats.late?.total || 0);
    return Math.round((attended / stats.enrolled.total) * 100);
  }, [stats]);

  const pct = (n) =>
    stats?.enrolled?.total
      ? Math.round(((Number(n) || 0) / stats.enrolled.total) * 100)
      : 0;

  const chartData = useMemo(
    () =>
      history.map((item) => ({
        ...item,
        present: Number(item.present) || 0,
      })),
    [history],
  );

  const handleExport = () => {
    if (!stats) return;

    const rows = [
      ["School Dashboard Report"],
      ["Selected date", date],
      [],
      ["Metric", "Total", "Male", "Female"],
      ...Object.entries(stats).map(([key, value]) => [
        key,
        value?.total ?? 0,
        value?.m ?? 0,
        value?.f ?? 0,
      ]),
      [],
      ["Attendance by grade"],
      ["Grade", "Attendance percentage"],
      ...grades.map((grade) => [grade.grade, `${grade.percent}%`]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replaceAll('"', '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `school-dashboard-${date}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-dash">
      <section className="admin-welcome">
        <div className="admin-welcome__content">
          <span className="admin-welcome__eyebrow">SCHOOL ADMINISTRATION</span>
          <h1>Welcome to your dashboard!</h1>
          <p>Here is what is happening across your school today.</p>
          <div className="admin-welcome__date">
            <FaCalendarAlt aria-hidden="true" />
            <span>
              {new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="admin-welcome__art" aria-hidden="true">
          <span className="admin-welcome__circle">
            <FaGraduationCap />
          </span>
          <span className="admin-welcome__floating admin-welcome__floating--book">
            <FaBookOpen />
          </span>
          <span className="admin-welcome__floating admin-welcome__floating--flask">
            <FaFlask />
          </span>
        </div>
      </section>

      <div className="admin-dash__toolbar">
        <div>
          <h2 className="admin-section-heading">School overview</h2>
          <p className="admin-section-subtitle">
            A snapshot of attendance and school activity.
          </p>
        </div>
        <div className="admin-toolbar__actions">
          <label className="admin-date-control">
            <span>Select date</span>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <button
            className="admin-export-btn"
            onClick={handleExport}
            disabled={!stats}
          >
            <FaDownload aria-hidden="true" /> Export report
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}
      {loading && !stats ? (
        <div className="admin-loading">Loading your school overview…</div>
      ) : (
        <>
          {stats && (
            <>
              <section
                className="admin-stat-grid"
                aria-label="Attendance statistics"
              >
                <StatCard
                  icon={<FaUsers />}
                  label="Enrolled students"
                  stat={stats.enrolled}
                  tone="blue"
                  note="Currently enrolled"
                />
                <StatCard
                  icon={<FaUserCheck />}
                  label="Present"
                  stat={stats.present}
                  percent={pct(stats.present?.total)}
                  tone="green"
                  note="Marked present"
                />
                <StatCard
                  icon={<FaUserTimes />}
                  label="Absent"
                  stat={stats.absent}
                  percent={pct(stats.absent?.total)}
                  tone="red"
                  note="Marked absent"
                />
                <StatCard
                  icon={<FaClock />}
                  label="Late arrivals"
                  stat={stats.late}
                  percent={pct(stats.late?.total)}
                  tone="yellow"
                  note="Arrived late"
                />
                <StatCard
                  icon={<FaExclamationTriangle />}
                  label="5+ absences"
                  stat={stats.fivePlus}
                  percent={pct(stats.fivePlus?.total)}
                  tone="orange"
                  note="Needs follow-up"
                />
                <StatCard
                  icon={<FaUserMinus />}
                  label="NLS"
                  stat={stats.nls}
                  percent={pct(stats.nls?.total)}
                  tone="purple"
                  note="Not currently enrolled"
                />
                <StatCard
                  icon={<FaSignInAlt />}
                  label="Transferred in"
                  stat={stats.transferredIn}
                  percent={pct(stats.transferredIn?.total)}
                  tone="indigo"
                  note="Joined from another school"
                />
                <StatCard
                  icon={<FaSignOutAlt />}
                  label="Transferred out"
                  stat={stats.transferredOut}
                  percent={pct(stats.transferredOut?.total)}
                  tone="teal"
                  note="Left for another school"
                />
              </section>

              <section className="admin-attendance-summary">
                <div className="admin-attendance-summary__icon">
                  <FaClipboardCheck />
                </div>
                <div className="admin-attendance-summary__copy">
                  <span>Attendance rate</span>
                  <strong>{attendanceRate}%</strong>
                  <small>Present or late compared with enrolled students</small>
                </div>
                <div
                  className="admin-attendance-summary__meter"
                  aria-label={`${attendanceRate}% attendance`}
                >
                  <div style={{ width: `${Math.min(100, attendanceRate)}%` }} />
                </div>
              </section>
            </>
          )}

          <section className="admin-panel admin-chart-panel">
            <div className="admin-panel__heading">
              <div>
                <h2>School year attendance overview</h2>
                <p>Daily number of students marked present</p>
              </div>
              <span className="admin-panel__heading-icon">
                <FaChartLine />
              </span>
            </div>
            <div className="admin-chart">
              {chartData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 12, right: 14, left: -12, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e8edf5"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#718096" }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={20}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#718096" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="present"
                      name="Students present"
                      stroke="#3568dc"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: "#3568dc", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState>No attendance history is available yet.</EmptyState>
              )}
            </div>
          </section>

          <div className="admin-dash__content-grid">
            <section className="admin-panel admin-admissions-panel">
              <div className="admin-panel__heading">
                <div>
                  <h2>Recent admissions</h2>
                  <p>Latest applications received</p>
                </div>
                <a href="/admin/admissions" className="admin-text-link">
                  View all <span>→</span>
                </a>
              </div>
              {admissions.length ? (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Class</th>
                        <th>Submitted</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admissions.map((admission) => {
                        const fullName = safeName(admission.fullName);
                        const initials = fullName
                          .split(/\s+/)
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <tr key={admission.id}>
                            <td>
                              <div className="admin-applicant">
                                <span className="admin-avatar">{initials}</span>
                                <strong>{fullName}</strong>
                              </div>
                            </td>
                            <td>
                              {admission.gradeApplied || "—"}
                            </td>
                            <td>
                              {admission.submittedAt ||
                                formatDate(admission.createdAt)}
                            </td>
                            <td>
                              <span
                                className={`admin-badge admin-badge--${String(admission.status || "pending").toLowerCase() === "accepted" ? "green" : "amber"}`}
                              >
                                {admission.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState>No recent admission applications found.</EmptyState>
              )}
            </section>

            <section className="admin-panel">
              <div className="admin-panel__heading">
                <div>
                  <h2>Attendance by grade</h2>
                  <p>Present or late for {formatDate(date)}</p>
                </div>
              </div>
              {grades.length ? (
                <ul className="admin-grade-list">
                  {grades.map((grade, index) => (
                    <li key={grade.grade}>
                      <div className="admin-grade-list__top">
                        <span>{grade.grade}</span>
                        <strong>{grade.percent}%</strong>
                      </div>
                      <div className="admin-progress">
                        <div
                          className="admin-progress__bar"
                          style={{
                            width: `${Math.max(0, Math.min(100, grade.percent))}%`,
                            background:
                              GRADE_COLORS[index % GRADE_COLORS.length],
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>
                  No attendance has been recorded for this date.
                </EmptyState>
              )}
            </section>

            <section className="admin-panel">
              <div className="admin-panel__heading">
                <div>
                  <h2>Upcoming events</h2>
                  <p>What is coming up at school</p>
                </div>
                <a href="/admin/calendar" className="admin-text-link">
                  Calendar <span>→</span>
                </a>
              </div>
              {events.length ? (
                <ul className="admin-feed">
                  {events.map((event) => (
                    <li key={event.id}>
                      <span
                        className={`admin-feed__icon admin-feed__icon--${event.type || "meeting"}`}
                      >
                        {EVENT_ICONS[event.type] || <FaCalendarAlt />}
                      </span>
                      <div className="admin-feed__content">
                        <strong>{event.title || "School event"}</strong>
                        <small>{event.details || formatDate(event.date)}</small>
                        {event.date && (
                          <span className="admin-feed__date">
                            {formatDate(event.date)}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>No upcoming events have been added.</EmptyState>
              )}
            </section>

            <section className="admin-panel">
              <div className="admin-panel__heading">
                <div>
                  <h2>Recent announcements</h2>
                  <p>Latest messages shared with the school</p>
                </div>
                <a href="/admin/announcements" className="admin-text-link">
                  View all <span>→</span>
                </a>
              </div>
              {announcements.length ? (
                <ul className="admin-feed">
                  {announcements.map((announcement) => (
                    <li key={announcement.id}>
                      <span
                        className={`admin-feed__icon admin-feed__icon--${announcement.type || "exam"}`}
                      >
                        {ANNOUNCEMENT_ICONS[announcement.type] || (
                          <FaBullhorn />
                        )}
                      </span>
                      <div className="admin-feed__content">
                        <strong>
                          {announcement.title || "School announcement"}
                        </strong>
                        <small>{timeAgo(announcement.createdAt)}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>
                  No announcements have been published yet.
                </EmptyState>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
