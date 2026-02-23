// src/components/Navbar.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const LOGOUT_ENDPOINT = "/api/auth/logout";
const ME_ENDPOINT = "/api/auth/me";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();
  const location = useLocation();
  const abortRef = useRef(null);

  const base = "http://localhost:5000";
  const api = axios.create({
    baseURL: base,
    headers: { Accept: "application/json" },
  });

  const validateToken = useCallback(
    async (signal) => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      try {
        const res = await api.get(ME_ENDPOINT, {
          signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const profile = res?.data?.user ?? res?.data ?? null;
        if (profile) {
          setIsLoggedIn(true);
          setUser(profile);
          try {
            localStorage.setItem("user", JSON.stringify(profile));
          } catch {}
        } else {
          setIsLoggedIn(true);
          setUser(null);
        }
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          err.response &&
          err.response.status === 401
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setUser(null);
        } else {
          setUser(null);
        }
      }
    },
    [api]
  );

  useEffect(() => {
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {}
    }
    const controller = new AbortController();
    abortRef.current = controller;
    validateToken(controller.signal);

    return () => {
      try {
        controller.abort();
      } catch {}
      abortRef.current = null;
    };
  }, [validateToken]);

  useEffect(() => {
    const handleStorageChange = (ev) => {
      if (ev.key === "token" || ev.key === "user") {
        if (abortRef.current) {
          try {
            abortRef.current.abort();
          } catch {}
        }
        const controller = new AbortController();
        abortRef.current = controller;
        validateToken(controller.signal);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [validateToken]);

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await api.post(
          LOGOUT_ENDPOINT,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 2000,
          }
        );
      } catch {}
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);

    navigate("/", { replace: true });
  }, [api, navigate]);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, [location]);

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <nav aria-label="Main navigation" className="bg-white shadow-md fixed top-0 left-0 right-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer"
          >
            <img
              src="/src/assets/logocar.png"
              alt="Karzone logo"
              className="h-10 w-auto"
            />
            <span className="ml-2 text-xl font-bold text-gray-800">KARZONE</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <div
              onClick={() => navigate("/")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                isActive("/") ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
              }`}
            >
              Home
            </div>
            <div
              onClick={() => navigate("/vendors")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                isActive("/vendors") ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
              }`}
            >
              Vendors
            </div>
            <div
              onClick={() => navigate("/cars")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                isActive("/cars") ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
              }`}
            >
              Cars
            </div>
            <div
              onClick={() => navigate("/contact")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                isActive("/contact") ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
              }`}
            >
              Contact
            </div>
            <div
              onClick={() => navigate("/bookings")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                isActive("/bookings") ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
              }`}
            >
              My Bookings
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <div
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-gray-600 hover:text-orange-500 text-sm font-medium cursor-pointer transition-colors"
                >
                  Login
                </div>
                <div
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
                >
                  Sign Up
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => navigate("/menu")}
              className="text-gray-600 hover:text-orange-500 p-2"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
