import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../ReduxToolkit/userSlice";
import axios from "axios";
import Logo from "../../assets/logo.png";
import "./Auth.css";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = { username, password };
    try {
      const response = await axios.post("https://cointracker-evt3.onrender.com/auth/login", user);


      if (response.data && response.data.token) {
        dispatch(
          setUser({
            username: response.data.username,
            token: response.data.token,
            userId: response.data.userId,
            role: response.data.role, 
          })
        );
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: response.data.username,
            token: response.data.token,
            userId: response.data.userId,
            role: response.data.role,
          })
        );
        navigate("/");
      } else {
        setShowError(true);
      }
    } catch (error) {
      setShowError(true);
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
        <h2>Log in to your account</h2>
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
        {showError && <div className="auth-error">Username or password did not match!</div>}
        <button type="submit" className="auth-submit-btn">Log in</button>
        <div className="auth-footer">
          <p>Don't have an account yet? <RouterLink to="/signup" className="auth-link">Sign Up</RouterLink></p>
        </div>
      </div>
    </form>
  );
};

export default Login;
