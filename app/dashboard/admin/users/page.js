'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserList from '@/components/UserList';
import adminApi from '@/lib/api/adminApi';
import { useAuth } from '@/contexts/AuthContext';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersData = await adminApi.users.getAllUsers();
            setUsers(usersData);
            setError('');
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');

            // Log error
            try {
                adminApi.addSystemLog({
                    action: 'Error loading users',
                    user: { id: currentUser?.uid, email: currentUser?.email },
                    details: { errorMessage: err.message },
                    timestamp: new Date()
                });
            } catch (logErr) {
                console.error('Error logging error:', logErr);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (userId) => {
        router.push(`/dashboard/admin/users/${userId}`);
    };

    const handleDeactivateUser = async (userId) => {
        if (!confirm('Are you sure you want to deactivate this user?')) {
            return;
        }

        try {
            await adminApi.users.deactivateUser(userId);

            // Update local state to reflect the change
            setUsers(users.map(user =>
                user.id === userId ? { ...user, active: false } : user
            ));

            setSuccess('User deactivated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deactivating user:', err);
            setError('Failed to deactivate user. Please try again.');
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleReactivateUser = async (userId) => {
        if (!confirm('Are you sure you want to reactivate this user?')) {
            return;
        }

        try {
            await adminApi.users.reactivateUser(userId);

            // Update local state to reflect the change
            setUsers(users.map(user =>
                user.id === userId ? { ...user, active: true } : user
            ));

            setSuccess('User reactivated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error reactivating user:', err);
            setError('Failed to reactivate user. Please try again.');
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchUsers}
                        className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-100 text-gray-700"
                        title="Refresh user list"
                    >
                        Refresh
                    </button>
                    <Link
                        href="/dashboard/admin/users/add"
                        className="bg-[#0a66c2] text-white px-4 py-1.5 rounded-full hover:bg-[#004182] transition-colors font-medium"
                    >
                        Add New User
                    </Link>
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

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <UserList
                    users={users}
                    loading={loading}
                    onEdit={handleEditUser}
                    onDeactivate={handleDeactivateUser}
                    onReactivate={handleReactivateUser}
                />
            </div>
        </div>
    );
}