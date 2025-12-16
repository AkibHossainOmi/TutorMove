import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { UserCheck, Settings, Users, Video, Star, Lightbulb, ArrowRight } from 'lucide-react';

const TeacherGuide = () => {
  const steps = [
    {
      icon: <UserCheck className="w-6 h-6 text-indigo-600" />,
      title: "Create Your Profile",
      description: "Sign up and set up your tutor profile. Highlight your expertise, teaching style, qualifications, and experience to attract the right students."
    },
    {
      icon: <Settings className="w-6 h-6 text-indigo-600" />,
      title: "Set Your Preferences",
      description: "Choose the subjects you want to teach, set your availability, and define your preferred teaching modes (online or in-person)."
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      title: "Get Student Leads",
      description: "Browse student requests or let them find you through our search system. Respond quickly to maximize your chances of getting hired."
    },
    {
      icon: <Video className="w-6 h-6 text-indigo-600" />,
      title: "Start Teaching",
      description: "Once you connect with a student, schedule lessons and start teaching. You can teach via online platforms or arrange in-person sessions."
    },
    {
      icon: <Star className="w-6 h-6 text-indigo-600" />,
      title: "Build Your Reputation",
      description: "Deliver quality lessons and request reviews from students. Positive feedback boosts your profile and attracts more learners."
    }
  ];

  const tips = [
    "Be responsive to student inquiries",
    "Keep your availability updated",
    "Offer a demo class to build trust",
    "Maintain professionalism at all times",
    "Focus on student outcomes for better reviews"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-16 mt-16 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Teacher <span className="text-indigo-600">Guide</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Welcome to the TutorMove Teacher Guide. Whether you’re just starting or looking to grow your teaching career,
            here’s everything you need to know to succeed on our platform.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-6xl font-bold text-indigo-600">{index + 1}</span>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 md:p-12 shadow-xl text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-8 h-8 text-yellow-300" />
                <h2 className="text-3xl font-bold">Tips for Success</h2>
              </div>
              <p className="text-indigo-100 text-lg">
                Master these habits to become a top-rated tutor on our platform.
              </p>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span className="font-medium">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Inspire Learners?
          </h3>
          <p className="text-slate-600 mb-8">
            Join thousands of tutors who are making an impact through TutorMove.
          </p>
          <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/30">
            Create Your Tutor Profile
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeacherGuide;
