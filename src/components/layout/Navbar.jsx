import "../layout/navbar.css";
import mySchoolLogo from "../../assets/images/smslogo.png";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
function Navbar() {
  return (
    <div className="nav-container">
      <img src={mySchoolLogo} alt="nav-logo" className="nav-logo" />
      <div className="nav-features-container">
        <h3 className="nav-feature-text"><a  href="#feature-cards">Features</a></h3>
        <h3 className="nav-contact-text">Contacts</h3>
      </div>
      <div className="nav-buttons">
       
        <button className="nav-login">
          <Link
            to="/login"
            style={{ textDecoration: "none", color: "var(--color-text)" }}
          >
            Login{" "}
          </Link>
        </button>
         <button className="nav-signup">
          {" "}
          <Link
            to="/apply"
            style={{
              textDecoration: "none",
              color: "#d89522",
              fontWeight: "bold",
              display: "flex",
              alignItems: 'center',
              justifyContent: 'center',
              gap:'5px'
            }}
          >
            {" "}
            Apply <span><FaArrowRight style={{marginTop: '3px'}} /></span>{" "}
          </Link>{" "}
        </button>   
      </div>
    </div>
  );
}

export default Navbar;
