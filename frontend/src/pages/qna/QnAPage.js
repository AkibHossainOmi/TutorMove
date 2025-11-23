import React, { useState, useEffect } from 'react';
import { qnaAPI } from '../../utils/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const QnAPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await qnaAPI.getQuestions();
      setQuestions(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const response = await qnaAPI.upvoteQuestion(id);
      setQuestions(questions.map(q =>
        q.id === id ? { ...q, total_upvotes: response.data.total_upvotes, has_upvoted: !q.has_upvoted } : q
      ));
    } catch (error) {
      console.error("Error upvoting:", error);
      alert("Please login to vote");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Q&A Forum</h1>
        {user && user.user_type === 'student' && (
          <Link to="/qna/create" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Ask a Question
          </Link>
        )}
      </div>

      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="border p-4 rounded shadow bg-white">
              <Link to={`/qna/${q.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                {q.title}
              </Link>
              <p className="text-gray-600 mt-2 line-clamp-2">{q.content}</p>
              <div className="flex items-center mt-4 text-sm text-gray-500 space-x-4">
                <span>Asked by {q.student?.username || 'Unknown'}</span>
                <span>{new Date(q.created_at).toLocaleDateString()}</span>
                <span>{q.answers_count} Answers</span>
                <button
                  onClick={() => handleUpvote(q.id)}
                  className={`flex items-center space-x-1 ${q.has_upvoted ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
                >
                  <span>▲</span>
                  <span>{q.total_upvotes}</span>
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
             <p className="text-gray-500 text-center">No questions yet. Be the first to ask!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QnAPage;
