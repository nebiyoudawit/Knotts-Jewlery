import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, adminLogin, error, clearError } = useShop();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      const success = isAdminLogin 
        ? await adminLogin(email, password)
        : await login(email, password);

      if (success) {
        navigate(isAdminLogin ? '/admin' : '/');
      } else {
        toast.error(error || (isAdminLogin 
          ? 'Invalid admin credentials' 
          : 'Invalid email or password'));
      }
    } catch (err) {
      toast.error(error || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100%] flex items-start justify-center bg-gray-50 pt-10 pb-10 overflow-hidden">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <img src="/logo.png" alt="Logo" className="w-40 mx-auto mb-8" />
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isAdminLogin ? 'Admin Login' : 'User Login'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#05B171]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#05B171]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="admin-login"
              checked={isAdminLogin}
              onChange={() => {
                clearError();
                setIsAdminLogin(!isAdminLogin);
              }}
              className="h-4 w-4 text-[#05B171] focus:ring-[#05B171] border-gray-300 rounded"
            />
            <label htmlFor="admin-login" className="ml-2 block text-sm text-gray-700">
              Admin Login
            </label>
          </div>
          
          <button
            type="submit"
            className={`w-full bg-[#05B171] text-white py-2 rounded-md hover:bg-[#048a5b] transition-colors flex justify-center items-center ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center space-y-3">
          {!isAdminLogin && (
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-[#05B171] hover:underline font-medium">
                Register here
              </a>
            </p>
          )}
          <p className="text-gray-600">
            <a href="/forgot-password" className="text-[#05B171] hover:underline text-sm">
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;