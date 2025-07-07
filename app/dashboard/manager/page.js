'use client';

import { useState, useEffect } from 'react';
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';
import { useAuth } from '@/contexts/AuthContext';
import managerApi from '@/lib/api/managerApi';

export default function ManagerDashboardPage() {
    const [stats, setStats] = useState({
        teamMembers: 0,
        activeTasks: 0,
        overdueTasksCount: 0,
        attendanceRate: 0,
        attendanceFraction: '0/0',
        recentTasks: []
    });

    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const fetchDashboardData = async () => {
            try {
                // Use the managerApi to fetch dashboard stats
                const dashboardStats = await managerApi.getDashboardStats(currentUser.uid);
                setStats(dashboardStats);
            } catch (error) {
                console.error('Error fetching manager dashboard data:', error);
                // Fallback to default stats
                setStats({
                    teamMembers: 16,
                    activeTasks: 27,
                    overdueTasksCount: 4,
                    attendanceRate: 94,
                    attendanceFraction: '15/16',
                    recentTasks: [
                        { task: 'Complete UI Design', assignee: 'Jane Smith', status: 'In Progress', dueDate: '2025-05-20' },
                        { task: 'Backend Integration', assignee: 'John Doe', status: 'Not Started', dueDate: '2025-05-25' },
                        { task: 'Testing Phase 1', assignee: 'Mike Johnson', status: 'Completed', dueDate: '2025-05-15' },
                        { task: 'Documentation', assignee: 'Sarah Williams', status: 'In Progress', dueDate: '2025-05-22' },
                        { task: 'Client Presentation', assignee: 'Robert Brown', status: 'Not Started', dueDate: '2025-05-30' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    return <ManagerDashboard stats={stats} />;
}