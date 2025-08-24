// src/pages/Contact.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 🔹 Here you can call your backend API or service to send the message
    setStatus('Your message has been sent! ✅');
    setFormData({ name: '', email: '', message: '' });

    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16 mt-20 mb-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-6">Contact Us</h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-12 max-w-3xl mx-auto">
            Have questions, suggestions, or need support? We’d love to hear from you!  
            Fill out the form below or reach us through the provided details.
          </p>
        </div>

        {/* Contact Form + Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="5"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </form>

            {status && (
              <p className="mt-4 text-green-600 font-medium text-center">{status}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6">Get in Touch</h2>
            <ul className="space-y-6 text-gray-700">
              <li>
                📍 <span className="font-semibold">Address:</span>  
                <p className="ml-6">123 TutorMove Street, Dhaka, Bangladesh</p>
              </li>
              <li>
                📞 <span className="font-semibold">Phone:</span>  
                <p className="ml-6">+880 123-456-789</p>
              </li>
              <li>
                ✉️ <span className="font-semibold">Email:</span>  
                <p className="ml-6">support@tutormove.com</p>
              </li>
              <li>
                🕒 <span className="font-semibold">Working Hours:</span>  
                <p className="ml-6">Mon - Fri, 9:00 AM - 6:00 PM</p>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
