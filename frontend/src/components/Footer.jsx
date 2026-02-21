import React from 'react'
import { footerStyles as styles } from '../assets/dummyStyles'
import logo from '../assets/logocar.png'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaFacebookF, FaInstagram, FaLinkedinIn, FaMapMarkedAlt, FaPhone, FaTwitter, FaYoutube } from 'react-icons/fa'
import { GiCarKey } from 'react-icons/gi'

const Footer = () => {
  return (
    <footer className={styles.container}>
      <div className={styles.topElements}>
        <div className={styles.circle1}/>
        <div className={styles.circle2}/>
        <div className={styles.roadLine}/>
      </div>

        <div className={styles.innerContainer}>
            <div className={styles.grid}>
                <div className={styles.brandSection}>
                    <Link to='/' className="flex items-center">
                <div className={styles.logoContainer}>
                    <img src={logo} alt='logo' className='h-[1em] w-auto block' style={{display: "block", objectFit: "contain"}}/>
                    <span className={styles.logoText}>KARZO</span>
                </div>
                    </Link>
                    <p className={styles.description}>
                        Your trusted partner for premium car rentals, delivering exceptional driving experiences with top-notch vehicles and unparalleled service.
                    </p>

                    <div className={styles.socialIcons}>
                        {
                            [FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube].map((Icon, index) => (
                                <a href='/' key={index} className={styles.socialIcon}>
                                    <Icon />
                                </a>
                            ))
                        }
                    </div>

                </div>

                {/* Quick Links */}
                <div>
                    <h3 className={styles.sectionTitle}>
                        Quick Links
                        <span className={styles.underline}/>
                    </h3>
                    <ul className={styles.linkList}>
                        {["Home", "Cars", "Contact Us"].map((link, i) => (
                            <li key={i}>
                                <a
                                href={
                                    link === "Home"
                                    ? "/"
                                    : link === "Contact Us"
                                    ? "/contact"
                                    : "/cars"
                                }
                                className={styles.linkItem}
                                >
                                <span className={styles.bullet}></span>
                                {link}
                                </a>
                            </li>
                            ))}
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className={styles.sectionTitle}>
                        Contact Info
                        <span className={styles.underline}/>
                    </h3>
                    <ul className={styles.contactList}>
                        <li className={styles.contactItem}>
                            <FaMapMarkedAlt className={styles.contactIcon}/>
                            <span>New Panvel</span>
                        </li>
                        <li className={styles.contactItem}>
                            <FaPhone className={styles.contactIcon}/>
                            <span>+91 9860173503</span>
                        </li>
                        <li className={styles.contactItem}>
                            <FaEnvelope className={styles.contactIcon}/>
                            <span>trifittrio333@gmail.com</span>
                        </li>
                    </ul>

                    <div className={styles.hoursContainer}>
                        <h4 className={styles.hoursTitle}>Opening Hours</h4>
                        <div className={styles.hoursText}>
                            <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                            <p>Saturday: 9:00 AM - 6:00 PM</p>
                            <p>Sunday: 10:00 AM - 4:00 PM</p>
                        </div>
                    </div>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className={styles.sectionTitle}>
                        Newsletter
                        <span className={styles.underline}/>
                    </h3>
                    <p className={styles.newsletterText}>
                        Subscribe to our newsletter for the latest updates and offers.
                    </p>
                    <form className='space-y-3'>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className={styles.input}
                        />
                        <button type="submit" className={styles.subscribeButton}>
                            <GiCarKey className='mr-2 text-lg sm:text-xl'/>
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className={styles.footerBottom}>
                <p className={styles.copyText}>
                    &copy; {new Date().getFullYear()} KARZO. All rights reserved.
                </p>
            </div>

        </div>
    </footer>
  )
}

export default Footer;
