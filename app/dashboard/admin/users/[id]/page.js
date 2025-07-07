'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserForm from '@/components/UserForm';
import adminApi from '@/lib/api/adminApi';

export default function EditUserPage({ params }) {
    const { id } = params;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await adminApi.users.getUserById(id);
                setUserData(data);
                setError('');
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // Update user in Firestore
            await adminApi.users.updateUser(id, {
                displayName: formData.displayName,
                role: formData.role,
                active: formData.active
            });

            setSuccess('User updated successfully');

            // Refresh user data
            const updatedData = await adminApi.users.getUserById(id);
            setUserData(updatedData);
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err.message || 'Failed to update user. Please try again.');
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
                    <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-[#FEF9F1] border border-[#FACCA6] text-[#b74700] rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-[#F0FAF0] border border-[#C0E6C0] text-[#057642] rounded-md">
                    {success}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
                    </div>
                ) : userData ? (
                    <UserForm
                        initialData={userData}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={submitting}
                        isNewUser={false}
                    />
                ) : (
                    <div className="text-center py-8">
                        <p className="text-lg text-gray-500">User not found</p>
                    </div>
                )}
            </div>
        </div>
    );
}