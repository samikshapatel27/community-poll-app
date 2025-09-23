import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import CreatePoll from './CreatePoll';
import PollsList from './PollsList';
import Login from './Login';
import AuthVerify from './AuthVerify';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

// Navigation component with responsive design
function Navigation({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">🗳️ Community Polls</h1>
          <div className="flex items-center space-x-4">
            <Link to="/" className="hover:text-blue-200 transition-colors px-3 py-2 rounded hover:bg-white/10">Create Poll</Link>
            <Link to="/polls" className="hover:text-blue-200 transition-colors px-3 py-2 rounded hover:bg-white/10">View Polls</Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm hidden sm:block">Welcome, {user.email}!</span>
                <button 
                  onClick={handleLogout}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Main App component with authentication state management
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('http://localhost:5000/api/auth/me');
        
          setUser(response.data.user);
          toast.success('Welcome back!');
        } catch (error) {
          console.error('Token validation failed', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          toast.error('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Handle successful login
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    toast.success('Login successful!');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navigation user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={user ? <CreatePoll /> : <Login onLogin={handleLogin} />} />
            <Route path="/polls" element={<PollsList />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/auth/verify" element={<AuthVerify onVerify={handleLogin} />} />
          </Routes>
        </main>
        {/* Toast notifications configuration */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;