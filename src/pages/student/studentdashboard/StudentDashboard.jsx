import {
  FaAtom,
  FaCalendarCheck,
  FaChartLine,
  FaClipboardList,
  FaCreditCard,
  FaDna,
  FaDownload,
  FaFlask,
  FaLanguage,
} from "react-icons/fa";
// import DashboardanalysisCard from "../../../components/common/DashboardanalysisCard";
 
import { useAuth } from "../../../context/AuthContext";

import "../studentdashboard/studentdashboard.css";
import StudentStatCard from "../../../components/student/StudentStatCard";
import StudentPerformanceChart, {
  AttendanceChart,
} from "../../../components/common/StudentPerformanceChart";
import { FaCalculator } from "react-icons/fa6";

export default function StudentDashboard() {
  const { user } = useAuth();

  const firstName = user?.displayName?.split(" ")[0];

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
 
  const courseProgress = [
    { course: "mathmematics", progress: "80" },
    { course: "English", progress: "75" },
    { course: "chemistry", progress: "90" },
    { course: "physics", progress: "60" },
    { course: "biology", progress: "20" },
  ];
  return (
    <div className="studashboardcontents-container">
      <section className="greeting-section">
        <div className="dashboard-welcome-message">
          <h1>Welcome back, {firstName}👋</h1>
          <p>
            {formattedDate}· Here's what's happening in your academics today.
          </p>
        </div>
        <div className="action-button">
          <button className="dashoboard-welcome-download">
            <FaDownload /> Download Report{" "}
          </button>
          <button className="dashoboard-welcome-payfees">
            {" "}
            <FaCreditCard /> Pay fees{" "}
          </button>
        </div>
      </section>

      <section className="statcard-section">
        <StudentStatCard icon=<FaChartLine /> digit="3.78" text="Overall GPA" />
        <StudentStatCard
          icon=<FaCalendarCheck />
          digit="96.2%"
          text="Attendance rate"
        />
        <StudentStatCard
          icon=<FaClipboardList />
          digit="5"
          text="Pending assignment"
        />
        <StudentStatCard
          icon=<FaCreditCard />
          digit="$450"
          text="Fees Outstanding"
        />
      </section>

      <section className="performancestat-section">
        <div className="studentchart-container">
          <StudentPerformanceChart />
          <div className="course-progress-container">
            <div className="course-progress-titles">
              <h4>course progress</h4>
              <h5>View all courses</h5>
            </div>
            <div className="course-math-container">
              <div className="course-math-text-contents">
                <span>
                  <FaCalculator />{" "}
                </span>
                <div className="course-math-text">
                  <h5>Mathematics</h5>
                  <p>Dr.Oyekale</p>
                </div>
              </div>
              <div className="course-math-progress-container">
                <div className="progress" style={{ width: "100%" }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${courseProgress[0].progress}%` }}
                  ></div>{" "}
                  <span
                    style={{
                      color: "#7774A7",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {courseProgress[0].progress}%
                  </span>
                </div>
              </div>
            </div>
            <div className="course-english-container">
              <div className="course-math-text-contents">
                <span>
                  <FaLanguage />{" "}
                </span>
                <div className="course-math-text">
                  <h5>English</h5>
                  <p>Prof.Jokotijesu</p>
                </div>
              </div>
              <div className="course-math-progress-container">
                <div className="progress" style={{ width: "100%" }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${courseProgress[1].progress}%` }}
                  ></div>{" "}
                  <span
                    style={{
                      color: "#7774A7",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {courseProgress[1].progress}%
                  </span>
                </div>
              </div>
            </div>
            <div className="course-math-container">
              <div className="course-math-text-contents">
                <span>
                  <FaFlask />{" "}
                </span>
                <div className="course-math-text">
                  <h5>Chemistry</h5>
                  <p>Dr.PraiseGod</p>
                </div>
              </div>
              <div className="course-math-progress-container">
                <div className="progress" style={{ width: "100%" }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${courseProgress[2].progress}%` }}
                  ></div>{" "}
                  <span
                    style={{
                      color: "#7774A7",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {courseProgress[2].progress}%
                  </span>
                </div>
              </div>
            </div>
            <div className="course-math-container">
              <div className="course-math-text-contents">
                <span>
                  <FaAtom />{" "}
                </span>
                <div className="course-math-text">
                  <h5>Physics</h5>
                  <p>Prof.Gideon</p>
                </div>
              </div>
              <div className="course-math-progress-container">
                <div className="progress" style={{ width: "100%" }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${courseProgress[3].progress}%` }}
                  ></div>{" "}
                  <span
                    style={{
                      color: "#7774A7",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {courseProgress[3].progress}%
                  </span>
                </div>
              </div>
            </div>
            <div className="course-math-container">
              <div className="course-math-text-contents">
                <span>
                  <FaDna />{" "}
                </span>
                <div className="course-math-text">
                  <h5>Biology</h5>
                  <p>Dr.Ayantade</p>
                </div>
              </div>
              <div className="course-math-progress-container">
                <div className="progress" style={{ width: "100%" }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${courseProgress[4].progress}%` }}
                  ></div>{" "}
                  <span
                    style={{
                      color: "#7774A7",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {courseProgress[4].progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="attendance-section">
          <AttendanceChart />
        </div>
      </section>
    </div>
  );
}
