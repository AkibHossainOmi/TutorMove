import React from 'react';

const HomeSections = () => {
  return (
    <div className="font-sans text-gray-800 bg-white">
      {/* Top Navigation */}
      <nav className="py-8 border-b">
        <div className="flex flex-col md:flex-row justify-center items-start gap-12 max-w-6xl mx-auto">
          {/* Teachers */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-blue-600 mb-3">Teachers</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {['Teachers', 'Online Teachers', 'Home Teachers', 'Assignment Help'].map((label, idx) => (
                <button key={idx} className="border px-3 py-1 text-sm rounded-md hover:bg-blue-50 transition">{label}</button>
              ))}
            </div>
          </div>

          {/* Teaching Jobs */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-blue-600 mb-3">Teaching Jobs</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {['Teaching Jobs', 'Online Teaching', 'Home Teaching', 'Assignment Jobs'].map((label, idx) => (
                <button key={idx} className="border px-3 py-1 text-sm rounded-md hover:bg-blue-50 transition">{label}</button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* High Quality Teachers */}
      <section className="py-10 text-center bg-gray-50">
        <h3 className="text-lg font-semibold text-blue-600">High Quality Teachers</h3>
        <p className="mt-2 text-sm text-gray-700 max-w-xl mx-auto">
          Only <span className="font-bold">55.1%</span> of teachers that apply make it through our application process.
        </p>
      </section>

      {/* Stats and What We Do */}
      <section className="py-12 max-w-6xl mx-auto text-center">
        <div className="flex justify-center gap-8 mb-10 text-sm md:text-base">
          {[
            { number: '9500+', label: 'Subjects' },
            { number: '1500+', label: 'Skills' },
            { number: '1000+', label: 'Languages' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl font-bold">{stat.number}</div>
              <div>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-100 p-6 md:p-8 rounded-xl shadow-sm max-w-3xl mx-auto">
          <h4 className="text-lg font-semibold mb-3">What we do?</h4>
          <p className="text-sm text-gray-700">
            TutorMove.com is a free website, trusted by thousands of students and teachers worldwide. 
            You can find local tutors, online teachers, and professionals to help with tutoring, coaching, 
            assignments, academic projects, and dissertations across over 9500 subjects and skills.
          </p>
        </div>
      </section>

      {/* Teachers from 170 Countries */}
      <section className="py-12 text-center bg-white">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Teachers from over 170 countries</h3>
        <div className="max-w-4xl mx-auto px-4 relative">
  {/* Image */}
  <img
    src="https://assets2.teacheron.com/resources/assets/img/customImages/global-presence-125-countries-blue.png"
    alt="World Map"
    className="w-full rounded-lg shadow-sm"
  />
  
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/20 rounded-lg pointer-events-none"></div>
</div>

      </section>

      {/* Subjects and Skills */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h3 className="text-xl font-semibold text-center mb-8">Top subjects and skills</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm text-blue-700">
          {[
            'Academic Writing', 'Accountancy', 'Adobe Photoshop', 'Algorithm & Data Structures',
            'Biology', 'C++', 'Communication Skills', 'DBMS',
            'English', 'IELTS', 'Law', 'Machine Learning',
            'Maths', 'Physics', 'Python', 'Web Development',
            'Commerce', 'HTML', 'Chemistry', 'French'
          ].map((item, i) => (
            <div key={i} className="hover:underline cursor-pointer">{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSections;
