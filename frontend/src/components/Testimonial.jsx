import React from "react";
import { testimonialStyles as styles } from "../assets/dummyStyles";
import testimonials from "../assets/Testimonialdata";
import { FaCar, FaQuoteLeft, FaStar } from "react-icons/fa";
import { GiSteeringWheel } from "react-icons/gi";

const Testimonial = () => {
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>

        {/* ================= HEADING SECTION ================= */}
        <div className={`${styles.headingContainer} flex flex-col items-center text-center gap-4`}>

          {/* Badge */}
          <div className={styles.badge}>
            <FaCar className={`${styles.quoteIcon} mr-2`} />
            <span className={styles.badgeText}>Customer Experience</span>
          </div>

          {/* Title */}
          <h1
            className={`font-schabo ${styles.title}`}
            style={{ letterSpacing: "0.1em" }}
          >
            Premium <span style={{ letterSpacing: "0.1em" }}>Drive</span> Experiences
          </h1>


          {/* Divider */}
          <div className={`${styles.dividerContainer} flex items-center justify-center`}>
            <div className={styles.dividerLine} />
            <GiSteeringWheel className={`${styles.accentText} mx-4`} size={24} />
            <div className={styles.dividerLine} />
          </div>

          <p className={styles.subtitle}>
            Discover the joy of premium driving with our exceptional fleet
          </p>
        </div>

        {/* ================= TESTIMONIAL CARDS ================= */}
        <div className={styles.grid}>
          {testimonials.map((t, index) => {
            const shape = styles.cardShapes[index % styles.cardShapes.length];
            const IconComponent = styles.icons[index % styles.icons.length];

            return (
              <div
                key={t.id}
                className={`${styles.card} ${shape}`}
                style={{
                  clipPath:
                    "polygon(0% 10%, 10% 0%, 100% 0%, 100% 90%, 90% 100%, 0% 100%)",
                  background:
                    "linear-gradient(145deg, rgba(30,30,40,0.8), rgba(20,20,30,0.8))",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(100,100,120,0.2)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              >
                <div className={styles.cardContent}>

                  {/* Quote + Rating */}
                  <div className="flex justify-between items-start mb-6">
                    <FaQuoteLeft className={styles.quoteIcon} size={28} />

                    <div className={styles.ratingContainer}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={18}
                          className={`${i < t.rating ? styles.accentText : "text-gray-700"} ${styles.star}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <p className={styles.comment}>{t.comment}</p>

                  {/* Car Info */}
                  <div className={styles.carInfo}>
                    <GiSteeringWheel className={styles.carIcon} size={20} />
                    <span className={styles.carText}>{t.car}</span>
                  </div>

                  {/* Author */}
                  <div className={styles.authorContainer}>
                    <div className={styles.avatar}>
                      {t.name.charAt(0)}
                    </div>

                    <div className={styles.authorInfo}>
                      <h4 className={styles.authorName}>{t.name}</h4>
                      <p className={styles.authorRole}>{t.role}</p>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className={styles.decorativeCorner} />
                <div className={styles.patternIcon}>
                  <IconComponent size={36} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= STATS SECTION ================= */}
        <div className={styles.statsContainer}>
          <div className={styles.statsGrid}>

            <div className={styles.statItem}>
              <div className={`${styles.statValue} ${styles.statColors.value[0]} font-schabo`}>
                10K+
              </div>
              <div className={`${styles.statLabel} ${styles.statColors.label[0]}`}>
                Happy Customers
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={`${styles.statValue} ${styles.statColors.value[1]} font-schabo`}>
                250+
              </div>
              <div className={`${styles.statLabel} ${styles.statColors.label[1]}`}>
                Luxury Cars
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={`${styles.statValue} ${styles.statColors.value[2]} font-schabo`}>
                24/7
              </div>
              <div className={`${styles.statLabel} ${styles.statColors.label[2]}`}>
                Support
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={`${styles.statValue} ${styles.statColors.value[3]} font-schabo`}>
                50+
              </div>
              <div className={`${styles.statLabel} ${styles.statColors.label[3]}`}>
                Locations
              </div>
            </div>

          </div>
        </div>

        {/* ================= CTA SECTION ================= */}
        <div className={styles.ctaContainer}>
          <h2
            className={`font-schabo ${styles.ctaTitle}`}
            style={{ letterSpacing: "0.05em", fontWeight: 500 }}>
            Ready for Your Next Adventure?
          </h2>

          <p
            className={`font-schabo ${styles.ctaText}`}
            style={{ letterSpacing: "0.08em", fontWeight: 400, lineHeight: "1.7" }}>
            Experience the thrill of driving with our premium car rentals.
            Book your dream car today!
          </p>

          <a
            href="/cars"
            className={`font-schabo ${styles.ctaButton}`}
            style={{ letterSpacing: "0.05em", fontWeight: 500 }}>
            Book Now
          </a>

        </div>

      </div>

      {/* Bottom Gradient */}
      <div className={styles.bottomGradient} />
    </div>
  );
};

export default Testimonial;
