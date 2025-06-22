import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // --- Inline Styles ---
  const footerStyle = {
    backgroundColor: '#2c3e50', // Darker background for a more substantial footer
    color: '#ecf0f1', // Light text color for contrast
    padding: '50px 0 20px', // More vertical padding
    marginTop: 'auto', // Pushes footer to the bottom of the page
    fontFamily: '"Segoe UI", Arial, sans-serif', // Modern font stack
    boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', // Subtle shadow at the top
  };

  const contentGridStyle = {
    maxWidth: '1200px', // Matches main content width
    margin: '0 auto',
    padding: '0 25px', // Consistent horizontal padding
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // More flexible columns
    gap: '40px', // Increased gap between columns
    justifyItems: 'start', // Align items to the start of their grid area
  };

  const columnHeadingStyle = {
    fontSize: '1.4em', // Larger headings
    fontWeight: '700', // Bolder headings
    color: '#3498db', // A vibrant blue for headings
    marginBottom: '20px', // More space below headings
    textTransform: 'uppercase', // Uppercase for a clean look
    letterSpacing: '0.5px',
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#bdc3c7', // Lighter grey for links
    fontSize: '1em', // Consistent font size
    padding: '8px 0', // Vertical padding for clickable area
    display: 'block', // Make links block-level for padding
    transition: 'color 0.2s ease, transform 0.2s ease', // Smooth transition
  };

  const linkHoverStyle = {
    color: '#ffffff', // White on hover
    transform: 'translateX(5px)', // Slight slide effect
  };

  const copyrightSectionStyle = {
    textAlign: 'center',
    marginTop: '50px', // More space above copyright
    padding: '25px 0', // Padding for the copyright bar
    borderTop: '1px solid rgba(255,255,255,0.1)', // Subtle light border
    color: '#95a5a6', // Muted color for copyright text
    fontSize: '0.9em',
  };

  const socialLinksContainerStyle = {
    marginTop: '20px',
    display: 'flex',
    gap: '15px',
    justifyContent: 'center', // Center social icons if needed
  };

  const socialIconStyle = {
    fontSize: '1.8em', // Larger social icons
    color: '#ecf0f1',
    transition: 'color 0.2s ease, transform 0.2s ease',
  };

  const socialIconHoverStyle = {
    color: '#3498db', // Blue on hover
    transform: 'scale(1.1)', // Slight scale effect
  };

  return (
    <footer style={footerStyle}>
      <div style={contentGridStyle}>
        <div>
          <h3 style={columnHeadingStyle}>About Us</h3>
          <ul style={listStyle}>
            <li>
              <Link
                to="/about"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                About TutorMove
              </Link>
            </li>
            <li>
              <Link
                to="/how-it-works"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 style={columnHeadingStyle}>For Teachers</h3>
          <ul style={listStyle}>
            <li>
              <Link
                to="/teacher-guide"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Teacher Guide
              </Link>
            </li>
            <li>
              <Link
                to="/create-gig"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Create a Gig
              </Link>
            </li>
            <li>
              <Link
                to="/teacher-faq"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Teacher FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 style={columnHeadingStyle}>For Students</h3>
          <ul style={listStyle}>
            <li>
              <Link
                to="/find-tutors"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Find Tutors
              </Link>
            </li>
            <li>
              <Link
                to="/post-requirement"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Post Requirement
              </Link>
            </li>
            <li>
              <Link
                to="/student-faq"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Student FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 style={columnHeadingStyle}>Legal</h3>
          <ul style={listStyle}>
            <li>
              <Link
                to="/privacy-policy"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                to="/refund-policy"
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              >
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div style={copyrightSectionStyle}>
        <div style={socialLinksContainerStyle}>
          {/* Example Social Media Links (replace with actual icons/links) */}
          <a
            href="https://facebook.com/TutorMove"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            style={socialIconStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, socialIconHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, socialIconStyle)}
          >
            <i className="fab fa-facebook"></i> {/* Requires Font Awesome or similar */}
            {/* Or simply use text for now */}
            Fb
          </a>
          <a
            href="https://twitter.com/TutorMove"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            style={socialIconStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, socialIconHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, socialIconStyle)}
          >
            <i className="fab fa-twitter"></i>
            Tw
          </a>
          <a
            href="https://linkedin.com/company/TutorMove"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            style={socialIconStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, socialIconHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, socialIconStyle)}
          >
            <i className="fab fa-linkedin"></i>
            In
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} TutorMove. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;