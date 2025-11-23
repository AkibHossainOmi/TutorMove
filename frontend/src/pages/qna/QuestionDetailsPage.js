import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { qnaAPI } from '../../utils/apiService';
import { useAuth } from '../../contexts/AuthContext';

const QuestionDetailsPage = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState('');

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
          // Update has_upvoted/downvoted based on server logic or optimistic update
          // Since the server toggles, we need to reflect that.
          // But getting the exact state back is better. The updated serializer returns fields.
          // Wait, the action returns new totals, but we might need to refetch or assume logic.
          // For simplicity, let's just refetch answers to be sure about "has_upvoted" state,
          // or assume the response could include user state if we modified the view (which we didn't fully).
          // Actually, let's just refetch answers to keep state sync clean or update totals.
          // If we just update totals, the button color won't flip unless we manually flip it.
        } : a
      ));
      // Reload answers to get correct 'has_upvoted' state
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
      // Refresh answers
      const aRes = await qnaAPI.getAnswers(id);
      setAnswers(aRes.data.results || aRes.data);
      // Refresh question to update answer count if needed (though count is on question list mostly)
    } catch (error) {
      setSubmitError("Failed to submit answer.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!question) return <div>Question not found.</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Question Section */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <div className="flex">
          <div className="flex flex-col items-center mr-4">
            <button
              onClick={handleQuestionUpvote}
              className={`text-2xl ${question.has_upvoted ? 'text-blue-600' : 'text-gray-400'}`}
            >
              ▲
            </button>
            <span className="font-bold text-lg">{question.total_upvotes}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
            <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
            <div className="text-sm text-gray-500 mt-4">
              Asked by {question.student?.username} on {new Date(question.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">{answers.length} Answers</h2>

      {/* Answers List */}
      <div className="space-y-6 mb-8">
        {answers.map(answer => (
          <div key={answer.id} className="bg-white p-6 rounded shadow flex">
            <div className="flex flex-col items-center mr-4 space-y-2">
              <button
                onClick={() => handleAnswerVote(answer.id, 'up')}
                className={`text-xl ${answer.has_upvoted ? 'text-blue-600' : 'text-gray-400'}`}
                title="Upvote"
              >
                ▲
              </button>
              <span className="font-bold">{answer.total_upvotes - answer.total_downvotes}</span>
              <button
                onClick={() => handleAnswerVote(answer.id, 'down')}
                className={`text-xl ${answer.has_downvoted ? 'text-red-600' : 'text-gray-400'}`}
                title="Downvote"
              >
                ▼
              </button>
            </div>
            <div className="flex-grow">
               <div className="text-gray-800 whitespace-pre-wrap">{answer.content}</div>
               <div className="text-sm text-gray-500 mt-4">
                 Answered by <span className="font-semibold text-blue-600">{answer.tutor?.username}</span> on {new Date(answer.created_at).toLocaleDateString()}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Form */}
      {user && user.user_type === 'tutor' ? (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-bold mb-4">Post your Answer</h3>
          {submitError && <div className="text-red-500 mb-2">{submitError}</div>}
          <form onSubmit={submitAnswer}>
            <textarea
              className="w-full border p-2 rounded h-32 mb-4"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer here..."
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Post Answer
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
           {user ? "Only Tutors can answer questions." : "Log in as a Tutor to answer."}
        </div>
      )}
    </div>
  );
};

export default QuestionDetailsPage;
