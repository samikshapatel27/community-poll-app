import { useState, useEffect } from 'react';
import api from './api/config';
import { io } from 'socket.io-client';
const API_URL = import.meta.env.VITE_API_URL;

function PollsList() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState({});

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/polls')
      setPolls(response.data);
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Failed to load polls. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();

    // Setup Socket.io for real-time updates
    const socket = io('http://localhost:5000');
    
    socket.on('vote-update', (updatedPoll) => {
      setPolls(prevPolls =>
        prevPolls.map(poll =>
          poll._id === updatedPoll._id ? updatedPoll : poll
        )
      );
    });

    // Listen for poll deletion events
    socket.on('poll-deleted', (deletedPollId) => {
      setPolls(prevPolls => prevPolls.filter(poll => poll._id !== deletedPollId));
    });

    // Cleanup socket connection
    return () => socket.disconnect();
  }, []);

  // Handle voting
  const handleVote = async (pollId, optionIndex) => {
    try {
      const response = await api.post(`/api/polls/${pollId}/vote`, {
        optionIndex: optionIndex
      });
      setPolls(prevPolls =>
        prevPolls.map(poll =>
          poll._id === response.data._id ? response.data : poll
        )
      );
    } catch (err) {
      console.error('Error voting:', err);
      alert('Failed to vote. Please try again.');
    }
  };

  // Handle poll deletion
  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(prev => ({ ...prev, [pollId]: true }));
      await api.delete(`/api/polls/${pollId}`);

      // Poll will be removed via socket.io event
    } catch (err) {
      console.error('Error deleting poll:', err);
      if (err.response?.status === 403) {
        alert('You can only delete your own polls.');
      } else {
        alert('Failed to delete poll. Please try again.');
      }
    } finally {
      setDeleting(prev => ({ ...prev, [pollId]: false }));
    }
  };

  // Check if current user is the poll creator
  const isPollCreator = (poll) => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return localStorage.getItem('userPolls')?.includes(poll._id);
  };

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Community Polls</h2>
      
      {polls.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-gray-600 text-lg">No polls yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
            return (
              <div key={poll._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow relative">
                
                {/* Delete button */}
                <button
                  onClick={() => handleDeletePoll(poll._id)}
                  disabled={deleting[poll._id]}
                  className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                  title="Delete poll"
                >
                  {deleting[poll._id] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>

                <h3 className="text-xl font-semibold text-gray-800 mb-4 pr-8">{poll.question}</h3>
                
                <div className="space-y-3">
                  {poll.options.map((option, index) => {
                    const percentage = calculatePercentage(option.votes, totalVotes);
                    return (
                      <div key={index} className="relative">
                        <button
                          onClick={() => handleVote(poll._id, index)}
                          className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{option.text}</span>
                            <span className="text-sm text-gray-600">{option.votes} votes ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  Created on: {new Date(poll.createdAt).toLocaleDateString()} • Total votes: {totalVotes}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PollsList;