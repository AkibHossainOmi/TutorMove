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
            icon: <FaFacebookF />,
            label: "Facebook",
        },
        {
            href: "https://twitter.com/TutorMove",
            icon: <FaTwitter />,
            label: "Twitter",
        },
        {
            href: "https://linkedin.com/company/TutorMove",
            icon: <FaLinkedinIn />,
            label: "LinkedIn",
        },
    ];

    return (
        <footer className="bg-gray-900 text-gray-400 text-sm py-10 mt-auto">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                {sections.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-blue-400 font-semibold mb-3 text-base">
                            {section.title}
                        </h3>
                        <ul className="space-y-1">
                            {section.links.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="hover:text-white transition-colors"
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
            <div className="mt-8 pt-4 border-t border-gray-700 text-center">
                <div className="flex justify-center gap-4 mb-3">
                    {socials.map(({ href, icon, label }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:text-blue-400 transition"
                        >
                            {icon}
                        </a>
                    ))}
                </div>
                <p className="text-gray-500">
                    &copy; {new Date().getFullYear()} TutorMove. All rights
                    reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
