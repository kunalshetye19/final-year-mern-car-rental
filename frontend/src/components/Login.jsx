import React, { useEffect, useState } from "react";
import { loginStyles } from "../assets/dummyStyles";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/logocar.png";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [credentials, setCredentials] = React.useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit  = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

    const base = 'http://localhost:5000';
    const url = `${base}/api/auth/login`;

    const res = await axios.post(url, credentials, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.status >= 200 && res.status < 300) {
      const { token, user } = res.data || {};

      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

    toast.success("Login Successful! Welcome back", {
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      onClose: () => {
        const redirectPath = "/";
        navigate(redirectPath, { replace: true });
      },
      autoClose: 1000,
    });
  }
  else {
  toast.error('Unexpected server response during registration.', {
    theme: 'colored'
  });
}
    }
catch (err) {
      console.error("Login error (frontend):", err);
      if (err.response) {
        const serverMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
        toast.error(serverMessage, { theme: "colored" });
      } else if (err.request) {
        toast.error("No response from server — is backend running?", {
          theme: "colored",
        });
      } else {
        toast.error(err.message || "Login failed", { theme: "colored" });
      }
    }
    finally{
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`${loginStyles.pageContainer} relative`}>
      {/* Animated Background */}
      <div className={`${loginStyles.animatedBackground.base} pointer-events-none`}>
        <div
          className={`${loginStyles.animatedBackground.orb1} ${
            isActive ? "translate-x-20 translate-y-10" : ""
          }`}
        />
        <div
          className={`${loginStyles.animatedBackground.orb2} ${
            isActive ? "-translate-x-20 -translate-y-10" : ""
          }`}
        />
        <div
          className={`${loginStyles.animatedBackground.orb3} ${
            isActive ? "-translate-x-10 translate-y-20" : ""
          }`}
        />
      </div>

      {/* Back Button */}
      <div
        className={`${loginStyles.backButton} absolute top-4 left-4 z-20 cursor-pointer`}
        onClick={() => navigate("/")}
      >
        <FaArrowLeft className="text-sm sm:text-base" />
        <span className="font-medium text-xs sm:text-base">Back to Home</span>
      </div>

      {/* Login Card */}
      <div
        className={`${loginStyles.loginCard.container} ${
          isActive ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <div className={loginStyles.loginCard.formBox}>
          <div className={loginStyles.loginCard.decor1} />
          <div className={loginStyles.loginCard.decor2} />

          {/* Header */}
          <div className={loginStyles.loginCard.headerContainer}>
            <div className={loginStyles.loginCard.logoContainer}>
              <div className={loginStyles.loginCard.logoText}>
                <img
                  src={logo}
                  alt="logo"
                  className="h-[1em] w-auto block"
                  style={{ objectFit: "contain" }}
                />
                <span className="font-bold tracking-wider">KARZONE</span>
              </div>
            </div>
            <h1 className={loginStyles.loginCard.title}>Welcome Back</h1>
            <p className={loginStyles.loginCard.subtitle}>
              Please login to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={loginStyles.form.container}>
            {/* Email */}
            <div className={loginStyles.form.inputContainer}>
              <div className={loginStyles.form.inputWrapper}>
                <div className={loginStyles.form.inputIcon}>
                  <FaUser />
                </div>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  required
                  className={loginStyles.form.input}
                />
              </div>
            </div>

            {/* Password */}
            <div className={loginStyles.form.inputContainer}>
              <div className={loginStyles.form.inputWrapper}>
                <div className={loginStyles.form.inputIcon}>
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your Password"
                  required
                  className={loginStyles.form.input}
                />
                <div
                  onClick={togglePasswordVisibility}
                  className={loginStyles.form.passwordToggle}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className={loginStyles.form.submitButton}>
              <span className={loginStyles.form.buttonText}>
                {loading ? "SIGNING IN..." : "ACCESS PREMIUM GARAGE"}
              </span>
              <div className={loginStyles.form.buttonHover} />
            </button>
          </form>

          {/* Signup */}
          <div className={loginStyles.signupSection}>
            <p className={loginStyles.signupText}>
              Don't have an account?
              <a href="/signup" className={loginStyles.signupLink}>
                {" "}
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        toastStyle={{
          backgroundColor: "#fb923c",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(249, 115, 22, 0.25)",
        }}
      />
    </div>
  );
};

export default Login;
