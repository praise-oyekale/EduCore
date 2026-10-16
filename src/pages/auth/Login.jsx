import { Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import Welcome from "../../components/common/WelcomeLogin";
import "../auth/login.css";

function Login() {
  return (
    <div className="login-container">
      <div className="login-contents">
        <Welcome />
        <div className="login-details">
            <h1>Welcome back</h1>
            <p className="subtopic-login">sign in to continue to your  school portal</p>
          
            <LoginForm />
            <p className="have-account">Already have an account? {" "} <Link to="/signup" style={{textDecoration: "none", fontSize: "17px", fontWeight: 'bold', }}> Signup</Link> </p>
        </div>
      </div> 
    </div>
  );
}

export default Login;
