// src/pages/About.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16 mt-20 mb-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-6">About TutorMove</h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Welcome to <span className="font-semibold">TutorMove</span> – your trusted platform to 
            connect students with expert tutors worldwide. We make learning more accessible by 
            bridging the gap between passionate learners and experienced teachers across 
            academic subjects, professional skills, and beyond.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">For Students</h3>
            <p className="text-gray-600">
              Find the perfect tutor for your needs, whether it’s online or face-to-face. 
              Post your requirements, explore tutor profiles, and start learning anytime.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">For Tutors</h3>
            <p className="text-gray-600">
              Showcase your expertise, connect with motivated learners, and grow your teaching career. 
              TutorMove helps you reach students who need your guidance.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To make education accessible, flexible, and impactful by empowering both students and 
              teachers through a simple, transparent, and effective platform.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Why Choose TutorMove?</h2>
          <ul className="text-left max-w-2xl mx-auto text-gray-700 space-y-3">
            <li>✔ Wide range of subjects & skills</li>
            <li>✔ Verified tutor profiles</li>
            <li>✔ Flexible online & offline learning options</li>
            <li>✔ Transparent point-based system</li>
            <li>✔ Secure and reliable platform</li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-blue-600 text-white p-8 rounded-2xl shadow-md text-center">
          <h3 className="text-2xl font-semibold mb-4">Join TutorMove Today 🚀</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            Whether you’re a student eager to learn or a tutor ready to teach, 
            TutorMove is the right place for you.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
            Get Started
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
