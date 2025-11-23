// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  const sections = [
    {
      title: "About",
      links: [
        { to: "/about", label: "About TutorMove" },
        { to: "/contact", label: "Contact Us" },
      ],
    },
    {
      title: "Teachers",
      links: [
        { to: "/teacher-guide", label: "Teacher Guide" },
        { to: "/teacher-faq", label: "Teacher FAQ" },
      ],
    },
    {
      title: "Students",
      links: [
        { to: "/post-requirement", label: "Post Requirement" },
        { to: "/student-faq", label: "Student FAQ" },
      ],
    },
    {
      title: "Legal",
      links: [
        { to: "/privacy-policy", label: "Privacy Policy" },
        { to: "/how-it-works", label: "How It Works" },
      ],
    },
  ];

  const socials = [
    {
      href: "https://facebook.com/TutorMove",
      icon: <FaFacebookF size={14} />,
      label: "Facebook",
    },
    {
      href: "https://twitter.com/TutorMove",
      icon: <FaTwitter size={14} />,
      label: "Twitter",
    },
    {
      href: "https://linkedin.com/company/TutorMove",
      icon: <FaLinkedinIn size={14} />,
      label: "LinkedIn",
    },
  ];

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-500 hover:text-indigo-600 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} TutorMove. All rights reserved.
          </p>

          <div className="flex space-x-4">
            {socials.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-600 transition-all duration-200"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;