import React from 'react';

const HomeSections = () => {
  return (
    <div className="font-sans text-gray-800 bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Top Navigation */}
      <nav className="py-12 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-center items-start gap-16 max-w-6xl mx-auto px-6">
          {/* Teachers */}
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Teachers
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {['Teachers', 'Online Teachers', 'Home Teachers', 'Assignment Help'].map((label, idx) => (
                <button 
                  key={idx} 
                  className="group relative px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="relative z-10">{label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Teaching Jobs */}
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Teaching Jobs
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {['Teaching Jobs', 'Online Teaching', 'Home Teaching', 'Assignment Jobs'].map((label, idx) => (
                <button 
                  key={idx} 
                  className="group relative px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="relative z-10">{label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* High Quality Teachers */}
      <section className="py-16 text-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-blue-600">Quality Assured</span>
          </div>

          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            High Quality Teachers
          </h3>
          
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset="112.5"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">55.1%</span>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Only <span className="font-bold text-indigo-600 text-xl">55.1%</span> of teachers that apply make it through our 
              <span className="font-semibold text-gray-900"> rigorous application process</span>.
            </p>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified & Background Checked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats and What We Do */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { number: '9500+', label: 'Subjects', icon: '📚', color: 'from-blue-500 to-cyan-500' },
            { number: '1500+', label: 'Skills', icon: '🎯', color: 'from-purple-500 to-pink-500' },
            { number: '1000+', label: 'Languages', icon: '🌐', color: 'from-emerald-500 to-teal-500' },
          ].map((stat, i) => (
            <div 
              key={i}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold text-lg">{stat.label}</div>
              </div>

              {/* Decorative corner */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300`} />
            </div>
          ))}
        </div>

        {/* What We Do */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20" />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-3xl font-bold text-gray-900">What we do?</h4>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              <span className="font-bold text-indigo-600">TutorMove.com</span> is a free website, trusted by 
              <span className="font-semibold text-gray-900"> thousands of students and teachers worldwide</span>. 
              You can find local tutors, online teachers, and professionals to help with tutoring, coaching, 
              assignments, academic projects, and dissertations across over 
              <span className="font-bold text-purple-600"> 9500 subjects</span> and skills.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">100% Free</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Trusted Platform</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Verified Tutors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers from 170 Countries */}
      <section className="py-16 text-center bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-blue-600">Global Network</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Teachers from over <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">170 countries</span>
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Connect with expert educators from around the world, bringing diverse perspectives and teaching styles
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Decorative gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20" />
            
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 overflow-hidden">
              <div className="relative">
                <img
                  src="https://assets2.teacheron.com/resources/assets/img/customImages/global-presence-125-countries-blue.png"
                  alt="World Map"
                  className="w-full rounded-2xl"
                />
                
                {/* Subtle overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl pointer-events-none" />
              </div>

              {/* Floating stats badges */}
              <div className="absolute top-8 left-8 bg-white rounded-2xl shadow-lg px-4 py-3 border border-gray-100">
                <div className="text-2xl font-bold text-indigo-600">170+</div>
                <div className="text-xs text-gray-600 font-medium">Countries</div>
              </div>
              
              <div className="absolute bottom-8 right-8 bg-white rounded-2xl shadow-lg px-4 py-3 border border-gray-100">
                <div className="text-2xl font-bold text-purple-600">Global</div>
                <div className="text-xs text-gray-600 font-medium">Reach</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects and Skills */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full mb-4">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="text-sm font-semibold text-indigo-600">Popular Choices</span>
          </div>

          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Top subjects and skills
          </h3>
          <p className="text-gray-600 text-lg">
            Explore our most requested subjects and skills
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { name: 'Academic Writing', icon: '✍️', color: 'from-blue-500 to-cyan-500' },
            { name: 'Accountancy', icon: '💼', color: 'from-green-500 to-emerald-500' },
            { name: 'Adobe Photoshop', icon: '🎨', color: 'from-purple-500 to-pink-500' },
            { name: 'Algorithm & Data Structures', icon: '🧮', color: 'from-orange-500 to-red-500' },
            { name: 'Biology', icon: '🧬', color: 'from-green-500 to-teal-500' },
            { name: 'C++', icon: '💻', color: 'from-blue-500 to-indigo-500' },
            { name: 'Communication Skills', icon: '💬', color: 'from-pink-500 to-rose-500' },
            { name: 'DBMS', icon: '🗄️', color: 'from-cyan-500 to-blue-500' },
            { name: 'English', icon: '📖', color: 'from-red-500 to-orange-500' },
            { name: 'IELTS', icon: '🎓', color: 'from-indigo-500 to-purple-500' },
            { name: 'Law', icon: '⚖️', color: 'from-amber-500 to-yellow-500' },
            { name: 'Machine Learning', icon: '🤖', color: 'from-violet-500 to-purple-500' },
            { name: 'Maths', icon: '🔢', color: 'from-blue-500 to-cyan-500' },
            { name: 'Physics', icon: '⚛️', color: 'from-indigo-500 to-blue-500' },
            { name: 'Python', icon: '🐍', color: 'from-yellow-500 to-green-500' },
            { name: 'Web Development', icon: '🌐', color: 'from-teal-500 to-cyan-500' },
            { name: 'Commerce', icon: '📊', color: 'from-emerald-500 to-green-500' },
            { name: 'HTML', icon: '🔧', color: 'from-orange-500 to-red-500' },
            { name: 'Chemistry', icon: '🧪', color: 'from-purple-500 to-pink-500' },
            { name: 'French', icon: '🇫🇷', color: 'from-blue-500 to-indigo-500' }
          ].map((item, i) => (
            <button
              key={i}
              className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-2 border-gray-200 hover:border-indigo-300 rounded-2xl p-4 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {item.name}
                </div>
              </div>

              {/* Arrow icon on hover */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1">
            View All Subjects
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default HomeSections;