'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfilePage from '@/components/ProfilePage';

export default function AdminProfilePage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { currentUser } = useAuth();

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return <ProfilePage />;
}