// src/pages/PostRequirement.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Send, BookOpen, Mail, User, Wallet, FileText, Monitor } from "lucide-react";

export default function PostRequirement() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    mode: "online",
    budget: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Requirement Submitted:", formData);
    alert("Your requirement has been submitted successfully!");
    setFormData({
      name: "",
      email: "",
      subject: "",
      mode: "online",
      budget: "",
      description: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white shadow-xl shadow-slate-200/60 rounded-2xl max-w-3xl w-full overflow-hidden border border-slate-100">
           {/* Header */}
           <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-10 text-center">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Post Your Learning Requirement
              </h1>
              <p className="text-indigo-100 text-sm max-w-lg mx-auto">
                Fill out the form below to connect with the perfect tutor for your needs. It's free and takes less than a minute.
              </p>
           </div>

           <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Your Name
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                     </div>
                     <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                     </div>
                     <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Subject You Want to Learn
                </label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-slate-400" />
                   </div>
                   <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="e.g. Mathematics, English, Python Programming"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mode */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Preferred Mode
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Monitor className="h-5 w-5 text-slate-400" />
                     </div>
                     <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow appearance-none"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline (In-person)</option>
                      <option value="both">Both Online & Offline</option>
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Budget (per hour)
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Wallet className="h-5 w-5 text-slate-400" />
                     </div>
                     <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="e.g. $15 - $25"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Additional Details
                </label>
                <div className="relative">
                   <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-slate-400" />
                   </div>
                   <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-none"
                    placeholder="Describe your learning goals, schedule availability, or specific topics you need help with..."
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold text-lg px-8 py-3.5 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Requirement
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                   By submitting, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
           </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
