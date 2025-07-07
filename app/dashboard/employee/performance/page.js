'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import employeeApi from '@/lib/api/employeeApi';
import {
    ChartBarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    AcademicCapIcon,
    TrophyIcon,
    ArrowTrendingUpIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function PerformancePage() {
    const [performanceData, setPerformanceData] = useState({
        overallScore: 0,
        trend: '0%',
        categories: [],
        monthlyScores: [],
        recentFeedback: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const fetchPerformanceData = async () => {
            try {
                setLoading(true);
                // Use the employeeApi to fetch performance data
                const data = await employeeApi.performance.getPerformanceData(currentUser.uid);
                setPerformanceData(data);
                setError('');
            } catch (error) {
                console.error("Error fetching performance data:", error);
                setError("Failed to load performance data. Please try again later.");

                // Use default/fallback data in case of error
                setPerformanceData({
                    overallScore: 92,
                    trend: '+5%',
                    categories: [
                        { name: 'Task Completion', score: 95, trend: '+8%' },
                        { name: 'Quality of Work', score: 90, trend: '+5%' },
                        { name: 'Timeliness', score: 88, trend: '+3%' },
                        { name: 'Collaboration', score: 94, trend: '+6%' }
                    ],
                    monthlyScores: [
                        { month: 'Jan', score: 87 },
                        { month: 'Feb', score: 88 },
                        { month: 'Mar', score: 85 },
                        { month: 'Apr', score: 89 },
                        { month: 'May', score: 91 },
                        { month: 'Jun', score: 92 }
                    ],
                    recentFeedback: [
                        {
                            id: 1,
                            from: 'John Smith',
                            role: 'Project Manager',
                            date: '2025-04-15',
                            rating: 4,
                            message: 'Great work on the frontend implementation. Your attention to detail on the UI components was exceptional. Consider working on documentation for future projects.'
                        },
                        {
                            id: 2,
                            from: 'Sarah Johnson',
                            role: 'Team Lead',
                            date: '2025-03-10',
                            rating: 5,
                            message: 'Excellent collaboration with the team during the sprint. Your suggestions during code reviews were very helpful and improved the overall quality of the project.'
                        }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    const getTrendColor = (trend) => {
        if (!trend) return 'text-gray-500';
        const value = parseFloat(trend);
        if (value > 0) return 'text-[#057642]';
        if (value < 0) return 'text-[#b74700]';
        return 'text-gray-500';
    };

    const getTrendBgColor = (trend) => {
        if (!trend) return 'bg-gray-100 border-gray-200';
        const value = parseFloat(trend);
        if (value > 0) return 'bg-[#ddf5f2] border-[#c0e6c0]';
        if (value < 0) return 'bg-[#FEF9F1] border-[#FACCA6]';
        return 'bg-gray-100 border-gray-200';
    };

    const getCategoryColor = (score) => {
        if (score >= 90) return 'bg-[#057642]';
        if (score >= 80) return 'bg-[#0a66c2]';
        if (score >= 70) return 'bg-[#915907]';
        return 'bg-[#b74700]';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>

            {error && (
                <div className="p-4 bg-[#FEF9F1] border border-[#FACCA6] text-[#b74700] rounded-lg flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Overall Performance</h2>
                        <p className="text-sm text-gray-500">Based on task completion, feedback, and evaluations</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                        <div className="text-4xl font-bold text-gray-900">{performanceData.overallScore}%</div>
                        <div className={`ml-3 px-2 py-1 rounded-full text-sm font-medium ${getTrendBgColor(performanceData.trend)} ${getTrendColor(performanceData.trend)}`}>
                            {parseFloat(performanceData.trend) > 0 ? `↑ ${performanceData.trend}` :
                                parseFloat(performanceData.trend) < 0 ? `↓ ${performanceData.trend}` :
                                    performanceData.trend}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {performanceData.categories.map((category, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-[#f3f2ef] transition-colors">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-gray-900">{category.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTrendBgColor(category.trend)} ${getTrendColor(category.trend)}`}>
                                    {parseFloat(category.trend) > 0 ? `↑ ${category.trend}` :
                                        parseFloat(category.trend) < 0 ? `↓ ${category.trend}` :
                                            category.trend}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-2xl font-bold text-gray-900">{category.score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div
                                    className={`h-2.5 rounded-full ${getCategoryColor(category.score)}`}
                                    style={{ width: `${category.score}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Trend</h2>
                    <div className="h-64 flex flex-col justify-between">
                        <div className="flex-1 flex items-end">
                            {performanceData.monthlyScores.map((month, i) => (
                                <div
                                    key={i}
                                    className="flex-1 flex flex-col items-center"
                                >
                                    <div
                                        className="w-8 bg-[#0a66c2] rounded-t"
                                        style={{ height: `${month.score * 0.6}%` }}
                                    ></div>
                                    <p className="text-xs mt-2 text-gray-700">{month.month}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                            <div className="text-gray-500">
                                <span className="inline-block mr-2 w-3 h-3 bg-[#0a66c2] rounded-full"></span>
                                Monthly Performance Score
                            </div>
                            <div className="text-gray-900 font-medium">
                                Average: {(performanceData.monthlyScores.reduce((sum, month) => sum + month.score, 0) / performanceData.monthlyScores.length).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Feedback</h2>
                    <div className="space-y-4">
                        {performanceData.recentFeedback.length > 0 ? (
                            performanceData.recentFeedback.map((feedback) => (
                                <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg hover:bg-[#f3f2ef] transition-colors">
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{feedback.from}</h3>
                                            <p className="text-xs text-gray-500">{feedback.role} • {new Date(feedback.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < feedback.rating ? 'text-[#915907]' : 'text-gray-300'}>
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700">{feedback.message}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
                                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500">No feedback received yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Goals & Development</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="p-2 rounded-full bg-[#e7f3ff] mr-3">
                                <TrophyIcon className="h-5 w-5 text-[#0a66c2]" />
                            </div>
                            <h3 className="font-medium text-gray-900">Current Goals</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">Complete training program</span>
                                    <span className="font-medium text-gray-900">75%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-[#0a66c2] h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">Improve code quality metrics</span>
                                    <span className="font-medium text-gray-900">60%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-[#0a66c2] h-2 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">Enhance communication skills</span>
                                    <span className="font-medium text-gray-900">85%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-[#0a66c2] h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center mb-4">
                            <div className="p-2 rounded-full bg-[#e7f3ff] mr-3">
                                <AcademicCapIcon className="h-5 w-5 text-[#0a66c2]" />
                            </div>
                            <h3 className="font-medium text-gray-900">Development Opportunities</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                <span className="flex-shrink-0 p-1 rounded-full bg-[#ddf5f2] text-[#057642] mr-3">
                                    <CheckCircleIcon className="h-4 w-4" />
                                </span>
                                <div>
                                    <span className="text-gray-900 font-medium">Advanced React techniques course</span>
                                    <p className="text-xs text-gray-500 mt-1">Completed on April 10, 2025</p>
                                </div>
                            </li>
                            <li className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                <span className="flex-shrink-0 p-1 rounded-full bg-[#e7f3ff] text-[#0a66c2] mr-3">
                                    <ArrowTrendingUpIcon className="h-4 w-4" />
                                </span>
                                <div>
                                    <span className="text-gray-900 font-medium">Leadership training program</span>
                                    <p className="text-xs text-gray-500 mt-1">In progress (65% complete)</p>
                                </div>
                            </li>
                            <li className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                <span className="flex-shrink-0 p-1 rounded-full bg-gray-100 text-gray-500 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round" className="h-4 w-4">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                </span>
                                <div>
                                    <span className="text-gray-900 font-medium">Public speaking workshop</span>
                                    <p className="text-xs text-gray-500 mt-1">Available - Enroll by June 30, 2025</p>
                                </div>
                            </li>
                            <li className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                <span className="flex-shrink-0 p-1 rounded-full bg-gray-100 text-gray-500 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round" className="h-4 w-4">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                </span>
                                <div>
                                    <span className="text-gray-900 font-medium">Project management certification</span>
                                    <p className="text-xs text-gray-500 mt-1">Available - Recommended for Q3 2025</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Analysis</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Strengths</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                <div className="p-2 rounded-full bg-[#ddf5f2] mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round" className="h-5 w-5 text-[#057642]">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Task Completion</h4>
                                    <p className="text-sm text-gray-700 mt-1">Consistently delivers work ahead of deadlines</p>
                                </div>
                            </div>
                            <div className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                <div className="p-2 rounded-full bg-[#ddf5f2] mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round" className="h-5 w-5 text-[#057642]">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Team Collaboration</h4>
                                    <p className="text-sm text-gray-700 mt-1">Excellent communicator and team player</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Growth Areas</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                <div className="p-2 rounded-full bg-[#f5f2e3] mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round" className="h-5 w-5 text-[#915907]">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="M12 16v-4" />
                                        <path d="M12 8h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Technical Documentation</h4>
                                    <p className="text-sm text-gray-700 mt-1">Improve documentation of code and processes</p>
                                </div>
                            </div>
                            <div className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                <div className="p-2 rounded-full bg-[#f5f2e3] mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round" className="h-5 w-5 text-[#915907]">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="M12 16v-4" />
                                        <path d="M12 8h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Project Management</h4>
                                    <p className="text-sm text-gray-700 mt-1">Develop skills in project planning and resource allocation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}