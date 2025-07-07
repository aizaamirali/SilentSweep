'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import employeeApi from '@/lib/api/employeeApi';

export default function EmployeeDashboardPage() {
    const [stats, setStats] = useState({
        taskStats: {
            total: 0,
            dueToday: 0,
            completed: 0,
            inProgress: 0,
            notStarted: 0
        },
        attendance: {
            rate: "0%",
            period: "This Month"
        },
        performance: {
            score: "0%",
            status: "Not Available"
        }
    });

    const [recentTasks, setRecentTasks] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const fetchEmployeeData = async () => {
            try {
                // Use the employeeApi to fetch dashboard stats
                const dashboardStats = await employeeApi.getDashboardStats(currentUser.uid);

                // Calculate stats from the returned data
                const totalTasks = dashboardStats.tasksCompleted +
                    dashboardStats.tasksOverdue +
                    dashboardStats.recentTasks.length;

                // Fetch attendance stats
                const attendanceStats = await employeeApi.attendance.getAttendanceStats(currentUser.uid);
                const attendanceRate = attendanceStats.present + attendanceStats.absent > 0
                    ? Math.round((attendanceStats.present / (attendanceStats.present + attendanceStats.absent)) * 100)
                    : 0;

                // Fetch performance data
                const performanceData = await employeeApi.performance.getPerformanceData(currentUser.uid);
                const performanceStatus =
                    performanceData.overallScore >= 90 ? "Excellent" :
                        performanceData.overallScore >= 80 ? "Above Target" :
                            performanceData.overallScore >= 70 ? "Meeting Target" :
                                performanceData.overallScore >= 60 ? "Needs Improvement" :
                                    "Below Target";

                // Organize the data for display
                setStats({
                    taskStats: {
                        total: totalTasks,
                        dueToday: dashboardStats.tasksDueToday,
                        completed: dashboardStats.tasksCompleted,
                        overdue: dashboardStats.tasksOverdue
                    },
                    attendance: {
                        rate: `${attendanceRate}%`,
                        period: "This Month"
                    },
                    performance: {
                        score: `${performanceData.overallScore}%`,
                        status: performanceStatus
                    }
                });

                setRecentTasks(dashboardStats.recentTasks);

                // Simulate upcoming events - in a real app, these would come from a calendar API
                const mockEvents = [
                    { title: 'Weekly Team Meeting', time: 'Tomorrow, 10:00 AM', type: 'Meeting' },
                    { title: 'Project Deadline', time: 'Friday, 5:00 PM', type: 'Deadline' },
                    { title: 'Performance Review', time: 'Next Monday, 2:00 PM', type: 'Meeting' },
                    { title: 'Training Session', time: 'Next Wednesday, 11:00 AM', type: 'Training' }
                ];

                setUpcomingEvents(mockEvents);

            } catch (error) {
                console.error("Error fetching employee data:", error);

                // Fallback to default stats if API calls fail
                setStats({
                    taskStats: {
                        total: 0,
                        dueToday: 0,
                        completed: 0,
                        inProgress: 0,
                        notStarted: 0
                    },
                    attendance: {
                        rate: "N/A",
                        period: "This Month"
                    },
                    performance: {
                        score: "N/A",
                        status: "Data Unavailable"
                    }
                });

                setRecentTasks([]);
                setUpcomingEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-blue-600 rounded-full"></div>
            </div>
        );
    }

    return (
        <EmployeeDashboard
            stats={stats}
            recentTasks={recentTasks}
            upcomingEvents={upcomingEvents}
        />
    );
}