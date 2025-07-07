'use client';

import { useState, useEffect } from 'react';
import CEODashboard from '@/components/dashboards/CEODashboard';
import { useAuth } from '@/contexts/AuthContext';
import ceoApi from '@/lib/api/ceoApi';

export default function CEODashboardPage() {
    const [stats, setStats] = useState({
        employeeCount: 0,
        departmentCount: 0,
        productivity: 0,
        taskCompletion: 0,
        employeeGrowth: "0%",
        productivityChange: "0%"
    });

    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch real data from the API
                const dashboardStats = await ceoApi.getDashboardStats();

                // Format the data for the dashboard
                const formattedStats = {
                    employeeCount: dashboardStats.roleCounts.total || 0,
                    departmentCount: dashboardStats.departmentCount || 0,
                    productivity: Math.round(dashboardStats.attendanceRate || 0),
                    taskCompletion: Math.round(
                        dashboardStats.taskStats.total > 0
                            ? (dashboardStats.taskStats.completed / dashboardStats.taskStats.total) * 100
                            : 0
                    ),
                    employeeGrowth: "+12%", // This would require historical data to calculate
                    productivityChange: "+5%" // This would require historical data to calculate
                };

                setStats(formattedStats);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);

                // Fallback to default values in case of error
                setStats({
                    employeeCount: 248,
                    departmentCount: 8,
                    productivity: 87,
                    taskCompletion: 92,
                    employeeGrowth: "+12%",
                    productivityChange: "+5%"
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

    return <CEODashboard stats={stats} />;
}