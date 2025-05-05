import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import Logo from "../../assets/logo.png";
import "./Auth.css";

export const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const user = { username, password };
  
    try {
      const response = await axios.post("http://localhost:5000/auth/signup", user);
  
      if (response.status === 201) {
        navigate("/login");
      }
    } catch (error) {
      if (error.response && error.response.data.message === "User already exists!") {
        setShowError(true);
      }
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-container">
        <div className="auth-logo">
          <RouterLink to="/">
            <img src={Logo} alt="Logo" className="auth-logo-image" />
          </RouterLink>
        </div>
        <h2>Create your account</h2>
        <div className="auth-form-control">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="auth-form-control">
          <label htmlFor="password">Password</label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {showError && <div className="auth-error">The user already exists!</div>}
        <button type="submit" className="auth-submit-btn">Sign Up</button>
        <div className="auth-footer">
          <p>Already a user? <RouterLink to="/login" className="auth-link">Login</RouterLink></p>
        </div>
      </div>
    </form>
  );
};

export default Signup;
