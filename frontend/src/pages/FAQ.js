// src/pages/FAQ.jsx
import { useState } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp, MessageCircle, HelpCircle, Search } from 'lucide-react';

const faqs = [
  {
    question: "How do I find a tutor on TutorMove?",
    answer:
      "Simply sign up as a student, post your learning requirements, and browse through tutor profiles. You can filter by subject, location, and teaching mode (online or offline).",
  },
  {
    question: "Is TutorMove free for students?",
    answer:
      "Creating an account and browsing tutor profiles is completely free. You only spend points when you want to contact a tutor directly.",
  },
  {
    question: "What subjects can I learn?",
    answer:
      "TutorMove offers a wide range of subjects — from school & college academics to professional skills, languages, coding, arts, and more.",
  },
  {
    question: "How do I contact a tutor?",
    answer:
      "Once you find a tutor you like, you can use your points to unlock their contact details and start a conversation.",
  },
  {
    question: "Are tutors verified?",
    answer:
      "Yes, tutors go through a verification process. However, we always recommend students check tutor reviews and have an introductory session first.",
  },
  {
    question: "Can I request offline (in-person) classes?",
    answer:
      "Yes! You can choose between online and offline learning when posting your requirement or searching for tutors.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans text-gray-600 dark:text-gray-300 transition-colors duration-300">
        <Navbar />

        {/* Header */}
        <div className="pt-32 pb-16 text-center px-4 sm:px-6 relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-gradient-to-b from-primary-500/5 to-transparent -z-10 rounded-b-[3rem]"></div>
           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
             Frequently Asked Questions
           </h1>
           <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
             Everything you need to know about finding the perfect tutor or growing your teaching business.
           </p>
        </div>

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-dark-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                openIndex === index
                  ? 'border-primary-200 dark:border-primary-500/30 shadow-md dark:shadow-glow'
                  : 'border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-dark-border-hover'
              }`}
            >
              <button
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    openIndex === index
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'bg-gray-100 dark:bg-dark-bg-secondary text-gray-500 dark:text-gray-400'
                  }`}>
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className={`text-lg font-bold transition-colors ${
                    openIndex === index
                      ? 'text-primary-700 dark:text-primary-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {faq.question}
                  </h3>
                </div>
                <span className={`ml-6 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  <ChevronDown className={`w-5 h-5 ${openIndex === index ? 'text-primary-500' : 'text-gray-400'}`} />
                </span>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 pl-[4.5rem]">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-primary-100 dark:border-primary-900/30 pl-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-primary-50 to-white dark:from-dark-card dark:to-dark-bg-secondary border border-primary-100 dark:border-dark-border rounded-3xl shadow-sm max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary-500" />
              Still have questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              If you can’t find the answer here, feel free to contact us anytime. We are here to help!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold shadow-lg hover:shadow-glow transform hover:-translate-y-0.5 transition-all"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
