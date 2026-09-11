import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingClouds from '../components/FloatingClouds';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Please create a password';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(email, password);
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Registration could not be completed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#D4E8FA] flex flex-col justify-between overflow-hidden">
      {/* Subtle Floating Clouds touch */}
      <FloatingClouds variant="subtle" />

      {/* Top bar with back to home */}
      <header className="relative z-30 pt-6 px-6 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-black bg-white/70 backdrop-blur-xs px-4 py-2 rounded-full border border-white/80 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storyverse</span>
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl border-2 border-white/95 shadow-[0_24px_50px_rgba(20,45,75,0.1)] p-8 sm:p-10">
          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center mb-3 group">
              <div className="w-10 h-10 rounded-full bg-[#0D1116] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 stroke-[2]" />
              </div>
            </Link>
            <h1 className="font-craft-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-stone-500 text-sm mt-1.5 font-normal">
              Begin turning your thoughts into illustrated books
            </p>
          </div>

          {/* Server-level Error Alert */}
          {serverError && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormInput
              id="register-email"
              type="email"
              label="Email address"
              placeholder="oliver@storyverse.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                if (serverError) setServerError('');
              }}
              error={errors.email}
              autoComplete="email"
              required
            />

            <FormInput
              id="register-password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                if (serverError) setServerError('');
              }}
              error={errors.password}
              autoComplete="new-password"
              required
            />

            <FormInput
              id="register-confirm-password"
              type="password"
              label="Confirm password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                if (serverError) setServerError('');
              }}
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full text-base"
              >
                Create account
              </Button>
            </div>
          </form>

          {/* Link to Login */}
          <div className="mt-8 text-center text-xs text-stone-500 pt-4 border-t border-stone-100">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-stone-800 hover:text-black hover:underline ml-1"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-20 py-4 text-center text-xs text-stone-500">
        Storyverse &bull; Illustrated storybooks
      </footer>
    </div>
  );
}
