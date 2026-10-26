import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import {
  FaChartLine,
  FaAward,
  FaTrophy,
  FaGraduationCap,
  FaDownload,
  FaArrowUp,
  FaStar,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "../studentgrades&result/studentgrades.css";

export function StudentGrades() {
  const { user, profile } = useAuth();
  const [activeTerm, setActiveTerm] = useState("Term 1");
  const [classRankInfo, setClassRankInfo] = useState({ rank: 1, total: 1 });
  const [loadingRank, setLoadingRank] = useState(true);

  const subjects = useMemo(() => {
    return Array.isArray(profile?.subjects) ? profile.subjects : [];
  }, [profile]);

  const getSubjectDetails = (scoreNum) => {
    const score = Number(scoreNum) || 0;
    if (score >= 70) return { letter: "A", points: 4.0, colorClass: "badge-a" };
    if (score >= 60) return { letter: "B", points: 3.0, colorClass: "badge-b" };
    if (score >= 50) return { letter: "C", points: 2.5, colorClass: "badge-c" };
    if (score >= 45) return { letter: "D", points: 2.0, colorClass: "badge-d" };
    if (score >= 40) return { letter: "E", points: 1.5, colorClass: "badge-e" };
    return { letter: "F", points: 0.0, colorClass: "badge-f" };
  };

  const subjectRows = useMemo(() => {
    return subjects.map((sub) => {
      const name = sub.name || "Subject";
      const score = Number(sub.score) || 0;
      const lower = name.toLowerCase();

      const credits =
        lower.includes("math") ||
        lower.includes("english") ||
        lower.includes("physics") ||
        lower.includes("chem")
          ? 4
          : 3;

      const details = getSubjectDetails(score);

      return {
        name,
        score,
        credits,
        letter: details.letter,
        points: details.points,
        colorClass: details.colorClass,
      };
    });
  }, [subjects]);

  // Derive GPA dynamically from live subjectRows
  const overallStats = useMemo(() => {
    if (subjectRows.length === 0) {
      return { gpa: profile?.gpa || "0.00", totalCredits: 0, highest: null };
    }

    let totalPointsTimesCredits = 0;
    let totalCredits = 0;
    let highestSub = subjectRows[0];

    subjectRows.forEach((row) => {
      totalPointsTimesCredits += row.points * row.credits;
      totalCredits += row.credits;

      if (row.score > highestSub.score) {
        highestSub = row;
      }
    });

    const calculatedGpa =
      totalCredits > 0
        ? (totalPointsTimesCredits / totalCredits).toFixed(2)
        : "0.00";

    return {
      gpa: calculatedGpa !== "0.00" ? calculatedGpa : profile?.gpa || "0.00",
      totalCredits,
      highest: highestSub,
    };
  }, [subjectRows, profile?.gpa]);

  useEffect(() => {
    if (!profile?.grade) {
      setLoadingRank(false);
      return;
    }

    async function calculateClassRank() {
      try {
        const q = query(
          collection(db, "student"),
          where("grade", "==", profile.grade),
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const peers = snapshot.docs.map((d) => ({
            id: d.id,
            subjects: Array.isArray(d.data().subjects) ? d.data().subjects : [],
          }));

          const rankedPeers = peers
            .map((p) => {
              const scored = p.subjects.filter((s) => Number(s.score) > 0);
              const avg = scored.length
                ? scored.reduce((sum, s) => sum + Number(s.score), 0) /
                  scored.length
                : 0;
              return { id: p.id, avg };
            })
            .sort((a, b) => b.avg - a.avg);

          const myIndex = rankedPeers.findIndex((p) => p.id === user?.uid);
          setClassRankInfo({
            rank: myIndex !== -1 ? myIndex + 1 : 1,
            total: rankedPeers.length,
          });
        }
      } catch (err) {
        console.error("Error calculating class rank:", err);
      } finally {
        setLoadingRank(false);
      }
    }

    calculateClassRank();
  }, [profile?.grade, user?.uid]);

  const distribution = useMemo(() => {
    const aCount = subjectRows.filter((r) => r.letter === "A").length;
    const bCount = subjectRows.filter((r) => r.letter === "B").length;
    const cCount = subjectRows.filter((r) => r.letter === "C").length;
    const otherCount = subjectRows.filter((r) =>
      ["D", "E", "F"].includes(r.letter),
    ).length;

    const total = subjectRows.length || 1;

    return {
      aCount,
      bCount,
      cCount,
      otherCount,
      aPct: Math.round((aCount / total) * 100),
      bPct: Math.round((bCount / total) * 100),
    };
  }, [subjectRows]);

  const trendChartData = useMemo(() => {
    return subjectRows.map((s) => ({
      subject: s.name.substring(0, 8),
      points: s.points,
    }));
  }, [subjectRows]);

  const handleDownloadTranscript = () => {
    if (subjectRows.length === 0) return;

    let content = `==================================================\n`;
    content += `         EDUCORE OFFICIAL ACADEMIC TRANSCRIPT     \n`;
    content += `==================================================\n\n`;
    content += `Student Name: ${user?.displayName || "Student"}\n`;
    content += `Class/Grade:  ${profile?.grade || "N/A"}\n`;
    content += `Overall GPA:  ${overallStats.gpa}\n`;
    content += `Class Rank:   ${classRankInfo.rank} / ${classRankInfo.total}\n\n`;
    content += `--------------------------------------------------\n`;
    content += `COURSE                  SCORE   CREDITS   GRADE   POINTS\n`;
    content += `--------------------------------------------------\n`;

    subjectRows.forEach((row) => {
      const paddedName = row.name.padEnd(23, " ");
      const paddedScore = `${row.score}%`.padEnd(8, " ");
      const paddedCredits = `${row.credits}`.padEnd(10, " ");
      const paddedGrade = `${row.letter}`.padEnd(8, " ");
      content += `${paddedName}${paddedScore}${paddedCredits}${paddedGrade}${row.points.toFixed(
        1,
      )}\n`;
    });

    content += `--------------------------------------------------\n`;
    content += `TOTAL CREDITS EARNED: ${overallStats.totalCredits}\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${
      user?.displayName?.replace(/\s+/g, "_") || "Student"
    }_Transcript.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="results-page-container">
      <div className="results-header">
        <div className="results-header-title">
          <h2>Results & GPA</h2>
          <p>
            {profile?.grade ? `Class ${profile.grade} · ` : ""}
            First Term (in progress)
          </p>
        </div>

        <div className="results-header-controls">
          <div className="term-filter-pills">
            {["Term 1", "Term 2", "Full year"].map((term) => (
              <button
                key={term}
                type="button"
                className={`term-pill ${activeTerm === term ? "active" : ""}`}
                onClick={() => setActiveTerm(term)}
              >
                {term}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="download-transcript-btn"
            onClick={handleDownloadTranscript}
            disabled={subjectRows.length === 0}
          >
            <FaDownload />
            <span>Download transcript</span>
          </button>
        </div>
      </div>

      <div className="results-stats-grid">
        <div className="res-stat-card">
          <div className="res-stat-top">
            <div className="res-icon-bg gpa-bg">
              <FaChartLine />
            </div>
            <span className="res-trend-badge green">
              <FaArrowUp /> 0.12
            </span>
          </div>
          <div className="res-stat-body">
            <h3>{overallStats.gpa}</h3>
            <p>Overall GPA</p>
          </div>
        </div>

        <div className="res-stat-card">
          <div className="res-stat-top">
            <div className="res-icon-bg rank-bg">
              <FaAward />
            </div>
            <span className="res-trend-badge green">
              <FaArrowUp /> +1
            </span>
          </div>
          <div className="res-stat-body">
            <h3>
              {loadingRank
                ? "..."
                : `${classRankInfo.rank} / ${classRankInfo.total}`}
            </h3>
            <p>Class rank</p>
          </div>
        </div>

        <div className="res-stat-card">
          <div className="res-stat-top">
            <div className="res-icon-bg grade-bg">
              <FaTrophy />
            </div>
            {overallStats.highest && (
              <span className="res-highlight-badge">
                <FaStar /> {overallStats.highest.name}
              </span>
            )}
          </div>
          <div className="res-stat-body">
            <h3>{overallStats.highest?.letter || "N/A"}</h3>
            <p>Highest grade</p>
          </div>
        </div>

        <div className="res-stat-card">
          <div className="res-stat-top">
            <div className="res-icon-bg credit-bg">
              <FaGraduationCap />
            </div>
            <span className="res-status-badge">on track</span>
          </div>
          <div className="res-stat-body">
            <h3>{overallStats.totalCredits}</h3>
            <p>Credits earned</p>
          </div>
        </div>
      </div>

      <div className="results-content-split">
        <div className="grade-report-card">
          <div className="report-card-header">
            <h3>Grade report — {activeTerm}</h3>
            <span className="courses-count-text">
              {subjectRows.length}{" "}
              {subjectRows.length === 1 ? "course" : "courses"}
            </span>
          </div>

          {subjectRows.length === 0 ? (
            <div className="report-empty-state">
              No subjects or grades assigned to your profile yet.
            </div>
          ) : (
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>COURSE</th>
                    <th>GRADE</th>
                    <th>SCORE</th>
                    <th>CREDITS</th>
                    <th>GPA POINTS</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectRows.map((row, idx) => (
                    <tr key={`${row.name}-${idx}`}>
                      <td className="course-name-cell">{row.name}</td>
                      <td>
                        <span className={`res-grade-pill ${row.colorClass}`}>
                          {row.letter}
                        </span>
                      </td>
                      <td className="score-cell">{row.score}%</td>
                      <td className="credits-cell">{row.credits}</td>
                      <td className="points-cell">{row.points.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="results-right-column">
          <div className="gpa-trend-card">
            <h3>GPA trend</h3>
            {trendChartData.length === 0 ? (
              <div className="chart-empty-state">No score data yet</div>
            ) : (
              <div className="trend-chart-wrapper">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="points"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#2563eb" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grade-distribution-card">
            <h3>Grade distribution</h3>

            {subjectRows.length === 0 ? (
              <div className="chart-empty-state">No grades available</div>
            ) : (
              <div className="distribution-body">
                <div
                  className="distribution-donut-ring"
                  style={{
                    background: `conic-gradient(
                      #16a34a 0% ${distribution.aPct}%,
                      #2563eb ${distribution.aPct}% ${
                        distribution.aPct + distribution.bPct
                      }%,
                      #e2e8f0 ${distribution.aPct + distribution.bPct}% 100%
                    )`,
                  }}
                >
                  <div className="donut-center-hole" />
                </div>

                <div className="distribution-legend">
                  <div className="legend-row">
                    <span className="dot dot-a" />
                    <span className="legend-label">
                      <strong>A range</strong> {distribution.aCount}{" "}
                      {distribution.aCount === 1 ? "course" : "courses"}
                    </span>
                  </div>

                  <div className="legend-row">
                    <span className="dot dot-b" />
                    <span className="legend-label">
                      <strong>B range</strong> {distribution.bCount}{" "}
                      {distribution.bCount === 1 ? "course" : "courses"}
                    </span>
                  </div>

                  {distribution.cCount > 0 && (
                    <div className="legend-row">
                      <span className="dot dot-c" />
                      <span className="legend-label">
                        <strong>C range</strong> {distribution.cCount}{" "}
                        {distribution.cCount === 1 ? "course" : "courses"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
