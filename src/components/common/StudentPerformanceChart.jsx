import React, { useState, useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

import "../common/studentperformancechart.css";

// 1. Line Chart reading directly from student.subjects prop
const StudentPerformanceChart = ({ subjects = [] }) => {
  // Format live subjects array for Recharts
  const chartData =
    Array.isArray(subjects) && subjects.length > 0
      ? subjects.map((s) => ({
          subject: s.name || "Subject",
          score: Math.min(100, Math.max(0, Number(s.score) || 0)),
        }))
      : [];

  return (
    <div className="performance-chart">
      <h3>Academic Performance</h3>

      {chartData.length === 0 ? (
        <div
          style={{
            padding: "50px 0",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          No subject scores recorded yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563EB"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// 2. Circular Attendance Gauge reading live attendance records from Firestore
export const AttendanceChart = ({ studentId }) => {
  const [stats, setStats] = useState({
    rate: 100,
    presentDays: 0,
    absentDays: 0,
  });

  useEffect(() => {
    if (!studentId) return;

    // Listen to attendance collection in realtime
    const q = query(
      collection(db, "attendance"),
      where("studentId", "==", studentId),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let present = 0;
        let absent = 0;

        snapshot.forEach((doc) => {
          const status = String(doc.data().status || "").toLowerCase();
          if (status === "present" || status === "late") {
            present++;
          } else if (status === "absent") {
            absent++;
          }
        });

        const total = present + absent;
        const rate = total > 0 ? Math.round((present / total) * 100) : 100;

        setStats({
          rate,
          presentDays: present,
          absentDays: absent,
        });
      },
      (error) => {
        console.error("Error fetching live student attendance:", error);
      },
    );

    return () => unsubscribe();
  }, [studentId]);

  return (
    <div className="student-attendance-chart">
      <div className="attendance-headlines">
        <h3>Attendance</h3>
        <h5>Details</h5>
      </div>

      <div className="attendanceinner-container">
        <section className="circular-section">
          <div
            className="attendance-circle"
            style={{
              background: `conic-gradient(#2563EB ${stats.rate}%, #e5e7eb 0)`,
            }}
          >
            <div className="attendance-inner">
              <h3>{stats.rate}%</h3>
              <h6 style={{ color: "#92758C", fontSize: "10px" }}>present</h6>
            </div>
          </div>

          <div className="present-texts">
            <div className="presenttext-wrapper">
              <div
                style={{
                  backgroundColor: "#2563EB",
                  borderRadius: "50%",
                  border: "1px",
                  width: "10px",
                  height: "10px",
                }}
              ></div>{" "}
              <span>Present</span>
            </div>

            <div className="presenttext-wrapper">
              <div
                style={{
                  backgroundColor: "#e5e7eb",
                  borderRadius: "50%",
                  border: "1px",
                  width: "10px",
                  height: "10px",
                }}
              ></div>{" "}
              <span>Absent</span>
            </div>
          </div>
        </section>

        <div className="attendance-details">
          <p>
            {stats.presentDays} {stats.presentDays === 1 ? "day" : "days"}
          </p>
          <p>
            {stats.absentDays} {stats.absentDays === 1 ? "day" : "days"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceChart;
