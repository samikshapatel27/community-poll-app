import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from './api/config';

function AuthVerify({ onVerify }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await api.post('/api/auth/verify', {token});
          
          // Store the token in localStorage
          localStorage.setItem('token', response.data.token);
          
          // Set default authorization header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          // Notify parent component
          onVerify(response.data.user, response.data.token);
          
          // Redirect to home page after successful verification
          navigate('/');
        } catch (error) {
          console.error('Verification failed:', error);
          navigate('/login');
        }
      }
    };
    verifyToken();
  }, [token, onVerify, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your magic link...</p>
      </div>
    </div>
  );
}

export default AuthVerify;