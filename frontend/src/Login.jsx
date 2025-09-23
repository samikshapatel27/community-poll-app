import { useState } from 'react';
import axios from 'axios';

// Login component for magic link authentication
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate email input
    if (!email.trim()) {
      setMessage('Please enter your email address!');
      setLoading(false);
      return;
    }

    try {
      // Send magic link request to backend
      const response = await axios.post('http://localhost:5000/api/auth/login', { email });
      setMessage(response.data.message);
      setEmail(''); // Clear input after success
    } catch (error) {
      console.error('Error sending magic link:', error);
      setMessage('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Login with Magic Link</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            disabled={loading}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending...
              </span>
            ) : (
              'Send Magic Link'
            )}
          </button>
        </div>

        {/* Display success/error messages */}
        {message && (
          <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
            {message}
          </div>
        )}

        <p className="text-sm text-gray-600 text-center pt-4">
          You'll receive a magic link in your email. Click it to login instantly!
        </p>
      </form>
    </div>
  );
}

export default Login;