// src/pages/qna/CreateQuestionPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { qnaAPI } from '../../utils/apiService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { HelpCircle, AlertCircle, FileText, Type } from 'lucide-react';

const CreateQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await qnaAPI.createQuestion({ title, content });
      navigate('/qna');
    } catch (err) {
      console.error("Error creating question:", err);
      setError("Failed to post your question. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans text-gray-600 dark:text-gray-300 transition-colors duration-300">
      <Navbar />
      <div className="flex-grow flex justify-center items-start pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full bg-white dark:bg-dark-card rounded-2xl shadow-xl dark:shadow-glow shadow-primary-200/50 dark:shadow-primary-900/20 border border-gray-200 dark:border-dark-border overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg">
                   <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Ask the Community</h1>
             </div>
             <p className="text-primary-100 text-sm max-w-xl">
               Get help with your homework, assignments, or any subject-related queries from expert tutors.
             </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Question Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Type className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                   </div>
                   <input
                    id="title"
                    type="text"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl focus:bg-white dark:focus:bg-dark-bg-tertiary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., How do I solve quadratic equations using the formula?"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                   Be specific and concise. A good title helps you get better answers faster.
                </p>
              </div>

              {/* Content Field */}
              <div>
                <label htmlFor="content" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Explanation <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                   <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                   </div>
                   <textarea
                    id="content"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl focus:bg-white dark:focus:bg-dark-bg-tertiary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all h-48 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your problem in detail. Include what you've tried so far..."
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => navigate('/qna')}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-md shadow-primary-200 dark:shadow-primary-900/30 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-wait"
                >
                  {submitting ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateQuestionPage;
