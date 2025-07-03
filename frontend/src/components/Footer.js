import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 py-16 px-0 mt-auto shadow-lg">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 justify-items-start">
        {/* About Us */}
        <div>
          <h3 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-wider">About Us</h3>
          <ul className="space-y-3">
            {[
              { to: '/about', label: 'About TutorMove' },
              { to: '/how-it-works', label: 'How It Works' },
              { to: '/contact', label: 'Contact Us' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-gray-400 hover:text-white hover:underline hover:translate-x-1.5 transition-all duration-300 ease-in-out block py-2"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For Teachers */}
        <div>
          <h3 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-wider">For Teachers</h3>
          <ul className="space-y-3">
            {[
              { to: '/teacher-guide', label: 'Teacher Guide' },
              { to: '/create-gig', label: 'Create a Gig' },
              { to: '/teacher-faq', label: 'Teacher FAQ' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-gray-400 hover:text-white hover:underline hover:translate-x-1.5 transition-all duration-300 ease-in-out block py-2"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For Students */}
        <div>
          <h3 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-wider">For Students</h3>
          <ul className="space-y-3">
            {[
              { to: '/find-tutors', label: 'Find Tutors' },
              { to: '/post-requirement', label: 'Post Requirement' },
              { to: '/student-faq', label: 'Student FAQ' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-gray-400 hover:text-white hover:underline hover:translate-x-1.5 transition-all duration-300 ease-in-out block py-2"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-wider">Legal</h3>
          <ul className="space-y-3">
            {[
              { to: '/privacy-policy', label: 'Privacy Policy' },
              { to: '/terms', label: 'Terms of Service' },
              { to: '/refund-policy', label: 'Refund Policy' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-gray-400 hover:text-white hover:underline hover:translate-x-1.5 transition-all duration-300 ease-in-out block py-2"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center mt-16 pt-8 border-t border-gray-700 text-gray-500 text-sm">
        <div className="flex gap-6 justify-center items-center mb-6">
          {/* Facebook */}
          <a
            href="https://facebook.com/TutorMove"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-gray-100 hover:text-blue-400 hover:scale-110 transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-full bg-gray-700"
          >
            <FaFacebookF className="text-lg" />
          </a>

          {/* Twitter */}
          <a
            href="https://twitter.com/TutorMove"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-gray-100 hover:text-blue-400 hover:scale-110 transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-full bg-gray-700"
          >
            <FaTwitter className="text-lg" />
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/company/TutorMove"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-gray-100 hover:text-blue-400 hover:scale-110 transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-full bg-gray-700"
          >
            <FaLinkedinIn className="text-lg" />
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} TutorMove. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;