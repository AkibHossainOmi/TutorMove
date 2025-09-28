// src/pages/HowItWorks.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-16 mt-20 mb-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-6">How TutorMove Works</h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-10 max-w-3xl mx-auto">
            TutorMove makes it simple for <span className="font-semibold">students</span> to find the 
            right tutor, and for <span className="font-semibold">tutors</span> to connect with eager learners.  
            Here’s how the process works for both sides.
          </p>
        </div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Students Flow */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">For Students</h2>
            <ol className="space-y-6 text-gray-700">
              <li className="flex items-start gap-4">
                <span className="bg-blue-600 text-white font-bold px-4 py-2 rounded-full">1</span>
                <p><span className="font-semibold">Sign up</span> and create your learning profile.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-blue-600 text-white font-bold px-4 py-2 rounded-full">2</span>
                <p><span className="font-semibold">Post your requirements</span> (subject, skill, mode of learning, budget).</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-blue-600 text-white font-bold px-4 py-2 rounded-full">3</span>
                <p><span className="font-semibold">Browse tutors</span> that match your needs or wait for tutors to respond.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-blue-600 text-white font-bold px-4 py-2 rounded-full">4</span>
                <p><span className="font-semibold">Purchase points</span> to securely contact tutors.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-blue-600 text-white font-bold px-4 py-2 rounded-full">5</span>
                <p><span className="font-semibold">Start learning</span> online or offline with your chosen tutor.</p>
              </li>
            </ol>
          </div>

          {/* Tutors Flow */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">For Tutors</h2>
            <ol className="space-y-6 text-gray-700">
              <li className="flex items-start gap-4">
                <span className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-full">1</span>
                <p><span className="font-semibold">Register as a tutor</span> and set up your profile with expertise, experience, and rates.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-full">2</span>
                <p><span className="font-semibold">Get discovered</span> by students searching for your subjects or viewing tutor suggestions.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-full">3</span>
                <p><span className="font-semibold">Respond</span> to student requirements and showcase why you’re the right fit.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-full">4</span>
                <p><span className="font-semibold">Build trust</span> with reviews, ratings, and verified credentials.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-full">5</span>
                <p><span className="font-semibold">Start teaching</span> and grow your tutoring career with TutorMove.</p>
              </li>
            </ol>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-10 rounded-2xl shadow-lg text-center">
          <h3 className="text-3xl font-bold mb-4">Learning Made Simple with TutorMove</h3>
          <p className="mb-6 max-w-3xl mx-auto text-blue-100">
            Whether you’re looking to master a new skill or share your expertise, TutorMove 
            gives you the platform to succeed. Join today and experience smarter learning and teaching.
          </p>
          <button className="bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
            Get Started Now
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HowItWorks;
