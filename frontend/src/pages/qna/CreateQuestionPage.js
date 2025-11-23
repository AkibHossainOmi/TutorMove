import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { qnaAPI } from '../../utils/apiService';
import Navbar from '../../components/Navbar';

const CreateQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      await qnaAPI.createQuestion({ title, content });
      navigate('/qna');
    } catch (err) {
      console.error("Error creating question:", err);
      setError("Failed to create question. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4 max-w-2xl pt-20">
      <h1 className="text-2xl font-bold mb-6">Ask a Question</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question?"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Details</label>
          <textarea
            className="w-full border p-2 rounded h-32"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide more context..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Question'}
        </button>
      </form>
      </div>
    </div>
  );
};

export default CreateQuestionPage;
