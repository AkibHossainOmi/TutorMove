import React from 'react';

const HomeSections = () => {
  return (
    <div className="font-sans text-gray-800 bg-white">
      {/* Top Navigation */}
      <nav className="py-6 border-b">
        <div className="flex flex-col md:flex-row justify-center items-start gap-10 max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">Teachers</h2>
            <div className="flex flex-wrap justify-center gap-2">
              <button className="border px-3 py-1 text-sm rounded hover:bg-gray-100">Teachers</button>
              <button className="border px-3 py-1 text-sm rounded hover:bg-gray-100">Online Teachers</button>
              <button className="border px-3 py-1 text-sm rounded hover:bg-gray-100">Home Teachers</button>
              <button className="border px-3 py-1 text-sm rounded hover:bg-gray-100">Assignment Help</button>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">Teaching Jobs</h2>
            <div className="flex flex-wrap justify-center gap-2">
              <button className="border px-3 py-1 text-sm rounded hover:bg-gray-100">Teaching Jobs</button>
              <button className="border px-3 py-1 text-sm rounded hover:bg-gray-100">Online Teaching</button>
              <button className="border px-3 py-1 text-sm rounded hover:bg-gray-100">Home Teaching</button>
              <button className="border px-3 py-1 text-sm rounded hover:bg-gray-100">Assignment Jobs</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Quality Highlight */}
      <section className="bg-black text-white py-8 text-center">
        <h3 className="text-lg font-semibold text-blue-300">High Quality Teachers</h3>
        <p className="mt-2 text-sm">ONLY 55.1% OF TEACHERS THAT APPLY MAKE IT THROUGH OUR APPLICATION PROCESS</p>
      </section>

      {/* Stats & What We Do */}
      <section className="py-10 max-w-6xl mx-auto text-center">
        <div className="flex justify-center gap-10 mb-8 text-sm md:text-base">
          <div><strong className="text-xl">9500+</strong><br />Subjects</div>
          <div><strong className="text-xl">1500+</strong><br />Skills</div>
          <div><strong className="text-xl">1000+</strong><br />Languages</div>
        </div>
        <div className="bg-gray-100 p-6 rounded max-w-2xl mx-auto">
          <h4 className="text-lg font-semibold mb-2">What we do?</h4>
          <p className="text-sm text-gray-700">
            TutorMove.com is a free website, trusted by thousands of students and teachers all over the world.
            You can find local tutors, online teachers, and teachers to help with tutoring, coaching, assignments,
            academic projects, and dissertations for over 9500 subjects and skills.
          </p>
        </div>
      </section>

      {/* Teachers from 170 Countries */}
      <section className="bg-gray-900 text-white py-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Teachers from over 170 countries</h3>
        <div className="max-w-4xl mx-auto px-4">
          <img src="/world-map-placeholder.png" alt="World Map" className="w-full opacity-90 rounded" />
        </div>
      </section>

      {/* Subjects & Skills */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h3 className="text-xl font-semibold text-center mb-6">Top subjects and skills</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm text-blue-700">
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
