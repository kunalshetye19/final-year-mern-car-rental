import React, { useEffect, useState } from "react";
import { loginStyles } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/logocar.png";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const base = "http://localhost:5000";
      const url = `${base}/api/auth/forgot-password`;

      const res = await axios.post(
        url,
        { email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status >= 200 && res.status < 300) {
        setEmailSent(true);
        toast.success(res.data.message || "Password reset email sent!", {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Forgot password error (frontend):", err);
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
        toast.error(err.message || "Failed to send reset email", {
          theme: "colored",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className={`${loginStyles.pageContainer} relative`}>
      {/* Animated Background */}
      <div
        className={`${loginStyles.animatedBackground.base} pointer-events-none`}
      >
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
        onClick={handleBackToLogin}
      >
        <FaArrowLeft className="text-sm sm:text-base" />
        <span className="font-medium text-xs sm:text-base">Back to Login</span>
      </div>

      {/* Forgot Password Card */}
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
            <h1 className={loginStyles.loginCard.title}>
              {emailSent ? "Check Your Email" : "Forgot Password"}
            </h1>
            <p className={loginStyles.loginCard.subtitle}>
              {emailSent
                ? "A new password has been sent to your email"
                : "Enter your registered email to reset your password"}
            </p>
          </div>

          {/* Form */}
          {!emailSent && (
            <form onSubmit={handleSubmit} className={loginStyles.form.container}>
              {/* Email */}
              <div className={loginStyles.form.inputContainer}>
                <div className={loginStyles.form.inputWrapper}>
                  <div className={loginStyles.form.inputIcon}>
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your Email"
                    required
                    className={loginStyles.form.input}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={loginStyles.form.submitButton}
              >
                <span className={loginStyles.form.buttonText}>
                  {loading ? "SENDING..." : "SEND NEW PASSWORD"}
                </span>
                <div className={loginStyles.form.buttonHover} />
              </button>
            </form>
          )}

          {/* Success Message */}
          {emailSent && (
            <div className="text-center mt-4">
              <p className="text-green-600 font-medium mb-4">
                Please check your email for the new password.
              </p>
              <button
                onClick={handleBackToLogin}
                className={loginStyles.form.submitButton}
              >
                <span className={loginStyles.form.buttonText}>
                  BACK TO LOGIN
                </span>
                <div className={loginStyles.form.buttonHover} />
              </button>
            </div>
          )}

          {/* Signup */}
          <div className={loginStyles.signupSection}>
            <p className={loginStyles.signupText}>
              Remember your password?
              <a href="/login" className={loginStyles.signupLink}>
                {" "}
                Login
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

export default ForgotPassword;
