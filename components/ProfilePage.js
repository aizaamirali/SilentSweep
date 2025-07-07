'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import adminApi from '@/lib/api/adminApi';

export default function ProfilePage() {
    const { currentUser, userRole } = useAuth();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
    });

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            // Set initial data from currentUser
            setFormData(prev => ({
                ...prev,
                displayName: currentUser.displayName || '',
                email: currentUser.email || ''
            }));

            // Fetch additional user data from Firestore using the API
            fetchUserData();
        }
    }, [currentUser]);

    const fetchUserData = async () => {
        if (!currentUser) return;

        try {
            // Fixed: Use the correct API structure
            const userData = await adminApi.users.getUserById(currentUser.uid);
            setUserData(userData);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            // Check if we're updating email or password
            const updatingEmail = formData.email !== currentUser.email;
            const updatingPassword = formData.newPassword && formData.newPassword.length > 0;

            // If updating email or password, we need to reauthenticate first
            if ((updatingEmail || updatingPassword) && formData.currentPassword) {
                const credential = EmailAuthProvider.credential(
                    currentUser.email,
                    formData.currentPassword
                );
                await reauthenticateWithCredential(currentUser, credential);
            }

            // Update profile data using adminApi
            const updates = {};

            // Update display name if changed
            if (formData.displayName !== currentUser.displayName) {
                updates.displayName = formData.displayName;

                // Also update in Firebase Auth
                await updateProfile(currentUser, {
                    displayName: formData.displayName
                });
            }

            // Update email if changed
            if (updatingEmail) {
                updates.email = formData.email;

                // Also update in Firebase Auth
                await updateEmail(currentUser, formData.email);
            }

            // If we have updates to make to the Firestore document
            if (Object.keys(updates).length > 0) {
                await adminApi.userManagementApi.updateUser(currentUser.uid, updates);
            }

            // Update password if provided
            if (updatingPassword) {
                // Verify passwords match
                if (formData.newPassword !== formData.confirmPassword) {
                    throw new Error('New passwords do not match');
                }

                await updatePassword(currentUser, formData.newPassword);
            }

            setSuccess('Profile updated successfully');

            // Reset password fields
            setFormData(prev => ({
                ...prev,
                newPassword: '',
                confirmPassword: '',
                currentPassword: ''
            }));

            // Refresh user data
            fetchUserData();

        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Summary - LinkedIn style */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:col-span-1">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-[#e7f3ff] border border-[#0a66c2] flex items-center justify-center text-4xl text-[#0a66c2] mb-4">
                            {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{formData.displayName}</h2>
                        <p className="text-sm text-gray-600 mt-1">{formData.email}</p>

                        <div className="mt-4 w-full">
                            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                                <span className="text-gray-600">Role</span>
                                <span className="font-medium text-gray-900 capitalize">{userRole}</span>
                            </div>
                            {userData && (
                                <>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Status</span>
                                        <span className={`font-medium ${userData.active ? 'text-[#057642]' : 'text-[#b74700]'}`}>
                                            {userData.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2">
                                        <span className="text-gray-600">Joined</span>
                                        <span className="font-medium text-gray-900">
                                            {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Form - LinkedIn style */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Profile</h2>

                    {error && (
                        <div className="mb-4 p-4 bg-[#FEF9F1] border border-[#FACCA6] text-[#b74700] rounded-md">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-[#F0FAF0] border border-[#C0E6C0] text-[#057642] rounded-md">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="displayName" className="block mb-1 text-sm font-medium text-gray-900">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-900">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Changing email requires re-authentication
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-3">Change Password</h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="newPassword" className="block mb-1 text-sm font-medium text-gray-900">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-900">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div>
                                <label htmlFor="currentPassword" className="block mb-1 text-sm font-medium text-gray-900">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Required to change email or password
                                </p>
                            </div>
                        </div>

                        <div className="pt-5">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full px-4 py-2.5 bg-[#0a66c2] text-white rounded-full hover:bg-[#004182] transition-colors font-medium disabled:opacity-50"
                            >
                                {updating ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}