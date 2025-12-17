// src/pages/Contact.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans text-gray-600 dark:text-gray-300 transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 mb-6 shadow-lg shadow-primary-500/30">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Have questions, suggestions, or need support? We’d love to hear from you!  
            Fill out the form below or reach us through the provided details.
          </p>
        </div>

        {/* Contact Form + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg dark:shadow-glow border border-gray-100 dark:border-dark-border p-8 md:p-10 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea
                    name="message"
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    rows="5"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none dark:text-white"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>

              {status && (
                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 rounded-xl text-emerald-700 dark:text-emerald-400 font-medium text-center animate-in fade-in slide-in-from-bottom-2">
                  {status}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 lg:pl-8">
            <div className="bg-white dark:bg-dark-card rounded-2xl p-8 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Address</span>
                    <p className="text-gray-600 dark:text-gray-400">123 TutorMove Street, Dhaka, Bangladesh</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl text-secondary-600 dark:text-secondary-400">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Phone</span>
                    <p className="text-gray-600 dark:text-gray-400">+880 123-456-789</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Email</span>
                    <p className="text-gray-600 dark:text-gray-400">support@tutormove.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Working Hours</span>
                    <p className="text-gray-600 dark:text-gray-400">Mon - Fri, 9:00 AM - 6:00 PM</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map Placeholder or Additional Info */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3">Need Immediate Help?</h3>
                <p className="text-primary-100 mb-6">Check our FAQ section for quick answers to common questions.</p>
                <a href="/faq" className="inline-block px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                  Visit FAQ
                </a>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
