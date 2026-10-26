import "../layout/footer.css";
import mySchoolLogo from "../../assets/images/smslogo.png";
import { Link } from "react-router-dom";

function Footer() {
   const currentYear = new Date().toLocaleDateString("en-US", {
    year: "numeric",
  });
  return (
    <div className="footer">
      <div className="footer-contents">
        <div className="footer-first">
          <div className="footer-first-first">
            <img src={mySchoolLogo} alt="footer-logo" className="footer-logo" />
            <p>
              A centralized platform connecting students, teachers and
              administrators  making everyday school activities easier to
              manage.
            </p>
          </div>

          <div className="footer-first-second">
            <h4>PLATFORM</h4>
            <p><Link to="/login">Admin Login</Link></p>
           <p><Link to="/login">Teacher Login</Link></p>
            <p><Link to="/login">Student Login</Link></p>
          </div>
          <div className="footer-first-third">
            <h4>COMPANY</h4>
            <p> <a href="#feature-cards"> About Us </a></p>
            <p>Contact</p>
          </div>
          <div className="footer-first-third">
            <h4>Legal</h4>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>

        <div className="footer-second">
            <div className="footer-second-divisor"></div>
            <div className="footer-second-texts">
                <p>© {currentYear} EDUCORE School Management Platform</p>
                <p>Built with ❤️ for education in Africa</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
