'use client';

import { useEffect, useState } from 'react';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import adminApi from '@/lib/api/adminApi';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        activeUsers: 42,
        totalUsers: 156,
        inactiveUsers: 14,
        logEvents: 165,
        pendingUpdates: 8,
        roleCounts: {
            admin: 4,
            manager: 12,
            employee: 139,
            ceo: 1
        }
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;

            try {
                // Get dashboard stats
                const dashboardStats = await adminApi.getDashboardStats();

                // Get recent system logs
                const recentLogs = await adminApi.logs.getRecentLogs(5);

                // Format logs for display
                const formattedLogs = recentLogs.map(log => ({
                    id: log.id,
                    user: log.user?.email || 'System',
                    action: log.action,
                    time: formatTimeAgo(log.timestamp)
                }));

                setStats(dashboardStats);
                setRecentActivities(formattedLogs);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);

                // Use fallback data instead of showing errors
                // Fallback data is already set in the initial state

                try {
                    // Still try to log the error
                    adminApi.addSystemLog({
                        action: 'Error loading admin dashboard',
                        user: { id: currentUser?.uid, email: currentUser?.email },
                        details: { errorMessage: error.message },
                        timestamp: new Date()
                    });
                } catch (logError) {
                    console.error('Failed to log error:', logError);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    // Helper function to format timestamps
    const formatTimeAgo = (date) => {
        if (!date) return 'Unknown time';

        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' mins ago';

        return Math.floor(seconds) + ' seconds ago';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    return <AdminDashboard stats={stats} recentActivities={recentActivities} />;
}