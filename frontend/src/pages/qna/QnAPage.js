// src/pages/qna/QnAPage.js
import React, { useState, useEffect } from 'react';
import { qnaAPI } from '../../utils/apiService';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MessageSquare, ArrowUp, Trash2, Clock, User, Filter, Plus } from 'lucide-react';

const QnAPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchQuestions();
  }, [sortBy]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const orderingParam = sortBy === 'most_liked' ? '-total_upvotes' : '-created_at';
      const response = await qnaAPI.getQuestions({ ordering: orderingParam });
      setQuestions(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id, e) => {
    e.preventDefault();
    try {
      const response = await qnaAPI.upvoteQuestion(id);
      setQuestions(questions.map(q =>
        q.id === id ? { ...q, total_upvotes: response.data.total_upvotes, has_upvoted: !q.has_upvoted } : q
      ));
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const handleDeleteQuestion = async (id, e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        await qnaAPI.deleteQuestion(id);
        setQuestions(questions.filter(q => q.id !== id));
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-600">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
               <MessageSquare className="w-8 h-8 text-indigo-600" />
               Community Q&A
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Join the discussion. Find answers, ask questions, and share your knowledge with fellow students and tutors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             {/* Sort Dropdown */}
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-400" />
               </div>
               <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow cursor-pointer shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="most_liked">Most Upvoted</option>
              </select>
            </div>

            {user && user.user_type === 'student' && (
              <Link
                to="/qna/create"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:shadow-md transition-all gap-2"
              >
                <Plus className="w-5 h-5" />
                Ask Question
              </Link>
            )}
          </div>
        </div>

        {/* Content List */}
        {loading ? (
           <div className="py-20 flex justify-center">
              <LoadingSpinner />
           </div>
        ) : (
          <div className="space-y-4">
            {questions.map(q => (
              <Link
                to={`/qna/${q.id}`}
                key={q.id}
                className="block bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
              >
                 {/* Hover Indication Bar */}
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex gap-6">
                  {/* Upvote Column */}
                  <div className="flex flex-col items-center min-w-[3rem]">
                    <button
                      onClick={(e) => handleUpvote(q.id, e)}
                      className={`p-2 rounded-lg transition-all ${
                        q.has_upvoted
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-500'
                      }`}
                      title={q.has_upvoted ? "Remove Upvote" : "Upvote"}
                    >
                       <ArrowUp className={`w-6 h-6 ${q.has_upvoted ? 'fill-current' : ''}`} />
                    </button>
                    <span className={`font-bold text-lg mt-1 ${q.has_upvoted ? 'text-indigo-600' : 'text-slate-600'}`}>
                      {q.total_upvotes}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {q.title}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {q.content}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        {/* Author */}
                        <div className="flex items-center gap-1.5">
                           <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                              {q.student?.username?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
                           </div>
                           <span className="text-slate-700">{q.student?.username || 'Anonymous'}</span>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-1.5">
                           <Clock className="w-3.5 h-3.5" />
                           <span>
                              {new Date(q.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                           </span>
                        </div>

                        {/* Answers Count */}
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md">
                           <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                           <span className="text-slate-700">{q.answers_count} Answers</span>
                        </div>
                      </div>

                      {/* Delete Action (Owner only) */}
                      {user && q.student?.id === user.id && (
                        <button
                          onClick={(e) => handleDeleteQuestion(q.id, e)}
                          className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Empty State */}
            {questions.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <MessageSquare className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No questions yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                   Be the first to start a discussion! Ask a question to get help from our community of tutors.
                </p>
                {user && user.user_type === 'student' && (
                   <Link
                    to="/qna/create"
                    className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
                   >
                     Ask a Question
                   </Link>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default QnAPage;
