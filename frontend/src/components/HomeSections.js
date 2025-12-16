// src/components/HomeSections.js
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Globe, CheckCircle, Search, Briefcase, GraduationCap } from 'lucide-react';

const HomeSections = () => {
  return (
    <div className="font-sans text-slate-900 bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-slate-50 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl opacity-60 mix-blend-multiply filter"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl opacity-60 mix-blend-multiply filter"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
               #1 Trusted Tutoring Platform
             </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Unlock your potential with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Expert Tutors
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-12 leading-relaxed">
            Connect with certified educators and passionate learners worldwide.
            Personalized learning that fits your schedule and goals.
          </p>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Find Tutors Card */}
            <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

               <div className="relative z-10">
                 <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">I'm a Student</h2>
                <p className="text-slate-500 mb-8 min-h-[48px]">Find verified tutors for any subject, from math to music.</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/tutors" className="flex-1 inline-flex justify-center items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all">
                    Find Tutors
                  </Link>
                  <Link to="/tutors?type=online" className="flex-1 inline-flex justify-center items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 hover:text-indigo-600 transition-all">
                    Online Tutors
                  </Link>
                </div>
              </div>
            </div>

            {/* Find Jobs Card */}
            <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

               <div className="relative z-10">
                 <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">I'm a Teacher</h2>
                <p className="text-slate-500 mb-8 min-h-[48px]">Browse thousands of teaching jobs and grow your career.</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/jobs" className="flex-1 inline-flex justify-center items-center px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all">
                    Find Jobs
                  </Link>
                  <Link to="/jobs?type=online" className="flex-1 inline-flex justify-center items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 hover:text-emerald-600 transition-all">
                    Remote Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Quality Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
            
            <div className="mb-16 lg:mb-0 relative order-2 lg:order-1">
               {/* Decorative Ring */}
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-60 transform -translate-x-10"></div>

               {/* Stats Card */}
               <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 max-w-md mx-auto lg:mx-0">
                 <div className="text-center">
                   <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6">
                      <CheckCircle className="w-10 h-10 text-indigo-600" />
                   </div>
                   <h3 className="text-5xl font-extrabold text-slate-900 mb-2">55.1%</h3>
                   <p className="text-slate-500 uppercase tracking-widest text-xs font-semibold">Acceptance Rate</p>
                 </div>

                 <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Applications</span>
                      <span className="font-semibold text-slate-900">10,000+</span>
                    </div>
                     <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                     </div>

                     <div className="flex justify-between items-center text-sm mt-4">
                      <span className="text-slate-600">Accepted Tutors</span>
                      <span className="font-semibold text-slate-900">5,510</span>
                    </div>
                     <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '55.1%' }}></div>
                     </div>
                 </div>
               </div>
            </div>

            <div className="order-1 lg:order-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                 Quality Assurance
               </div>
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                 We accept only the best. <br />
                 <span className="text-indigo-600">Quality over quantity.</span>
               </h2>
               <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                 Our rigorous vetting process ensures that you learn from truly qualified experts.
                 We verify credentials, conduct background checks, and review teaching experience so you don't have to.
               </p>

               <ul className="space-y-4">
                 {[
                   "Identity & Criminal Background Check",
                   "Academic Credential Verification",
                   "Subject Matter Expertise Assessment",
                   "Ongoing Performance Monitoring"
                 ].map((item, idx) => (
                   <li key={idx} className="flex items-start gap-3">
                     <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                       <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     <span className="text-slate-700 font-medium">{item}</span>
                   </li>
                 ))}
               </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="p-4">
              <BookOpen className="w-10 h-10 mx-auto text-indigo-400 mb-4" />
              <div className="text-4xl font-bold mb-2">9,500+</div>
              <div className="text-slate-400 font-medium">Subjects Covered</div>
            </div>
            <div className="p-4 pt-8 md:pt-4">
              <Users className="w-10 h-10 mx-auto text-emerald-400 mb-4" />
              <div className="text-4xl font-bold mb-2">1,500+</div>
              <div className="text-slate-400 font-medium">Verified Skills</div>
            </div>
            <div className="p-4 pt-8 md:pt-4">
              <Globe className="w-10 h-10 mx-auto text-purple-400 mb-4" />
              <div className="text-4xl font-bold mb-2">170+</div>
              <div className="text-slate-400 font-medium">Countries Reached</div>
            </div>
           </div>
        </div>
      </section>

       {/* Value Proposition */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Choose TutorMove?</h2>
          <p className="text-xl text-slate-600 leading-relaxed mb-12">
            We are building the world's most trusted learning community.
            Transparent, secure, and focused on your success.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-green-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Free for Basic Use</h3>
                <p className="text-sm text-slate-500">Post jobs and create profiles at no cost.</p>
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-blue-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Secure Platform</h3>
                <p className="text-sm text-slate-500">Your data and payments are always protected.</p>
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-purple-600">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Proven Results</h3>
                <p className="text-sm text-slate-500">Thousands of students achieving their goals.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Popular Subjects */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Popular Subjects</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              From academic staples to creative arts, explore the most requested subjects on our platform.
            </p>
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
                className="group flex items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-medium text-sm text-center hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:text-indigo-600 transition-all duration-300"
              >
                <span>{subject}</span>
              </Link>
            ))}
          </div>

           <div className="text-center mt-12">
             <Link to="/tutors" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-full text-slate-700 font-semibold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
               <span>View All Subjects</span>
               <Search className="w-4 h-4" />
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSections;
