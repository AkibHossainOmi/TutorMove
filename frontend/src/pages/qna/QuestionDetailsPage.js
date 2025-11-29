import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { qnaAPI, pointsAPI } from '../../utils/apiService';
import { useAuth } from '../../contexts/UseAuth';
import Navbar from '../../components/Navbar';
import GiftCoinModal from '../../components/GiftCoinModal';

const QuestionDetailsPage = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const [submitError, setSubmitError] = useState('');

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
          // Fallback or show error
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500 text-lg">Question not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex gap-6">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleQuestionUpvote}
                className={`p-1 rounded hover:bg-gray-100 transition-colors ${question.has_upvoted ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
                title="Upvote Question"
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-xl font-bold text-gray-700">{question.total_upvotes}</span>
            </div>

            {/* Content Section */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
                {question.content}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Asked by</span>
                  <span className="font-semibold text-indigo-600">{question.student?.username}</span>
                </div>
                <span className="text-gray-400">
                  {new Date(question.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Count Header */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900">{answers.length} Answers</h2>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        {/* Answers List */}
        <div className="space-y-6 mb-10">
          {answers.map(answer => {
            const score = answer.total_upvotes - answer.total_downvotes;
            return (
              <div key={answer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex gap-6">
                {/* Vote Controls */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button
                    onClick={() => handleAnswerVote(answer.id, 'up')}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${answer.has_upvoted ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
                    title="Upvote"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className={`font-bold text-lg ${score > 0 ? 'text-indigo-600' : score < 0 ? 'text-red-500' : 'text-gray-600'}`}>
                    {score}
                  </span>
                  <button
                    onClick={() => handleAnswerVote(answer.id, 'down')}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${answer.has_downvoted ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                    title="Downvote"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Answer Content */}
                <div className="flex-1">
                  <div className="prose max-w-none text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed">
                    {answer.content}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                          {answer.tutor?.username?.[0]?.toUpperCase() || 'T'}
                        </div>
                        <span className="font-medium text-gray-900">{answer.tutor?.username}</span>
                        <span>•</span>
                        <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Gift Coin Button */}
                      {user && user.user_type === 'student' && user.id !== answer.tutor?.id && (
                          <button
                            onClick={() => handleGiftClick(answer.tutor)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.858 5.485a1 1 0 00-1.715 1.03L7.633 9H7a1 1 0 100 2h1.838l.179 1.074c.128.766.726 1.347 1.488 1.446l.495.064c.783.102 1.446-.543 1.345-1.326l-.064-.495a1.2 1.2 0 00-1.22-1.042l-1.954-.253-.178-1.074H13a1 1 0 100-2h-2.383l1.49-2.485a1 1 0 00-1.715-1.03L8.91 8.243 7.858 5.485z" clipRule="evenodd" />
                             </svg>
                             Gift Coin
                          </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}

          {answers.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No answers yet. Waiting for a tutor to respond.</p>
            </div>
          )}
        </div>

        {/* Post Answer Section */}
        {user && user.user_type === 'tutor' ? (
          <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50/50 border-b border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-900">Your Answer</h3>
            </div>
            <div className="p-6">
              {submitError && (
                <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100">
                  {submitError}
                </div>
              )}
              <form onSubmit={submitAnswer}>
                <textarea
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-gray-800 h-40 resize-y mb-4"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Write a helpful and detailed answer..."
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                  >
                    Post Answer
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          !user ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
              <p className="text-blue-800 mb-2">Join the community to answer questions.</p>
              <p className="text-sm text-blue-600">
                Please <a href="/login" className="underline font-semibold hover:text-blue-800">log in</a> as a Tutor to contribute.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-500 italic">Only registered Tutors can post answers.</p>
            </div>
          )
        )}
      </div>

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
    </div>
  );
};

export default QuestionDetailsPage;
