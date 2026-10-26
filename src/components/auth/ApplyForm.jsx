import React, { useState } from "react";
import { Link } from "react-router-dom";
import { submitApplication } from "../../services/admissionService";
import Input from "../common/Input";
import Loader from "../common/Loader";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCheckCircle,
} from "react-icons/fa";
import "../auth/applyform.css";

const CLASSES = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
const capLetter = ["A","B","C","D","E","F","G","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]

export default function ApplyForm() {
  const [applicantType, setApplicantType] = useState("student");  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");


  const [grade, setGrade] = useState("");
  const [department, setDepartment] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");


  const [subjectsTaught, setSubjectsTaught] = useState("");

  
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);


  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [matchError, setMatchError] = useState("");

  function validateEmail(val) {
    if (!val.trim()) return "Email address is required";
    if (!val.includes("@") || !val.includes("."))
      return "Enter a valid email address";
    return "";
  }

  function validatePassword(val) {
    if (!val.trim()) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(val)) return "Password must contain at least one capital letter"
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const mErr = password !== confirmPassword ? "Passwords do not match" : "";

    setEmailError(eErr);
    setPasswordError(pErr);
    setMatchError(mErr);

    if (eErr || pErr || mErr) return;

    if (applicantType === "student" && !grade) {
      setError("Please select the class you are applying for.");
      return;
    }

    if (!isChecked) {
      setError("Please agree to the portal terms and conditions.");
      return;
    }

    try {
      setLoading(true);

      const applicationData = {
        applicantType,
        fullName,
        email,
        password,
        phoneNumber,
        grade: applicantType === "student" ? grade : "",
        department: applicantType === "student" ? department : "",
        guardianName: applicantType === "student" ? guardianName : "",
        guardianPhone: applicantType === "student" ? guardianPhone : "",
        subjectsTaught:
          applicantType === "teacher"
            ? subjectsTaught
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
      };

      await submitApplication(applicationData);
      setSubmitted(true);
    } catch (err) {
      console.error("Application error:", err);
      setError(
        err.message || "Unable to submit application. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="apply-success-card">
        <FaCheckCircle className="apply-success-icon" />
        <h2>Application Submitted!</h2>
        <p>
          Thank you, <strong>{fullName}</strong>. Your portal access request as
          a <strong>{applicantType}</strong> has been received.
        </p>
        <p className="apply-subtext">
          Our school administration will review your details alongside your
          physical admission records. Once approved, you will receive
          confirmation to log in.
        </p>
        <Link to="/login" className="apply-login-btn">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <form className="signup-form apply-form" onSubmit={handleSubmit}>
      {/* Role Toggle Selector */}
      <div className="applicant-type-toggle">
        <button
          type="button"
          className={`toggle-pill ${applicantType === "student" ? "active" : ""}`}
          onClick={() => {
            setApplicantType("student");
            setError("");
          }}
        >
          <FaGraduationCap /> Apply as Student
        </button>
        <button
          type="button"
          className={`toggle-pill ${applicantType === "teacher" ? "active" : ""}`}
          onClick={() => {
            setApplicantType("teacher");
            setError("");
          }}
        >
          <FaChalkboardTeacher /> Apply as Teacher
        </button>
      </div>

      {error && <div className="apply-form-error">{error}</div>}

      <Input
        label="FULL NAME"
        type="text"
        name="fullName"
        placeholder="Enter your full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <Input
        label="EMAIL ADDRESS"
        type="email"
        name="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        required
      />

      <div className="apply-grid-row">
        <Input
          label="PHONE NUMBER"
          type="tel"
          name="phoneNumber"
          placeholder="e.g. 08012345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        {applicantType === "student" ? (
          <div className="apply-select-group">
            <label>CLASS / GRADE APPLYING FOR</label>
            <select
              className="apply-select"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">Select class</option>
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <Input
            label="SUBJECT(S) TAUGHT"
            type="text"
            name="subjectsTaught"
            placeholder="e.g. Mathematics, Physics"
            value={subjectsTaught}
            onChange={(e) => setSubjectsTaught(e.target.value)}
          />
        )}
      </div>

      {/* Student Specific Fields */}
      {applicantType === "student" && (
        <>
          <div className="apply-grid-row">
            <Input
              label="DEPARTMENT (IF SENIOR SEC.)"
              type="text"
              name="department"
              placeholder="e.g. Science, Art, Commercial"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Input
              label="GUARDIAN NAME"
              type="text"
              name="guardianName"
              placeholder="Parent or Guardian name"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
            />
          </div>

          <Input
            label="GUARDIAN PHONE NUMBER"
            type="tel"
            name="guardianPhone"
            placeholder="Guardian contact phone"
            value={guardianPhone}
            onChange={(e) => setGuardianPhone(e.target.value)}
          />
        </>
      )}

      {/* Security Credentials */}
      <div className="apply-grid-row">
        <Input
          label="INTENDING PASSWORD"
          type="password"
          name="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
        />

        <Input
          label="CONFIRM PASSWORD"
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={matchError}
        />
      </div>

      <div className="terms">
        <input
          type="checkbox"
          id="terms"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
        />
        <label htmlFor="terms">
          I confirm that all provided details match my official school records.
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? (
          <Loader text="Submitting Application..." />
        ) : (
          "Submit Portal Application"
        )}
      </button>
    </form>
  );
}
