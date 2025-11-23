import React from 'react';
import { Link } from 'react-router-dom';

const HomeSections = () => {
  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* Top Navigation / Hero Section */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-8">
            Find the perfect <span className="text-indigo-600">tutor</span> or <span className="text-indigo-600">student</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12">
            Connect with expert educators and eager learners from around the world on TutorMove.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Find Tutors Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
               <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">For Students</h2>
              <p className="text-gray-500 mb-6">Find qualified tutors for any subject, online or in-person.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/tutors" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">Find Tutors</Link>
                <Link to="/tutors?type=online" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:border-gray-300 transition-colors">Online</Link>
                <Link to="/tutors?type=home" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:border-gray-300 transition-colors">Home</Link>
              </div>
            </div>

            {/* Find Jobs Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
               <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">For Teachers</h2>
              <p className="text-gray-500 mb-6">Browse teaching jobs and connect with students needing help.</p>
               <div className="flex flex-wrap justify-center gap-3">
                <Link to="/jobs" className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">Find Jobs</Link>
                <Link to="/jobs?type=online" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:border-gray-300 transition-colors">Online</Link>
                <Link to="/jobs?type=assignment" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:border-gray-300 transition-colors">Assignments</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High Quality Teachers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0">
               <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full mb-6">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Quality First</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                High Quality Teachers Only
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                We take quality seriously. Only <span className="font-semibold text-indigo-600">55.1%</span> of teachers that apply make it through our rigorous application process. We verify credentials and background check to ensure safety and quality.
              </p>

              <ul className="space-y-4">
                {[
                  "Verified Credentials",
                  "Background Checked",
                  "Interviewed Experts",
                  "Student Reviews"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                 <div className="flex flex-col items-center justify-center py-10">
                   <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="#F3F4F6" strokeWidth="12" fill="none" />
                        <circle cx="96" cy="96" r="88" stroke="#4F46E5" strokeWidth="12" fill="none" strokeDasharray="552.9" strokeDashoffset="248" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-gray-900">55.1%</span>
                        <span className="text-sm text-gray-500 uppercase tracking-wide mt-1">Acceptance Rate</span>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '9,500+', label: 'Subjects', icon: '📚' },
              { number: '1,500+', label: 'Skills', icon: '🎯' },
              { number: '170+', label: 'Countries', icon: '🌍' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
           </div>
        </div>
      </section>

       {/* What We Do */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is TutorMove?</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-10">
            <span className="font-semibold text-indigo-600">TutorMove.com</span> is a trusted platform connecting students and teachers worldwide.
            Whether you need help with academic subjects, skills, or assignments, we have thousands of verified professionals ready to assist you.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
             <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
               100% Free for Basic Use
             </span>
             <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
               Trusted Platform
             </span>
             <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
               Verified Tutors
             </span>
          </div>
        </div>
      </section>

      {/* Popular Subjects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Subjects</h2>
            <p className="text-gray-500">Explore the most requested subjects on our platform</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
              'Computer Science', 'Python', 'Java', 'Web Development', 'Data Science',
              'Accounting', 'Economics', 'Business Studies', 'History', 'Geography',
              'French', 'Spanish', 'German', 'Music', 'Art'
            ].map((subject, i) => (
              <Link
                key={i}
                to={`/tutors?search=${subject}`}
                className="bg-white p-4 rounded-xl border border-gray-200 text-center hover:border-indigo-300 hover:shadow-md hover:text-indigo-600 transition-all duration-200"
              >
                <span className="font-medium text-sm">{subject}</span>
              </Link>
            ))}
          </div>

           <div className="text-center mt-12">
             <Link to="/tutors" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
               View All Subjects
               <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
               </svg>
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSections;