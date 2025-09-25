import { useState } from 'react';
import api from './api/config';
import { useNavigate } from 'react-router-dom';

function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Check authentication status
  const isLoggedIn = localStorage.getItem('token');

  // Handle poll form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage('');

    // Validate inputs
    if (!question.trim()) {
      setMessage('Please enter a question!');
      setLoading(false);
      return;
    }

    const nonEmptyOptions = options.filter(option => option.trim() !== '');
    if (nonEmptyOptions.length < 2) {
      setMessage('Please add at least two options!');
      setLoading(false);
      return;
    }

    try {
      // Get token from localStorage and include in request
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to create a poll');
        navigate('/login');
        return;
      }

      const response = await api.post(`/api/polls`, {
        question: question.trim(),
        options: nonEmptyOptions,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Store that this user created this poll for deletion tracking
      const userPolls = JSON.parse(localStorage.getItem('userPolls') || '[]');
      userPolls.push(response.data._id);
      localStorage.setItem('userPolls', JSON.stringify(userPolls));
      
      setMessage('Poll created successfully!');
      setQuestion('');
      setOptions(['', '']);
    } catch (error) {
      console.error('Error creating poll:', error);
      if (error.response?.status === 401) {
        setMessage('Your session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setMessage('Failed to create poll. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update option text
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Add new option field
  const addOption = () => {
    setOptions([...options, '']);
  };

  // Remove option field
  const removeOption = (index) => {
    if (options.length <= 2) {
      setMessage('A poll must have at least two options!');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // Show login prompt if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to create polls.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-md"
        >
          Login Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create a New Poll</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question input field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Poll Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's your favorite programming language?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          />
        </div>

        {/* Dynamic options fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold"
                    disabled={loading}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addOption}
            className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            disabled={loading}
          >
            + Add Option
          </button>
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </span>
            ) : (
              'Create Poll'
            )}
          </button>
        </div>

        {/* Status messages */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('success') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default CreatePoll;