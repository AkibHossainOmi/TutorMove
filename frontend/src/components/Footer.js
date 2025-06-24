import React from 'react';
import { Link } from 'react-router-dom';
// Import FontAwesome social icons from react-icons
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  // --- Inline Styles ---
  const footerStyle = {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    color: '#ecf0f1',
    padding: '60px 0 30px',
    marginTop: 'auto',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
  };

  const contentGridStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 25px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '45px 60px',
    justifyItems: 'start',
  };

  const columnHeadingStyle = {
    fontSize: '1.5em',
    fontWeight: '700',
    color: '#3498db',
    marginBottom: '22px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#bdc3c7',
    fontSize: '1.05em',
    padding: '10px 0',
    display: 'block',
    lineHeight: '1.5',
    transition: 'color 0.25s ease, transform 0.25s ease, text-decoration 0.25s ease',
    cursor: 'pointer',
  };

  const linkHoverStyle = {
    color: '#ffffff',
    textDecoration: 'underline',
    transform: 'translateX(6px)',
  };

  const copyrightSectionStyle = {
    textAlign: 'center',
    marginTop: '60px',
    padding: '28px 15px',
    borderTop: '1px solid rgba(255,255,255,0.15)',
    color: '#95a5a6',
    fontSize: '0.92em',
    userSelect: 'none',
  };

  const socialLinksContainerStyle = {
    marginTop: '18px',
    paddingBottom: '10px',
    display: 'flex',
    gap: '22px',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const socialIconStyle = {
    color: '#ecf0f1',
    transition: 'color 0.3s ease, transform 0.3s ease',
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    fontSize: '20px', // Control icon size here
  };

  const socialIconHoverStyle = {
    color: '#3498db',
    transform: 'scale(1.15)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  };

  // Helper for hover styles on links & social icons
  const handleMouseEnter = (e, style) => Object.assign(e.currentTarget.style, style);
  const handleMouseLeave = (e, style) => Object.assign(e.currentTarget.style, style);

  return (
    <footer style={footerStyle}>
      <div style={contentGridStyle}>
        {/* About Us */}
        <div>
          <h3 style={columnHeadingStyle}>About Us</h3>
          <ul style={listStyle}>
            {[
              { to: '/about', label: 'About TutorMove' },
              { to: '/how-it-works', label: 'How It Works' },
              { to: '/contact', label: 'Contact Us' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  style={linkStyle}
                  onMouseEnter={(e) => handleMouseEnter(e, linkHoverStyle)}
                  onMouseLeave={(e) => handleMouseLeave(e, linkStyle)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For Teachers */}
        <div>
          <h3 style={columnHeadingStyle}>For Teachers</h3>
          <ul style={listStyle}>
            {[
              { to: '/teacher-guide', label: 'Teacher Guide' },
              { to: '/create-gig', label: 'Create a Gig' },
              { to: '/teacher-faq', label: 'Teacher FAQ' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  style={linkStyle}
                  onMouseEnter={(e) => handleMouseEnter(e, linkHoverStyle)}
                  onMouseLeave={(e) => handleMouseLeave(e, linkStyle)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For Students */}
        <div>
          <h3 style={columnHeadingStyle}>For Students</h3>
          <ul style={listStyle}>
            {[
              { to: '/find-tutors', label: 'Find Tutors' },
              { to: '/post-requirement', label: 'Post Requirement' },
              { to: '/student-faq', label: 'Student FAQ' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  style={linkStyle}
                  onMouseEnter={(e) => handleMouseEnter(e, linkHoverStyle)}
                  onMouseLeave={(e) => handleMouseLeave(e, linkStyle)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 style={columnHeadingStyle}>Legal</h3>
          <ul style={listStyle}>
            {[
              { to: '/privacy-policy', label: 'Privacy Policy' },
              { to: '/terms', label: 'Terms of Service' },
              { to: '/refund-policy', label: 'Refund Policy' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  style={linkStyle}
                  onMouseEnter={(e) => handleMouseEnter(e, linkHoverStyle)}
                  onMouseLeave={(e) => handleMouseLeave(e, linkStyle)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={copyrightSectionStyle}>
        <div style={socialLinksContainerStyle}>
          {/* Facebook */}
          <a
            href="https://facebook.com/TutorMove"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            style={socialIconStyle}
            onMouseEnter={(e) => handleMouseEnter(e, socialIconHoverStyle)}
            onMouseLeave={(e) => handleMouseLeave(e, socialIconStyle)}
          >
            <FaFacebookF />
          </a>

          {/* Twitter */}
          <a
            href="https://twitter.com/TutorMove"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            style={socialIconStyle}
            onMouseEnter={(e) => handleMouseEnter(e, socialIconHoverStyle)}
            onMouseLeave={(e) => handleMouseLeave(e, socialIconStyle)}
          >
            <FaTwitter />
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/company/TutorMove"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            style={socialIconStyle}
            onMouseEnter={(e) => handleMouseEnter(e, socialIconHoverStyle)}
            onMouseLeave={(e) => handleMouseLeave(e, socialIconStyle)}
          >
            <FaLinkedinIn />
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} TutorMove. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
