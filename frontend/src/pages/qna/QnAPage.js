// src/pages/qna/QnAPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { qnaAPI } from '../../utils/apiService';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { Button, Badge, Avatar } from '../../components/ui';
import {
  MessageSquare,
  ThumbsUp,
  Trash2,
  Calendar,
  Plus,
  Search,
  TrendingUp,
  Users,
  HelpCircle,
  Sparkles,
  Eye
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const QnAPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  const user = JSON.parse(localStorage.getItem('user'));

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
        setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, debouncedSearch, activeTab]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      const params = {
          page: currentPage,
          page_size: ITEMS_PER_PAGE,
          search: debouncedSearch,
      };

      if (activeTab === 'unanswered') {
          params.unanswered = 'true';
      } else if (activeTab === 'popular') {
          params.ordering = '-total_upvotes';
      } else {
          params.ordering = '-created_at';
      }

      const response = await qnaAPI.getQuestions(params);
      
      if (response.data && response.data.results) {
          setQuestions(response.data.results);
          setTotalQuestions(response.data.count);
          setTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE));
      } else if (Array.isArray(response.data)) {
          setQuestions(response.data);
          setTotalQuestions(response.data.length);
          setTotalPages(1);
      } else {
          setQuestions([]);
          setTotalQuestions(0);
          setTotalPages(0);
      }

    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        await qnaAPI.deleteQuestion(id);
        // Refresh page or remove locally
        fetchQuestions(); 
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
      }
    }
  };

  const handlePageChange = (page) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'all', label: 'All Questions' },
    { id: 'unanswered', label: 'Unanswered' },
    { id: 'popular', label: 'Popular' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-slate-900 dark:bg-dark-bg-secondary pt-24 pb-20 lg:pt-28 lg:pb-28 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pill Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-200">Community Driven</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-white tracking-tight mb-4">
            Questions & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Answers</span>
          </h1>

          <p className="text-lg text-slate-400 text-center max-w-2xl mx-auto mb-10">
            Get help from our community. Ask questions, share knowledge, and learn together.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 dark:bg-dark-card/50 backdrop-blur-sm border border-white/20 dark:border-dark-border rounded-2xl text-white placeholder-slate-400 dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 text-slate-300">
              <HelpCircle className="w-5 h-5 text-violet-400" />
              <span className="font-semibold">{totalQuestions}</span>
              <span className="text-slate-400">Questions</span>
            </div>
            {/* Note: Total answers and contributors cannot be easily calculated with pagination without a separate API call. 
                Leaving static or hiding for now, or showing partial data.
            */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        {/* Controls Card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm dark:shadow-dark-md border border-gray-200 dark:border-dark-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                      : 'text-slate-600 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Ask Question Button */}
            {user && user.user_type === 'student' && (
              <Link to="/qna/create">
                <Button icon={Plus} size="md">
                  Ask Question
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Questions List */}
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
                className="block group"
              >
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm dark:shadow-dark-md hover:shadow-xl dark:hover:shadow-dark-lg hover:border-violet-200 dark:hover:border-violet-800/50 transition-all duration-300 overflow-hidden">
                  {/* Card Header - Author & Date */}
                  <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-gray-50 dark:border-dark-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          fallback={q.student?.username}
                          size="sm"
                          src={q.student?.profile_picture}
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary">
                            {q.student?.username || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-1.5 text-slate-400 dark:text-dark-text-muted">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">{formatDateTime(q.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button (Owner only) */}
                      {user && q.student?.id === user.id && (
                        <button
                          onClick={(e) => handleDeleteQuestion(q.id, e)}
                          className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body - Question Content */}
                  <div className="px-5 sm:px-6 py-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-dark-text-primary group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 mb-2">
                      {q.title}
                    </h2>
                    <p className="text-slate-500 dark:text-dark-text-secondary text-sm leading-relaxed line-clamp-3">
                      {q.content}
                    </p>
                  </div>

                  {/* Card Footer - Stats */}
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Upvote Button */}
                        <button
                          onClick={(e) => handleUpvote(q.id, e)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            q.has_upvoted
                              ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 ring-1 ring-violet-200 dark:ring-violet-800/50'
                              : 'bg-slate-100 dark:bg-dark-bg-tertiary text-slate-600 dark:text-dark-text-secondary hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${q.has_upvoted ? 'fill-current' : ''}`} />
                          <span>{q.total_upvotes}</span>
                        </button>

                        {/* Answers Badge */}
                        <Badge
                          color={q.answers_count > 0 ? 'success' : 'neutral'}
                          size="sm"
                          icon={MessageSquare}
                        >
                          {q.answers_count} {q.answers_count === 1 ? 'Answer' : 'Answers'}
                        </Badge>
                      </div>

                      {/* View Link */}
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4" />
                        View
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Empty State */}
            {questions.length === 0 && !loading && (
              <div className="text-center py-16 sm:py-20 bg-white dark:bg-dark-card rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 dark:from-violet-950/40 to-fuchsia-100 dark:to-fuchsia-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <MessageSquare className="w-10 h-10 text-violet-500 dark:text-violet-400" />
                </div>

                {searchQuery ? (
                  <>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-2">No results found</h3>
                    <p className="text-slate-500 dark:text-dark-text-secondary mb-6 max-w-sm mx-auto">
                      We couldn't find any questions matching "{searchQuery}". Try a different search term.
                    </p>
                    <Button variant="secondary" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </>
                ) : activeTab === 'unanswered' ? (
                  <>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-2">All caught up!</h3>
                    <p className="text-slate-500 dark:text-dark-text-secondary mb-6 max-w-sm mx-auto">
                      There are no unanswered questions at the moment. Check back later or browse all questions.
                    </p>
                    <Button variant="secondary" onClick={() => setActiveTab('all')}>
                      View All Questions
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-2">No questions yet</h3>
                    <p className="text-slate-500 dark:text-dark-text-secondary mb-6 max-w-sm mx-auto">
                      Be the first to start a discussion! Ask a question to get help from our community.
                    </p>
                    {user && user.user_type === 'student' && (
                      <Link to="/qna/create">
                        <Button icon={Plus}>
                          Ask the First Question
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8">
                     <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        {questions.length > 0 && user && user.user_type === 'student' && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-violet-50 dark:from-violet-950/30 to-fuchsia-50 dark:to-fuchsia-950/30 rounded-2xl border border-violet-100 dark:border-violet-800/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-xl flex items-center justify-center shadow-sm dark:shadow-dark-sm">
                  <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-dark-text-primary">Can't find what you're looking for?</p>
                  <p className="text-sm text-slate-500 dark:text-dark-text-secondary">Ask your own question and get answers from the community.</p>
                </div>
              </div>
              <Link to="/qna/create">
                <Button icon={Plus}>
                  Ask Question
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default QnAPage;