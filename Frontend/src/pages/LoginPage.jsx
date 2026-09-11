
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      console.log('Logging in user:', email);
      await login(email.trim(), password);
      console.log('Login successful! Navigating to dashboard...');
      navigate('/dashboard');
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      setMessage(
        error.message || 'Unable to connect to server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D4E8FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-stone-900">
          Welcome back
        </h1>

        <p className="text-center text-stone-500 mt-2 mb-8">
          Log in to StoryVerse
        </p>

        {message && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm leading-relaxed">
            {message}
          </div>
        )}

        {loading && (
          <div className="mb-5 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs text-center animate-pulse">
            Connecting to server... (If backend was asleep on Render, waking it up may take up to ~30 seconds)
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-stone-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-stone-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-stone-800 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-stone-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-black hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
