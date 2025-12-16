// src/pages/qna/QuestionDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { qnaAPI, pointsAPI } from '../../utils/apiService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import GiftCoinModal from '../../components/GiftCoinModal';
import { ThumbsUp, ThumbsDown, Trash2, Edit2, User, Calendar, MessageSquare, Gift, CornerDownRight, AlertCircle, Save, X } from 'lucide-react';

const QuestionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const [submitError, setSubmitError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });

  // Gift Coin State
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [userCreditBalance, setUserCreditBalance] = useState(0);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qRes = await qnaAPI.getQuestion(id);
      setQuestion(qRes.data);

      const aRes = await qnaAPI.getAnswers(id);
      setAnswers(aRes.data.results || aRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionUpvote = async () => {
    try {
      const response = await qnaAPI.upvoteQuestion(question.id);
      setQuestion({ ...question, total_upvotes: response.data.total_upvotes, has_upvoted: !question.has_upvoted });
    } catch (error) {
       alert("Please login to vote");
    }
  };

  const handleAnswerVote = async (answerId, type) => {
    try {
      let response;
      if (type === 'up') {
        response = await qnaAPI.upvoteAnswer(answerId);
      } else {
        response = await qnaAPI.downvoteAnswer(answerId);
      }

      setAnswers(answers.map(a =>
        a.id === answerId ? {
          ...a,
          total_upvotes: response.data.total_upvotes,
          total_downvotes: response.data.total_downvotes,
          has_upvoted: type === 'up' ? !a.has_upvoted : a.has_upvoted,
          has_downvoted: type === 'down' ? !a.has_downvoted : a.has_downvoted
        } : a
      ));

      // Refresh to sync exact state
      const aRes = await qnaAPI.getAnswers(id);
      setAnswers(aRes.data.results || aRes.data);

    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
        alert(error.response.data.error || "Permission denied");
      } else {
        alert("Action failed");
      }
    }
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      await qnaAPI.createAnswer({ question: id, content: newAnswer });
      setNewAnswer('');
      const aRes = await qnaAPI.getAnswers(id);
      setAnswers(aRes.data.results || aRes.data);
    } catch (error) {
      setSubmitError("Failed to submit answer.");
    }
  };

  const handleGiftClick = async (tutor) => {
      try {
          const res = await pointsAPI.getBalance();
          setUserCreditBalance(res.data.balance);
          setSelectedTutor(tutor);
          setIsGiftModalOpen(true);
      } catch (err) {
          console.error("Failed to fetch balance", err);
      }
  };

  const handleEditClick = () => {
    setEditData({ title: question.title, content: question.content });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({ title: '', content: '' });
  };

  const handleSaveEdit = async () => {
    try {
      await qnaAPI.updateQuestion(question.id, editData);
      setIsEditing(false);
      fetchData();
      alert('Question updated successfully! It will be reviewed for approval.');
    } catch (error) {
      console.error('Error updating question:', error);
      alert(error.response?.data?.error || 'Failed to update question');
    }
  };

  const handleDeleteQuestion = async () => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        await qnaAPI.deleteQuestion(question.id);
        alert('Question deleted successfully');
        navigate('/qna');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
      }
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex justify-center items-center flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-slate-300 dark:text-dark-text-muted" />
        <p className="text-slate-500 dark:text-dark-text-secondary text-lg font-medium">Question not found.</p>
        <Link to="/qna" className="text-violet-600 dark:text-violet-400 hover:underline">Back to Q&A</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg font-sans text-slate-600 dark:text-dark-text-secondary flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 w-full">

        {/* Question Card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm dark:shadow-dark-md border border-slate-200 dark:border-dark-border overflow-hidden mb-8">
          {/* Question Header */}
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-sm">
                  {question.student?.username?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                </div>
                <div>
                  <Link to={`/profile/${question.student?.username}`} className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    {question.student?.username}
                  </Link>
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-dark-text-muted">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs">{formatDateTime(question.created_at)}</span>
                  </div>
                </div>
              </div>

              {user && question.student?.id === user.id && !isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleEditClick}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteQuestion}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="px-6 sm:px-8 py-6">
            {isEditing ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-dark-text-primary mb-2">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-bg-secondary border border-slate-200 dark:border-dark-border rounded-xl focus:bg-white dark:focus:bg-dark-bg-tertiary focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-900 dark:text-dark-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-dark-text-primary mb-2">Content</label>
                  <textarea
                    value={editData.content}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-bg-secondary border border-slate-200 dark:border-dark-border rounded-xl focus:bg-white dark:focus:bg-dark-bg-tertiary focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all resize-y text-slate-900 dark:text-dark-text-primary"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary rounded-lg hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary transition-colors font-medium text-sm"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-dark-text-primary mb-4 leading-tight">{question.title}</h1>
                <div className="prose max-w-none text-slate-700 dark:text-dark-text-secondary whitespace-pre-wrap leading-relaxed">
                  {question.content}
                </div>
              </>
            )}
          </div>

          {/* Question Footer - Like */}
          {!isEditing && (
            <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-dark-bg-secondary border-t border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleQuestionUpvote}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    question.has_upvoted
                      ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 ring-1 ring-violet-200 dark:ring-violet-800/50'
                      : 'bg-white dark:bg-dark-card text-slate-600 dark:text-dark-text-secondary hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200 dark:border-dark-border'
                  }`}
                  title="Like this question"
                >
                  <ThumbsUp className={`w-4 h-4 ${question.has_upvoted ? 'fill-current' : ''}`} />
                  <span>{question.total_upvotes}</span>
                  <span className="text-slate-400 dark:text-dark-text-muted font-normal">likes</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Answers Count Header */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text-primary flex items-center gap-2">
             <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
             {answers.length} Answers
          </h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-dark-border"></div>
        </div>

        {/* Answers List */}
        <div className="space-y-4 mb-12">
          {answers.map(answer => (
            <div key={answer.id} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm dark:shadow-dark-md border border-slate-200 dark:border-dark-border overflow-hidden">
              {/* Answer Header */}
              <div className="px-6 pt-5 pb-3 border-b border-slate-50 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                      {answer.tutor?.username?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <div>
                      <Link to={`/profile/${answer.tutor?.username}`} className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                        {answer.tutor?.username}
                      </Link>
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-dark-text-muted">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">{formatDateTime(answer.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gift Coin Button */}
                  {user && user.user_type === 'student' && user.id !== answer.tutor?.id && (
                    <button
                      onClick={() => handleGiftClick(answer.tutor)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 border border-amber-200/50 dark:border-amber-800/40 transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5 mr-1.5" />
                      Gift Coin
                    </button>
                  )}
                </div>
              </div>

              {/* Answer Content */}
              <div className="px-6 py-5">
                <div className="prose max-w-none text-slate-700 dark:text-dark-text-secondary whitespace-pre-wrap leading-relaxed">
                  {answer.content}
                </div>
              </div>

              {/* Answer Footer - Like/Dislike */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-dark-bg-secondary border-t border-slate-100 dark:border-dark-border">
                <div className="flex items-center gap-3">
                  {/* Like Button */}
                  <button
                    onClick={() => handleAnswerVote(answer.id, 'up')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      answer.has_upvoted
                        ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 ring-1 ring-violet-200 dark:ring-violet-800/50'
                        : 'bg-white dark:bg-dark-card text-slate-600 dark:text-dark-text-secondary hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200 dark:border-dark-border'
                    }`}
                    title="Like"
                  >
                    <ThumbsUp className={`w-4 h-4 ${answer.has_upvoted ? 'fill-current' : ''}`} />
                    <span>{answer.total_upvotes}</span>
                  </button>

                  {/* Dislike Button */}
                  <button
                    onClick={() => handleAnswerVote(answer.id, 'down')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      answer.has_downvoted
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-800/50'
                        : 'bg-white dark:bg-dark-card text-slate-600 dark:text-dark-text-secondary hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-dark-border'
                    }`}
                    title="Dislike"
                  >
                    <ThumbsDown className={`w-4 h-4 ${answer.has_downvoted ? 'fill-current' : ''}`} />
                    <span>{answer.total_downvotes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {answers.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-dark-card rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border">
               <div className="w-12 h-12 bg-slate-50 dark:bg-dark-bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-slate-300 dark:text-dark-text-muted" />
               </div>
               <p className="text-slate-500 dark:text-dark-text-secondary font-medium">No answers yet.</p>
               <p className="text-slate-400 dark:text-dark-text-muted text-sm">Waiting for expert tutors to respond.</p>
            </div>
          )}
        </div>

        {/* Post Answer Section */}
        {user && user.user_type === 'tutor' ? (
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg dark:shadow-dark-lg shadow-violet-100 dark:shadow-violet-950/30 border border-violet-100 dark:border-violet-800/40 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-violet-50 dark:from-violet-950/40 to-white dark:to-dark-card border-b border-violet-100 dark:border-violet-800/40 flex items-center gap-2">
              <CornerDownRight className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3 className="text-lg font-bold text-violet-900 dark:text-violet-300">Write an Answer</h3>
            </div>
            <div className="p-6 sm:p-8">
              {submitError && (
                <div className="mb-6 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
              <form onSubmit={submitAnswer}>
                <textarea
                  className="w-full bg-slate-50 dark:bg-dark-bg-secondary border border-slate-200 dark:border-dark-border rounded-xl focus:bg-white dark:focus:bg-dark-bg-tertiary focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 p-4 text-slate-800 dark:text-dark-text-primary h-48 resize-y mb-6 transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted outline-none"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Share your knowledge! Write a helpful and detailed answer..."
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newAnswer.trim()}
                    className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/30 transition-all shadow-md shadow-violet-200 dark:shadow-violet-950/30 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                  >
                    Post Answer
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          !user ? (
            <div className="bg-gradient-to-br from-violet-50 dark:from-violet-950/30 to-fuchsia-50 dark:to-fuchsia-950/30 border border-violet-100 dark:border-violet-800/40 rounded-2xl p-8 text-center">
              <h3 className="text-lg font-bold text-violet-900 dark:text-violet-300 mb-2">Know the answer?</h3>
              <p className="text-violet-700/80 dark:text-violet-400/80 mb-6">Join our community of tutors to help students and earn reputation.</p>
              <div className="flex justify-center gap-4">
                 <Link to="/login" className="px-6 py-2.5 bg-white dark:bg-dark-card text-violet-600 dark:text-violet-400 font-semibold rounded-xl border border-violet-200 dark:border-violet-800/50 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors shadow-sm dark:shadow-dark-sm">
                    Log In
                 </Link>
                 <Link to="/signup" className="px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-sm">
                    Sign Up
                 </Link>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-dark-bg-secondary border border-slate-200 dark:border-dark-border rounded-2xl p-6 text-center">
              <p className="text-slate-500 dark:text-dark-text-secondary italic font-medium">Only registered Tutors can post answers.</p>
            </div>
          )
        )}
      </main>

      {/* Gift Modal */}
      {selectedTutor && (
        <GiftCoinModal
            isOpen={isGiftModalOpen}
            onClose={() => setIsGiftModalOpen(false)}
            tutorId={selectedTutor.id}
            tutorName={selectedTutor.username}
            currentBalance={userCreditBalance}
        />
      )}
      <Footer />
    </div>
  );
};

export default QuestionDetailsPage;
