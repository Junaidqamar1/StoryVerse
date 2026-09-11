
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        'https://storyverse-jsq5.onrender.com/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log('BACKEND RESPONSE:', data);

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          'Login failed'
        );
      }

      // Save real backend authentication data
      if (data.token) {
        localStorage.setItem(
          'storyverse_token',
          data.token
        );
      }

      if (data.user) {
        localStorage.setItem(
          'storyverse_user',
          JSON.stringify(data.user)
        );
      }

      // Real backend login succeeded
      navigate('/dashboard');

    } catch (error) {
      console.error('LOGIN ERROR:', error);

      setMessage(
        error.message || 'Unable to connect to backend'
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
          <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {message}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

        </form>

        <div className="text-center mt-6 text-sm text-stone-500">
          New here?{' '}
          <Link
            to="/register"
            className="font-semibold text-black"
          >
            Create an account
          </Link>
        </div>

      </div>

    </div>
  );
}
