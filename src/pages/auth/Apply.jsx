import React from "react";
import { Link } from "react-router-dom";
import ApplyForm from "../../components/auth/ApplyForm";
import Welcome from "../../components/common/WelcomeLogin";
import "../auth/apply.css";

export default function Apply() {
  return (
    <div className="signup-container">
      <div className="signup-contents">
        <div className="signup-pagewelcome">
          <Welcome />
        </div>

        <div className="signup-details"> 
          <h1>Portal Access Application</h1>
          <p>Submit your details for verification by school administration</p>
          
          <ApplyForm />

          <p>
            Already have an active account?{" "}
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                fontSize: "17px",
                fontWeight: "bold",
              }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}