// src/pages/TeacherGuide.jsx

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function TeacherGuide() {
  return (
    
     <div className="min-h-screen bg-gray-50 flex flex-col">
       <Navbar /> 
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg p-16 mt-10 mx-auto">
        <h1 className="text-4xl font-bold text-blue-700 text-center mb-8">
          Teacher Guide
        </h1>
        <p className="text-lg text-gray-700 text-center mb-12">
          Welcome to the <span className="font-semibold">TutorMove Teacher Guide</span>.  
          Whether you’re just starting or looking to grow your teaching career, 
          here’s everything you need to know to succeed on our platform.
        </p>

        {/* Step-by-step guide */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">1. Create Your Profile</h2>
            <p className="text-gray-600">
              Sign up and set up your tutor profile. Highlight your expertise, 
              teaching style, qualifications, and experience to attract the right students.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">2. Set Your Preferences</h2>
            <p className="text-gray-600">
              Choose the subjects you want to teach, set your availability, 
              and define your preferred teaching modes (online or in-person).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">3. Get Student Leads</h2>
            <p className="text-gray-600">
              Browse student requests or let them find you through our search system. 
              Respond quickly to maximize your chances of getting hired.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">4. Start Teaching</h2>
            <p className="text-gray-600">
              Once you connect with a student, schedule lessons and start teaching. 
              You can teach via online platforms or arrange in-person sessions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">5. Build Your Reputation</h2>
            <p className="text-gray-600">
              Deliver quality lessons and request reviews from students. 
              Positive feedback boosts your profile and attracts more learners.
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-blue-600 text-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4">💡 Tips for Success</h2>
          <ul className="list-disc list-inside space-y-2 text-left">
            <li>Be responsive to student inquiries</li>
            <li>Keep your availability updated</li>
            <li>Offer a demo class to build trust</li>
            <li>Maintain professionalism at all times</li>
            <li>Focus on student outcomes for better reviews</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-blue-700 mb-4">
            Ready to Inspire Learners? 🚀
          </h3>
          <p className="text-gray-700 mb-6">
            Join thousands of tutors who are making an impact through TutorMove.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Create Your Tutor Profile
          </button>
        </div>
      </div>
      <Footer />
    </div>
    
  );
}
