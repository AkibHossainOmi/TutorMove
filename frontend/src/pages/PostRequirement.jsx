// src/pages/PostRequirement.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
      <div className="bg-white shadow-lg rounded-2xl max-w-2xl w-full py-16 px-8 mx-auto mt-10">
        <h1 className="text-4xl font-bold text-blue-700 mb-6 text-center">
          Post Your Learning Requirement
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Fill out the form below to connect with the right tutor for you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Subject You Want to Learn
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Mathematics, English, Python Programming"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Preferred Mode
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="online">Online</option>
              <option value="offline">Offline (In-person)</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Budget (per hour)
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. $10 - $20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Additional Details
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Describe your requirement in detail..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Submit Requirement
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
