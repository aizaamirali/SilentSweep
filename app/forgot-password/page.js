'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthentication } from '@/hooks/useAuthentication';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const { error, loading, handlePasswordReset } = useAuthentication();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await handlePasswordReset(email);
        if (success) {
            setMessage('Password reset link sent! Check your email inbox for instructions.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#f3f2ef]">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Innovatech EMMS</h1>
                    <p className="mt-2 text-gray-600">Password Recovery</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                    <h2 className="text-xl font-semibold text-center mb-4 text-gray-900">Reset Your Password</h2>
                    <p className="text-gray-600 text-center mb-6">
                        Enter the email address associated with your account, and we&apos;ll send you a link to reset your password.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-[#FEF9F1] border border-[#FACCA6] text-[#b74700] rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-[#F0FAF0] border border-[#C0E6C0] text-[#057642] rounded-md text-sm">
                            {message}
                        </div>
                    )}

                    <div className="mb-6">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition text-gray-900 placeholder-gray-500"
                                placeholder="you@example.com"
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
                                Sending...
                            </div>
                        ) : 'Send Reset Link'}
                    </button>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm text-[#0a66c2] hover:text-[#004182] font-medium"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Having trouble? Contact support at <a href="mailto:support@innovatech.com" className="text-[#0a66c2] hover:underline font-medium">support@innovatech.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
}