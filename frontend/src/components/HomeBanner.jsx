// src/components/HomeBanner.jsx
import React, { useEffect, useRef, useState } from "react";
import img1 from "../assets/hero.png";
import { heroStyles as styles } from "../assets/dummyStyles";
import "../styles/seeFleetButton.css";
import { useNavigate } from "react-router-dom";

export default function HomeBanner() {
  const wrapRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const navigate = useNavigate();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      setMouse({ x, y });
      el.style.setProperty("--mx", x);
      el.style.setProperty("--my", y);
    };

    const onLeave = () => {
      setMouse({ x: 0.5, y: 0.5 });
      el.style.setProperty("--mx", 0.5);
      el.style.setProperty("--my", 0.5);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const maxTranslate = 14;
  const tx = (mouse.x - 0.5) * 2 * maxTranslate;
  const ty = (mouse.y - 0.5) * 2 * (maxTranslate * 0.55);

  return (
    <div ref={wrapRef} className={styles.container}>
      {/* Background */}
      <div
        className={styles.background}
        style={{
          transform: `translate3d(${tx * 0.55}px, ${ty * 0.55}px, 0) scale(1.03)`,
          transition: "transform 220ms cubic-bezier(.2,.9,.25,1)",
        }}
      >
        <img src={img1} alt="Futuristic car" className="w-full opacity-95" />
        <div className={styles.gradientOverlay} />
      </div>

      {/* CTA */}
      <div className={styles.ctaContainer}>
        <div className={styles.ctaCard}>
          <div>
            <p className={styles.subtitle}>Welcome to AutoVerse</p>
            <h3 className={styles.title}>
              Next gen fleet. Instant drive.
            </h3>
            <p className={styles.description}>
              Rent your dream car. Transparent pricing. Book in seconds.
            </p>
          </div>

          {/* 🔥 Integrated Uiverse Button */}
          <button
            className="see-fleet-btn"
            onClick={() => navigate("/cars")}
          >
            <span className="text">SEE FLEET</span>
            <span className="svg">
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14M13 5l6 7-6 7" />
              </svg>
            </span>
          </button>

          <span aria-hidden className={styles.outline} />
        </div>
      </div>
    </div>
  );
}
