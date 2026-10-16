import { useEffect, useState } from "react";
import {
  FaUsers, FaUserCheck, FaUserTimes, FaClock, FaExclamationTriangle,
  FaUserMinus, FaSignInAlt, FaSignOutAlt, FaDownload, FaBullhorn,
  FaMoneyBillWave, FaBus, FaCalendarAlt, FaTheaterMasks, FaUserFriends,
} from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

const todayISO = () => new Date().toISOString().slice(0, 10);

const GRADE_COLORS = ["#15803d", "#2563eb", "#6d28d9", "#b45309", "#db2777"];

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

const timeAgo = (ms) => {
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 60) return `${mins || 1} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
};

function StatCard({ icon, label, stat, percent, tone }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <span className={`stat-card__icon tone-${tone}`}>{icon}</span>
        <span className="stat-card__label">{label}</span>
        {percent !== undefined && (
          <span className={`stat-card__percent tone-${tone}`}>{percent}%</span>
        )}
      </div>
      <div className="stat-card__value">{stat.total}</div>
      <div className="stat-card__gender">
        M: {stat.m} F: {stat.f}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [date, setDate] = useState(todayISO());
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [grades, setGrades] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [s, h, g, a, e, n] = await Promise.all([
          getDashboardStats(date),
          getAttendanceHistory(),
          getAttendanceByGrade(date),
          getRecentAdmissions(3),
          getUpcomingEvents(3),
          getRecentAnnouncements(3),
        ]);
        if (cancelled) return;
        setStats(s);
        setHistory(h);
        setGrades(g);
        setAdmissions(a);
        setEvents(e);
        setAnnouncements(n);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const pct = (n) =>
    stats && stats.enrolled.total
      ? Math.round((n / stats.enrolled.total) * 100)
      : 0;

  const handleExport = () => {
    if (!stats) return;
    const rows = [["Metric", "Total", "Male", "Female"]];
    Object.entries(stats).forEach(([key, v]) =>
      rows.push([key, v.total, v.m, v.f])
    );
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !stats) return <div className="dash">Loading dashboard...</div>;
  if (!stats) return <div className="dash">No data available.</div>;

  return (
    <div className="dash">
      <h1 className="dash__title">Dashboard</h1>

      <div className="dash__toolbar">
        <label className="dash__date">
          <span>Select Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button className="btn-export" onClick={handleExport}>
          <FaDownload /> Export
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard icon={<FaUsers />} label="Enrolled" stat={stats.enrolled} tone="blue" />
        <StatCard icon={<FaUserCheck />} label="Present" stat={stats.present} percent={pct(stats.present.total)} tone="green" />
        <StatCard icon={<FaUserTimes />} label="Absent" stat={stats.absent} percent={pct(stats.absent.total)} tone="red" />
        <StatCard icon={<FaClock />} label="Late" stat={stats.late} percent={pct(stats.late.total)} tone="yellow" />
        <StatCard icon={<FaExclamationTriangle />} label="5+ Absences" stat={stats.fivePlus} percent={pct(stats.fivePlus.total)} tone="orange" />
        <StatCard icon={<FaUserMinus />} label="NLS" stat={stats.nls} percent={pct(stats.nls.total)} tone="purple" />
        <StatCard icon={<FaSignInAlt />} label="Transferred In" stat={stats.transferredIn} percent={pct(stats.transferredIn.total)} tone="indigo" />
        <StatCard icon={<FaSignOutAlt />} label="Transferred Out" stat={stats.transferredOut} percent={pct(stats.transferredOut.total)} tone="teal" />
      </div>

      {/* Attendance chart */}
      <section className="card">
        <h2 className="card__title">School Year Attendance Overview</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="present"
                name="Students"
                stroke="#6b9bd8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Two-column grid */}
      <div className="dash__grid">
        <section className="card">
          <div className="card__head">
            <h2 className="card__title">Recent admissions</h2>
            <a href="/admin/admissions" className="link">View all</a>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Grade applied</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="applicant">
                      <span className="avatar">
                        {a.fullName
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <strong>{a.fullName}</strong>
                    </div>
                  </td>
                  <td>Grade {a.gradeApplied}</td>
                  <td>{a.submittedAt}</td>
                  <td>
                    <span className={`badge badge--${a.status === "Accepted" ? "green" : "amber"}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card__title">Attendance by grade — today</h2>
          <ul className="grade-list">
            {grades.map((g, i) => (
              <li key={g.grade}>
                <span className="grade-list__name">Grade {g.grade}</span>
                <div className="progress">
                  <div
                    className="progress__bar"
                    style={{
                      width: `${g.percent}%`,
                      background: GRADE_COLORS[i % GRADE_COLORS.length],
                    }}
                  />
                </div>
                <span className="grade-list__pct">{g.percent}%</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card__head">
            <h2 className="card__title">Upcoming events</h2>
            <a href="/admin/calendar" className="link">View calendar</a>
          </div>
          <ul className="feed">
            {events.map((ev) => (
              <li key={ev.id}>
                <span className={`feed__icon feed__icon--${ev.type || "meeting"}`}>
                  {EVENT_ICONS[ev.type] || <FaCalendarAlt />}
                </span>
                <div>
                  <strong>{ev.title}</strong>
                  <small>{ev.details}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card__head">
            <h2 className="card__title">Recent announcements</h2>
            <a href="/admin/announcements" className="link">View all</a>
          </div>
          <ul className="feed">
            {announcements.map((an) => (
              <li key={an.id}>
                <span className={`feed__icon feed__icon--${an.type || "exam"}`}>
                  {ANNOUNCEMENT_ICONS[an.type] || <FaBullhorn />}
                </span>
                <div>
                  <strong>{an.title}</strong>
                  <small>{timeAgo(an.createdAt)}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}