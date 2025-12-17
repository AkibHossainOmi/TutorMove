// src/pages/About.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Users, Globe, Target, Shield, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans text-gray-600 dark:text-gray-300 transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-bg-secondary -z-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">TutorMove</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your trusted platform to connect students with expert tutors worldwide. We bridge the gap between passionate learners and experienced teachers across academic subjects and professional skills.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-glow border border-gray-100 dark:border-dark-border transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Students</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Find the perfect tutor for your needs, whether it’s online or face-to-face. 
              Post your requirements, explore tutor profiles, and start learning anytime.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-glow-secondary border border-gray-100 dark:border-dark-border transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-secondary-50 dark:bg-secondary-900/20 rounded-2xl flex items-center justify-center mb-6 text-secondary-600 dark:text-secondary-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Tutors</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Showcase your expertise, connect with motivated learners, and grow your teaching career. 
              TutorMove helps you reach students who need your guidance.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-glow border border-gray-100 dark:border-dark-border transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To make education accessible, flexible, and impactful by empowering both students and 
              teachers through a simple, transparent, and effective platform.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="relative bg-white dark:bg-dark-card rounded-3xl p-10 md:p-16 border border-gray-100 dark:border-dark-border overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50/50 to-transparent dark:from-primary-900/10 pointer-events-none"></div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">Why Choose TutorMove?</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-left">
              {[
                "Wide range of subjects & skills",
                "Verified tutor profiles",
                "Flexible online & offline learning",
                "Transparent point-based system",
                "Secure and reliable platform",
                "Community driven Q&A"
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 blur-2xl opacity-20 dark:opacity-40 rounded-full"></div>
            <div className="relative bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border p-10 md:p-14 rounded-3xl shadow-xl max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Join TutorMove Today 🚀</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Whether you’re a student eager to learn or a tutor ready to teach,
                TutorMove is the right place for you.
              </p>
              <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold shadow-lg hover:shadow-glow transform hover:-translate-y-0.5 transition-all">
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
