// src/pages/StudentFAQ.jsx
import { useState } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


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

export default function StudentFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
      <div className="max-w-3xl w-full items-center mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
        <h1 className="text-4xl font-bold text-blue-700 mb-8 text-center">
          Student FAQ
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Here are some of the most common questions students ask about using
          TutorMove.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-5 cursor-pointer hover:shadow-lg transition"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blue-700">
                  {faq.question}
                </h3>
                <span className="text-gray-500 text-2xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </div>
              {openIndex === index && (
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-3">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-4">
            If you can’t find the answer here, feel free to contact us anytime.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
