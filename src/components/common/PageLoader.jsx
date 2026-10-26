import React from "react";
import schoollogo from "../../assets/images/smslogo.png";
import "./pageloader.css";

export function PageLoader() {
  return (
    <div className="page-loader-overlay">
      <div className="page-loader-content">
        <img src={schoollogo} alt="EduCore Logo" className="loader-logo" />
        <div className="loader-spinner" />
        <h3>EduCore</h3>
        <p>Loading application...</p>
      </div>
    </div>
  );
}