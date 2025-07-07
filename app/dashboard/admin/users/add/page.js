'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserForm from '@/components/UserForm';
import adminApi from '@/lib/api/adminApi';

export default function AddUserPage() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        setError('');

        try {
            await adminApi.users.createUser(formData);

            // Redirect to users list
            router.push('/dashboard/admin/users');
        } catch (err) {
            console.error('Error creating user:', err);

            // Handle common Firebase auth errors
            if (err.code === 'auth/email-already-in-use') {
                setError('This email address is already in use. Please try another one.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak. Please use a stronger password.');
            } else {
                setError(err.message || 'Failed to create user. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/admin/users');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/admin/users"
                        className="text-gray-700 hover:text-[#0a66c2] hover:underline"
                    >
                        ← Back to Users
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-[#FEF9F1] border border-[#FACCA6] text-[#b74700] rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <UserForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={submitting}
                    isNewUser={true}
                />
            </div>
        </div>
    );
}