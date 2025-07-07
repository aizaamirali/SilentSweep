'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthentication } from '@/hooks/useAuthentication';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showResetForm, setShowResetForm] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const { error, loading, handleLogin, handlePasswordReset } = useAuthentication();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleLogin(formData.email, formData.password);
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        const success = await handlePasswordReset(resetEmail);
        if (success) {
            setResetSuccess(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#f3f2ef]">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Innovatech EMMS</h1>
                    <p className="mt-2 text-gray-600">Employee Management Made Simple</p>
                </div>

                {!showResetForm ? (
                    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                        <h2 className="text-xl font-semibold text-center mb-6 text-gray-900">Sign In</h2>

                        {error && (
                            <div className="mb-6 p-4 bg-[#FEF9F1] border border-[#FACCA6] text-[#b74700] rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-5">
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition text-gray-900 placeholder-gray-500"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-900">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowResetForm(true)}
                                    className="text-xs text-[#0a66c2] hover:text-[#004182] font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition text-gray-900 placeholder-gray-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0a66c2] text-white p-3 rounded-full hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </div>
                            ) : 'Sign In'}
                        </button>

                        <div className="mt-4 text-center">
                            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                                Back to Home
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleResetSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                        <h2 className="text-xl font-semibold text-center mb-6 text-gray-900">Reset Password</h2>

                        {error && (
                            <div className="mb-6 p-4 bg-[#FEF9F1] border border-[#FACCA6] text-[#b74700] rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {resetSuccess && (
                            <div className="mb-6 p-4 bg-[#F0FAF0] border border-[#C0E6C0] text-[#057642] rounded-md text-sm">
                                Password reset email sent. Please check your inbox.
                            </div>
                        )}

                        <div className="mb-6">
                            <label htmlFor="resetEmail" className="block mb-2 text-sm font-medium text-gray-900">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    id="resetEmail"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition text-gray-900 placeholder-gray-500"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-600">
                                We&apos;ll send a password reset link to this email address.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0a66c2] text-white p-3 rounded-full hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </div>
                            ) : 'Send Reset Link'}
                        </button>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => setShowResetForm(false)}
                                className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium"
                            >
                                Back to login
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                    <p className="text-sm font-medium text-gray-900 mb-3">Demo Credentials</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f3f2ef] p-3 rounded-md">
                            <p className="text-sm font-medium text-[#0a66c2]">Admin</p>
                            <p className="text-xs text-gray-700">admin@emms.com</p>
                            <p className="text-xs text-gray-700">admin123</p>
                        </div>
                        <div className="bg-[#f3f2ef] p-3 rounded-md">
                            <p className="text-sm font-medium text-[#0a66c2]">CEO</p>
                            <p className="text-xs text-gray-700">ceo@emms.com</p>
                            <p className="text-xs text-gray-700">ceo123</p>
                        </div>
                        <div className="bg-[#f3f2ef] p-3 rounded-md">
                            <p className="text-sm font-medium text-[#0a66c2]">Manager</p>
                            <p className="text-xs text-gray-700">manager@emms.com</p>
                            <p className="text-xs text-gray-700">manager123</p>
                        </div>
                        <div className="bg-[#f3f2ef] p-3 rounded-md">
                            <p className="text-sm font-medium text-[#0a66c2]">Employee</p>
                            <p className="text-xs text-gray-700">employee@emms.com</p>
                            <p className="text-xs text-gray-700">employee123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}