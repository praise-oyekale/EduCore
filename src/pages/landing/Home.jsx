import { Form, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import "../landing/home.css";
import FeatureCard from "../../components/common/FeatureCard";
import adimDash from "../../assets/images/admin-dash.png";
import resultsms from "../../assets/images/resultsms.png";
import teacherDash from "../../assets/images/teacher-dash.png";
import smslogin from "../../assets/images/sms-login.jpeg";
import paymentsms from "../../assets/images/payment.png";
import Footer from "../../components/layout/Footer";

import { useEffect, useState } from "react";



import schoolHero from "../../assets/images/school-campus-students.jpg";
import studentsHero from "../../assets/images/students-library-study.jpg";
import classroomHero from "../../assets/images/teacher-classroom.jpg";

// import { FaArrowRight } from "react-icons/fa";

function Home() {
  const heroImages = [schoolHero, studentsHero, classroomHero];

  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHero((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <section className="hero">
        <div
          key={activeHero}
          className="hero-background"
          style={{
            backgroundImage: `
        linear-gradient(
          90deg,
          rgba(6, 13, 31, 0.92) 0%,
          rgba(6, 13, 31, 0.72) 50%,
          rgba(6, 13, 31, 0.45) 100%
        ),
        url("${heroImages[activeHero]}")
      `,
          }}
        />
        <div className="hero-content">
          <div className="welcome-message">👨‍👩‍👦‍👦WELCOME BACK TO SCHOOL</div>
          <div className="hero-messages">
            <h1 className="hero-heading">
              Simplify Your School{" "}
              <span style={{ color: "  #E1B153" }}>Experience</span>
            </h1>
            <p className="hero-description">
              A centralized platform designed to connect students, teachers, and
              adminstrators, making everyday school activies easier to manage.
            </p>
          </div>
          <div className="hero-buttons">
            <button className="hero-signup">
              <Link
                to="/apply"
                style={{ textDecoration: "none", color: "white" }}
              >
                Get Started
              </Link>
            </button>
            <div>
              Already have an account?
              <Link to="/login" className="mobilehero-login">
                {" "}
                Login{" "}
              </Link>{" "}
            </div>
          </div>
        </div>
      </section>
      <section className="statistics">
        <div className="statistics-content">
          <div className="student-stats">
            <h2>1.5K+</h2>
            <p>Students</p>
          </div>
          <div className="student-stats">
            <h2>500+</h2>
            <p>Teachers</p>
          </div>
          <div className="student-stats">
            <h2>3.5K+</h2>
            <p>Graduates</p>
          </div>
        </div>
      </section>
      <section className="features" id="feature-cards">
        <div className="features-content">
          <h3 style={{ color: "#C9963A" }}>What we offer</h3>
          <h1>
            Everything In <span style={{ color: "#C9963A" }}>one Place</span>
          </h1>
          <div className="features-card">
            <FeatureCard
              image={adimDash}
              title="Adminstrators Dashboard"
              description="Manage Users, Departments and School Activities with simplicity. Provide a centralized platform for managing users, monitiring activities, viewing key analytics, and controlling different aspects of an application through an intuitive and user-friendly interface."
            />
            <FeatureCard
              image={resultsms}
              title="Students & Classes"
              description="Manage student records and academic performance from one centralized platform. Manage enrolment, class rosters, student profiles, and parent contacts from one dashboard."
            />
            <FeatureCard
              image={teacherDash}
              title="Teachers"
              description="A secure and intuitive dashborad that eneables teachers to manager assigned classes, subjects and academic results. Manage teacher information, responsibilities, and axademic activies effciently. "
            />
            <FeatureCard
              image={smslogin}
              title="Security and Privacy"
              description="Protect sensitive student, teacher, academic, and financial information through secure authentication and controlled access."
            />
            <FeatureCard
              image={paymentsms}
              title="Fee Management"
              description="Easily manage and monitor school fees payments. Administrators can track payment records, view outstanding balances, manage payment information, and maintain accurate financial records for students"
            />
            <FeatureCard
              image={smslogin}
              title="SMS to Parents"
              description="Send fee reminders, attendance alerts, and updates directly to parents via SMS."
            />
          </div>
        </div>
      </section>

      <section className="get-started-section">
        <div className="getstarted-content">
          <h3 style={{ color: "#C9963A" }}>What we offer</h3>
          <h1>
            Transform Your{" "}
            <span style={{ color: "#C9963A" }}>
              School Management Experirnce
            </span>
          </h1>
          <p>
            Modearn tools designed to make school administration more efficient.
            from student result and school fees management. Keeping everything
            organized in one place
          </p>
          <button className="hero-signup" style={{ marginTop: "40px" }}>
            <Link
              to="/apply"
              style={{ textDecoration: "none", color: "black" }}
            >
              Get Started
            </Link>
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
