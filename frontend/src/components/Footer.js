// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Home", to: "/" },
      { name: "About Us", to: "/about" },
      { name: "How it Works", to: "/how-it-works" },
      { name: "Contact", to: "/contact" },
    ],
    tutors: [
      { name: "Become a Tutor", to: "/teacher-guide" },
      { name: "Browse Jobs", to: "/jobs" },
      { name: "Tutor FAQ", to: "/teacher-faq" },
      { name: "Success Stories", to: "/about" },
    ],
    students: [
      { name: "Find a Tutor", to: "/tutors" },
      { name: "Post Requirement", to: "/post-requirement" },
      { name: "Student FAQ", to: "/student-faq" },
      { name: "Q&A Forum", to: "/qna" },
    ],
    legal: [
      { name: "Privacy Policy", to: "/privacy-policy" },
      { name: "Terms of Service", to: "/terms-of-service" }, // Added Terms of Service link
      { name: "Safety Center", to: "/how-it-works" },
    ]
  };

  const socials = [
    { name: "Facebook", icon: FaFacebookF, href: "https://facebook.com" },
    { name: "Twitter", icon: FaTwitter, href: "https://twitter.com" },
    { name: "LinkedIn", icon: FaLinkedinIn, href: "https://linkedin.com" },
    { name: "Instagram", icon: FaInstagram, href: "https://instagram.com" },
  ];

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 pt-16 pb-8 border-t border-slate-800 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
               <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                T
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                TutorMove
              </span>
            </Link>
            <p className="text-slate-400 dark:text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
              Connecting students with expert tutors worldwide. Join our community to learn, teach, and grow together.
            </p>
            <div className="flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-sm hover:text-indigo-400 dark:hover:text-indigo-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">For Tutors</h3>
            <ul className="space-y-3">
              {footerLinks.tutors.map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-sm hover:text-indigo-400 dark:hover:text-indigo-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">For Students</h3>
             <ul className="space-y-3">
              {footerLinks.students.map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-sm hover:text-indigo-400 dark:hover:text-indigo-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-600 text-center md:text-left">
            &copy; {currentYear} TutorMove Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
             {footerLinks.legal.map((link) => (
                <Link key={link.name} to={link.to} className="text-xs text-slate-500 dark:text-slate-600 hover:text-slate-300 dark:hover:text-slate-400 transition-colors">
                  {link.name}
                </Link>
             ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;