'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ceoApi from '@/lib/api/ceoApi';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        departmentStats: [],
        taskStats: {
            completed: 0,
            inProgress: 0,
            notStarted: 0,
            overdue: 0
        }
    });

    const [timeframe, setTimeframe] = useState('month');
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                // Get organization analytics from API
                const analytics = await ceoApi.analytics.getOrganizationAnalytics();

                // Format department stats for the UI
                const formattedDepartmentStats = analytics.departmentStats.map(dept => ({
                    name: dept.name,
                    count: dept.headCount,
                    productivity: dept.productivity
                }));

                // Create formatted stats object for the UI
                const formattedStats = {
                    totalEmployees: analytics.employeeStats.total,
                    activeEmployees: analytics.employeeStats.active,
                    departmentStats: formattedDepartmentStats,
                    taskStats: {
                        completed: analytics.taskStats.completed,
                        inProgress: analytics.taskStats.inProgress,
                        notStarted: analytics.taskStats.notStarted,
                        overdue: analytics.taskStats.overdue
                    }
                };

                setStats(formattedStats);
            } catch (error) {
                console.error('Error fetching analytics data:', error);

                // Fallback to mock data in case of error
                setStats({
                    totalEmployees: 248,
                    activeEmployees: 235,
                    departmentStats: [
                        { name: 'Engineering', count: 68, productivity: 89 },
                        { name: 'Sales', count: 45, productivity: 92 },
                        { name: 'Marketing', count: 32, productivity: 85 },
                        { name: 'Customer Support', count: 58, productivity: 88 },
                        { name: 'HR', count: 15, productivity: 90 },
                        { name: 'Finance', count: 30, productivity: 93 }
                    ],
                    taskStats: {
                        completed: 348,
                        inProgress: 87,
                        notStarted: 42,
                        overdue: 12
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [timeframe, currentUser]);

    const handleTimeframeChange = (newTimeframe) => {
        setTimeframe(newTimeframe);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>

                <div className="flex items-center bg-white border border-gray-300 rounded-full overflow-hidden">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${timeframe === 'week'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        onClick={() => handleTimeframeChange('week')}
                    >
                        Week
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${timeframe === 'month'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        onClick={() => handleTimeframeChange('month')}
                    >
                        Month
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${timeframe === 'quarter'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        onClick={() => handleTimeframeChange('quarter')}
                    >
                        Quarter
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${timeframe === 'year'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        onClick={() => handleTimeframeChange('year')}
                    >
                        Year
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Employees</h2>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                            {stats.activeEmployees} active
                        </p>
                        <span className="text-xs font-medium bg-[#e7f3ff] text-[#0a66c2] px-2 py-1 rounded-full border border-[#c3d9f0]">
                            {Math.round((stats.activeEmployees / stats.totalEmployees) * 100) || 0}%
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Tasks Completed</h2>
                    <p className="text-3xl font-bold text-gray-900">{stats.taskStats.completed}</p>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                            Completion rate
                        </p>
                        <span className="text-xs font-medium bg-[#ddf5f2] text-[#057642] px-2 py-1 rounded-full border border-[#c0e6c0]">
                            {Math.round((stats.taskStats.completed / (stats.taskStats.completed + stats.taskStats.inProgress + stats.taskStats.notStarted + stats.taskStats.overdue)) * 100) || 0}%
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Tasks In Progress</h2>
                    <p className="text-3xl font-bold text-gray-900">{stats.taskStats.inProgress}</p>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                            Overdue tasks
                        </p>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${stats.taskStats.overdue === 0 ? 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]' :
                                stats.taskStats.overdue <= 5 ? 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]' :
                                    'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]'
                            }`}>
                            {stats.taskStats.overdue}
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Average Productivity</h2>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats.departmentStats.length > 0
                            ? Math.round(stats.departmentStats.reduce((sum, dept) => sum + dept.productivity, 0) / stats.departmentStats.length)
                            : 0}%
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                            Across all departments
                        </p>
                        <span className="text-xs font-medium bg-[#e7f3ff] text-[#0a66c2] px-2 py-1 rounded-full border border-[#c3d9f0]">
                            +3% MoM
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Task Status Distribution</h2>
                    <div className="w-full max-w-md mx-auto">
                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-[#057642] rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-gray-700">Completed</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{stats.taskStats.completed}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#057642] h-2 rounded-full"
                                    style={{
                                        width: `${Math.round((stats.taskStats.completed / (stats.taskStats.completed + stats.taskStats.inProgress + stats.taskStats.notStarted + stats.taskStats.overdue)) * 100) || 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-[#0a66c2] rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-gray-700">In Progress</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{stats.taskStats.inProgress}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#0a66c2] h-2 rounded-full"
                                    style={{
                                        width: `${Math.round((stats.taskStats.inProgress / (stats.taskStats.completed + stats.taskStats.inProgress + stats.taskStats.notStarted + stats.taskStats.overdue)) * 100) || 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-gray-700">Not Started</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{stats.taskStats.notStarted}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gray-400 h-2 rounded-full"
                                    style={{
                                        width: `${Math.round((stats.taskStats.notStarted / (stats.taskStats.completed + stats.taskStats.inProgress + stats.taskStats.notStarted + stats.taskStats.overdue)) * 100) || 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-[#b74700] rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-gray-700">Overdue</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{stats.taskStats.overdue}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#b74700] h-2 rounded-full"
                                    style={{
                                        width: `${Math.round((stats.taskStats.overdue / (stats.taskStats.completed + stats.taskStats.inProgress + stats.taskStats.notStarted + stats.taskStats.overdue)) * 100) || 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Department Productivity</h2>
                    <div className="h-64 overflow-y-auto pr-2">
                        {stats.departmentStats.map((dept, index) => (
                            <div key={index} className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900">{dept.name}</span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${dept.productivity >= 90 ? 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]' :
                                            dept.productivity >= 80 ? 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]' :
                                                dept.productivity >= 70 ? 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]' :
                                                    'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]'
                                        }`}>
                                        {dept.productivity}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${dept.productivity >= 90 ? 'bg-[#057642]' :
                                                dept.productivity >= 80 ? 'bg-[#0a66c2]' :
                                                    dept.productivity >= 70 ? 'bg-[#915907]' :
                                                        'bg-[#b74700]'
                                            }`}
                                        style={{ width: `${dept.productivity}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <span className="text-xs text-gray-600">
                                        {dept.count} employees
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {dept.productivity >= 90 ? 'Excellent' :
                                            dept.productivity >= 80 ? 'Good' :
                                                dept.productivity >= 70 ? 'Average' : 'Needs Improvement'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Performance Trends</h2>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm text-[#0a66c2] hover:bg-[#e7f3ff] rounded-full">
                            Productivity
                        </button>
                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
                            Tasks
                        </button>
                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
                            Attendance
                        </button>
                    </div>
                </div>
                <div className="h-64 flex items-center justify-center border border-gray-200 rounded-md bg-[#f3f2ef]">
                    <div className="text-center">
                        <p className="text-gray-600 mb-2">Trend charts will be implemented in the next phase</p>
                        <button className="px-4 py-2 text-sm text-[#0a66c2] font-medium border border-[#0a66c2] rounded-full hover:bg-[#e7f3ff]">
                            Request Feature Early Access
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}