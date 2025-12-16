// src/pages/qna/QuestionDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { qnaAPI, pointsAPI } from '../../utils/apiService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import GiftCoinModal from '../../components/GiftCoinModal';
import { ArrowUp, ArrowDown, Trash2, Edit2, User, Clock, MessageSquare, Gift, CornerDownRight, AlertCircle, Save, X } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 text-lg font-medium">Question not found.</p>
        <Link to="/qna" className="text-indigo-600 hover:underline">Back to Q&A</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 w-full">

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="flex gap-6">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1 min-w-[3rem]">
              <button
                onClick={handleQuestionUpvote}
                className={`p-2 rounded-lg transition-all ${
                  question.has_upvoted
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-500'
                }`}
                title="Upvote Question"
                disabled={isEditing}
              >
                <ArrowUp className={`w-6 h-6 ${question.has_upvoted ? 'fill-current' : ''}`} />
              </button>
              <span className={`text-xl font-bold ${question.has_upvoted ? 'text-indigo-600' : 'text-slate-600'}`}>
                {question.total_upvotes}
              </span>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                    <textarea
                      value={editData.content}
                      onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                    >
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                    >
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 leading-tight">{question.title}</h1>
                  <div className="prose max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed mb-8">
                    {question.content}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 text-sm">
                    <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                           <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                              {question.student?.username?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
                           </div>
                           <Link to={`/profile/${question.student?.username}`} className="text-slate-700 hover:text-indigo-600 hover:underline">
                              {question.student?.username}
                           </Link>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <Clock className="w-3.5 h-3.5" />
                           <span>
                              {new Date(question.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </span>
                        </div>
                    </div>

                    {user && question.student?.id === user.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={handleEditClick}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                            Edit
                          </button>
                          <button
                            onClick={handleDeleteQuestion}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Delete
                          </button>
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Answers Count Header */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <MessageSquare className="w-5 h-5 text-indigo-600" />
             {answers.length} Answers
          </h2>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        {/* Answers List */}
        <div className="space-y-6 mb-12">
          {answers.map(answer => {
            const score = answer.total_upvotes - answer.total_downvotes;
            return (
              <div key={answer.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex gap-6 group">
                {/* Vote Controls */}
                <div className="flex flex-col items-center gap-1 pt-1 min-w-[3rem]">
                  <button
                    onClick={() => handleAnswerVote(answer.id, 'up')}
                    className={`p-1.5 rounded-lg transition-colors ${
                       answer.has_upvoted ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                    title="Upvote"
                  >
                    <ArrowUp className={`w-5 h-5 ${answer.has_upvoted ? 'fill-current' : ''}`} />
                  </button>

                  <span className={`font-bold text-lg ${score > 0 ? 'text-indigo-600' : score < 0 ? 'text-rose-500' : 'text-slate-600'}`}>
                    {score}
                  </span>

                  <button
                    onClick={() => handleAnswerVote(answer.id, 'down')}
                    className={`p-1.5 rounded-lg transition-colors ${
                       answer.has_downvoted ? 'bg-rose-50 text-rose-600' : 'text-slate-400 hover:bg-slate-50 hover:text-rose-600'
                    }`}
                    title="Downvote"
                  >
                    <ArrowDown className={`w-5 h-5 ${answer.has_downvoted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Answer Content */}
                <div className="flex-1 min-w-0">
                  <div className="prose max-w-none text-slate-800 whitespace-pre-wrap mb-6 leading-relaxed">
                    {answer.content}
                  </div>

                  <div className="flex flex-wrap justify-between items-center pt-4 border-t border-slate-50 gap-4">
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                         <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                              {answer.tutor?.username?.[0]?.toUpperCase() || 'T'}
                            </div>
                            <Link to={`/profile/${answer.tutor?.username}`} className="text-slate-700 hover:text-indigo-600 hover:underline">
                               {answer.tutor?.username}
                            </Link>
                         </div>
                         <span>•</span>
                         <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Gift Coin Button */}
                      {user && user.user_type === 'student' && user.id !== answer.tutor?.id && (
                          <button
                            onClick={() => handleGiftClick(answer.tutor)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 transition-colors shadow-sm"
                          >
                             <Gift className="w-3.5 h-3.5 mr-1.5" />
                             Gift Coin
                          </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}

          {answers.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
               <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-slate-300" />
               </div>
               <p className="text-slate-500 font-medium">No answers yet.</p>
               <p className="text-slate-400 text-sm">Waiting for expert tutors to respond.</p>
            </div>
          )}
        </div>

        {/* Post Answer Section */}
        {user && user.user_type === 'tutor' ? (
          <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100 border border-indigo-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100 flex items-center gap-2">
              <CornerDownRight className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-indigo-900">Write an Answer</h3>
            </div>
            <div className="p-6 sm:p-8">
              {submitError && (
                <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
              <form onSubmit={submitAnswer}>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 p-4 text-slate-800 h-48 resize-y mb-6 transition-all placeholder:text-slate-400 outline-none"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Share your knowledge! Write a helpful and detailed answer..."
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newAnswer.trim()}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                  >
                    Post Answer
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          !user ? (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-8 text-center">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Know the answer?</h3>
              <p className="text-indigo-700/80 mb-6">Join our community of tutors to help students and earn reputation.</p>
              <div className="flex justify-center gap-4">
                 <Link to="/login" className="px-6 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm">
                    Log In
                 </Link>
                 <Link to="/signup" className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                    Sign Up
                 </Link>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <p className="text-slate-500 italic font-medium">Only registered Tutors can post answers.</p>
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
