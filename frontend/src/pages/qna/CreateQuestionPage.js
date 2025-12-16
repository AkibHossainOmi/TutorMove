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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-600">
      <Navbar />
      <div className="flex-grow flex justify-center items-start pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-8">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg">
                   <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Ask the Community</h1>
             </div>
             <p className="text-indigo-100 text-sm max-w-xl">
               Get help with your homework, assignments, or any subject-related queries from expert tutors.
             </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                  Question Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Type className="h-5 w-5 text-slate-400" />
                   </div>
                   <input
                    id="title"
                    type="text"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., How do I solve quadratic equations using the formula?"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                   Be specific and concise. A good title helps you get better answers faster.
                </p>
              </div>

              {/* Content Field */}
              <div>
                <label htmlFor="content" className="block text-sm font-bold text-slate-700 mb-2">
                  Detailed Explanation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                   <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-slate-400" />
                   </div>
                   <textarea
                    id="content"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-48 resize-none placeholder:text-slate-400"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your problem in detail. Include what you've tried so far..."
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/qna')}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-wait"
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
