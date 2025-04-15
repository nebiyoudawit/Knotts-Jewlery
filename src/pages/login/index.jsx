import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from '../../data/auth.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = authenticateUser(email, password);
    
    if (user) {
      // Store user data in localStorage (simplified auth)
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Redirect based on role
      if (user.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-[100%] flex items-start justify-center bg-gray-50 pt-10 pb-10 overflow-hidden">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <img src="/logo.png" alt="Logo" className="w-40 mx-auto mb-8" />
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#05B171] text-white py-2 rounded-md hover:bg-[#048a5b] transition-colors"
          >
            Login
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-[#05B171] hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;