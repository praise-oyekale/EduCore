import {  useEffect, useState } from "react";
import Input from "../common/Input";
import "../auth/loginform.css";
import {  LoginAuth } from "../../services/authService";
import Loader from "../common/Loader";
import { Alert } from "../common/Alert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function LoginForm() {

  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)
  const {user, role } = useAuth();
  // const navigate = useNavigate();

  useEffect(() => {
    if (user && role) {
      if (role === "admin") {
        navigate("/admin");
      }else if (role === "teacher"){
        navigate("/teacher");
      }else {
        navigate("/student");
      }
    }
  },[user, role, navigate]);

  function validateEmail(email) {
    if (!email.trim()) {
      return "Email is required";
    }
    if (!email.includes("@")) {
      return "Please enter a valid email address";
    }
    return "";
  }

  function validatePassword(password) {
    if (!password.trim()) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
        setLoading(true)

        const user = await LoginAuth(email, password);

        console.log("Logged in:", user);
        
    } catch (error) {
        setAuthError(error.message)
    } finally {
        setLoading(false)
    }

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    setEmail("")
    setPassword("")

    // navigate("/student")
  }
  return (
    <>
    {authError && <Alert message={authError}/>}
    <form onSubmit={handleSubmit}>
      <Input
        label="Email or Username"
        type="email"
        name="email"
        placeholder="Enter your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
      />

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={passwordError}
      />
      <div className="forgot-password">
        <p>Remember me</p>
        <p>Forgot password?</p>
      </div>

      <button className="loggin-btn" type="submit">
        {loading ? "Loging in...": "login in securely"}
      </button>
      {loading && <Loader text = "signin you in..." /> }
    </form>
    </>
  );
}

export default LoginForm;
