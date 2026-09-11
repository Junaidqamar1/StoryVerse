
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  console.log('✅ LoginPage loaded');

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log('🔥 LOGIN BUTTON CLICKED');
    console.log('Email:', email);

    setLoading(true);
    setError('');

    try {
      const backendUrl =
        'https://storyverse-jsq5.onrender.com/auth/login';

      console.log('➡️ Sending request to:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      console.log('⬅️ Backend status:', response.status);

      const data = await response.json();

      console.log('⬅️ Backend response:', data);

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          `Login failed: ${response.status}`
        );
      }

      console.log('✅ LOGIN SUCCESS');

      if (data.token) {
        localStorage.setItem(
          'storyverse_token',
          data.token
        );

        console.log('✅ Token saved');
      }

      if (data.user) {
        localStorage.setItem(
          'storyverse_user',
          JSON.stringify(data.user)
        );

        console.log('✅ User saved:', data.user);
      }

      console.log('➡️ Redirecting to dashboard...');

      navigate('/dashboard');

    } catch (err) {
      console.error('❌ LOGIN FAILED:', err);

      setError(
        err.message ||
        'Something went wrong while logging in.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D4E8FA] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* Header */}

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-stone-900">
            Welcome back
          </h1>

          <p className="text-stone-500 mt-2">
            Log in to your StoryVerse account
          </p>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* Email */}

          <div>

            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700 mb-2"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                console.log(
                  'Email changed:',
                  e.target.value
                );

                setEmail(e.target.value);
              }}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black"
            />

          </div>

          {/* Password */}

          <div>

            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700 mb-2"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                console.log('Password changed');

                setPassword(e.target.value);
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black"
            />

          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-stone-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Log in'}
          </button>

        </form>

        {/* Register */}

        <div className="text-center mt-7 text-sm text-stone-500">

          <span>New here? </span>

          <Link
            to="/register"
            className="font-semibold text-black hover:underline"
          >
            Create an account
          </Link>

        </div>

      </div>

    </div>
  );
}
