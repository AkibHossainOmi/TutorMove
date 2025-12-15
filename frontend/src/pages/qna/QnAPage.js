import React, { useState, useEffect } from 'react';
import { qnaAPI } from '../../utils/apiService';
import { useAuth } from '../../contexts/UseAuth';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

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
    e.preventDefault(); // Prevent link navigation if clicked
    try {
      const response = await qnaAPI.upvoteQuestion(id);
      setQuestions(questions.map(q =>
        q.id === id ? { ...q, total_upvotes: response.data.total_upvotes, has_upvoted: !q.has_upvoted } : q
      ));
    } catch (error) {
      console.error("Error upvoting:", error);
      // Optional: Toast notification here
    }
  };

  const handleDeleteQuestion = async (id, e) => {
    e.preventDefault(); // Prevent link navigation
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        await qnaAPI.deleteQuestion(id);
        setQuestions(questions.filter(q => q.id !== id));
        alert('Question deleted successfully');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Community Q&A</h1>
            <p className="text-gray-500 mt-1">Find answers, ask questions, and help others.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <label className="text-sm text-gray-600 mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="most_liked">Most Liked</option>
              </select>
            </div>

            {user && user.user_type === 'student' && (
              <Link
                to="/qna/create"
                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ask a Question
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map(q => (
              <Link
                to={`/qna/${q.id}`}
                key={q.id}
                className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex items-start gap-4">
                  {/* Vote Counter - Left Side */}
                  <div className="flex flex-col items-center min-w-[3rem] text-gray-500">
                    <button
                      onClick={(e) => handleUpvote(q.id, e)}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors ${q.has_upvoted ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'}`}
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className={`font-bold text-lg ${q.has_upvoted ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {q.total_upvotes}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                      {q.title}
                    </h2>
                    <p className="text-gray-600 line-clamp-2 mb-4 text-sm leading-relaxed">
                      {q.content}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-gray-500 font-medium">
                      <div className="flex items-center flex-wrap gap-4">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            {q.student?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span>{q.student?.username || 'Anonymous'}</span>
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(q.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(q.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {q.answers_count} Answer{q.answers_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {user && q.student?.id === user.id && (
                        <button
                          onClick={(e) => handleDeleteQuestion(q.id, e)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          title="Delete Question"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
                <p className="mt-1 text-sm text-gray-500">Be the first to ask a question to the community.</p>
                {user && user.user_type === 'student' && (
                  <div className="mt-6">
                    <Link
                      to="/qna/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Ask a Question
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QnAPage;
