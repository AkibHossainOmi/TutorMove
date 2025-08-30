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
    <footer className="relative w-full mt-12">
      {/* Full width gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-sky-100 blur opacity-40" />
      
      <div className="relative w-full bg-white shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Top links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-gray-900 font-semibold mb-3 text-base">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-gray-600 hover:text-indigo-600 transition"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col items-center gap-4">
            <div className="flex gap-3">
              {socials.map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white transition"
                >
                  {icon}
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} TutorMove. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
