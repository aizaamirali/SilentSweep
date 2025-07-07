'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import managerApi from '@/lib/api/managerApi';
import {
    ChartBarIcon,
    UserIcon,
    ClipboardDocumentListIcon,
    CalendarIcon,
    DocumentArrowDownIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('team');
    const [timeframe, setTimeframe] = useState('month');
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        team: {
            performance: 0,
            previousPerformance: 0,
            tasksCompleted: 0,
            tasksOverdue: 0,
            taskDistribution: {
                completed: 0,
                inProgress: 0,
                notStarted: 0,
                overdue: 0
            },
            topPerformers: [],
            needsImprovement: []
        },
        individual: [],
        projects: [],
        attendance: {
            averageRate: 0,
            previousRate: 0,
            onTimeRate: 0,
            lateRate: 0,
            absentRate: 0,
            employeeBreakdown: []
        }
    });

    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const fetchReportData = async () => {
            setLoading(true);
            try {
                // Use managerApi to fetch reports based on reportType
                if (reportType === 'team' || reportType === 'all') {
                    // Fetch team performance report
                    const teamReport = await managerApi.reports.getTeamPerformanceReport(
                        currentUser.uid,
                        timeframe
                    );

                    setReportData(prevData => ({
                        ...prevData,
                        team: teamReport
                    }));
                }

                if (reportType === 'attendance' || reportType === 'all') {
                    // Fetch attendance report
                    const attendanceReport = await managerApi.reports.getAttendanceReport(
                        currentUser.uid,
                        timeframe
                    );

                    setReportData(prevData => ({
                        ...prevData,
                        attendance: attendanceReport
                    }));
                }

                // For individual and projects, we'd need additional API endpoints
                // For now, we'll use the mock data for these
                if (reportType === 'individual' || reportType === 'all') {
                    // Sample individual data
                    const sampleIndividualData = [
                        {
                            id: '1',
                            name: 'John Smith',
                            role: 'Senior Developer',
                            performance: 96,
                            previousPerformance: 93,
                            tasksCompleted: 12,
                            tasksOverdue: 0,
                            attendance: 100,
                            performanceByCategory: {
                                quality: 95,
                                timeliness: 97,
                                initiative: 94,
                                collaboration: 98
                            },
                            performanceTrend: [94, 92, 95, 93, 96, 96]
                        },
                        {
                            id: '2',
                            name: 'Sarah Johnson',
                            role: 'UI Designer',
                            performance: 92,
                            previousPerformance: 90,
                            tasksCompleted: 10,
                            tasksOverdue: 0,
                            attendance: 96,
                            performanceByCategory: {
                                quality: 94,
                                timeliness: 90,
                                initiative: 89,
                                collaboration: 95
                            },
                            performanceTrend: [88, 91, 89, 92, 90, 92]
                        }
                    ];

                    setReportData(prevData => ({
                        ...prevData,
                        individual: sampleIndividualData
                    }));
                }

                if (reportType === 'projects' || reportType === 'all') {
                    // Sample projects data
                    const sampleProjectsData = [
                        {
                            id: 'p1',
                            name: 'Website Redesign',
                            progress: 75,
                            startDate: '2023-05-01',
                            endDate: '2023-07-15',
                            status: 'on_track',
                            tasks: {
                                total: 24,
                                completed: 18,
                                inProgress: 4,
                                overdue: 2
                            },
                            team: [
                                { id: '1', name: 'John Smith', role: 'Senior Developer' },
                                { id: '2', name: 'Sarah Johnson', role: 'UI Designer' },
                                { id: '5', name: 'Jessica White', role: 'Content Writer' }
                            ]
                        },
                        {
                            id: 'p2',
                            name: 'Mobile App Development',
                            progress: 45,
                            startDate: '2023-06-01',
                            endDate: '2023-09-30',
                            status: 'at_risk',
                            tasks: {
                                total: 32,
                                completed: 14,
                                inProgress: 10,
                                overdue: 1
                            },
                            team: [
                                { id: '1', name: 'John Smith', role: 'Senior Developer' },
                                { id: '3', name: 'Michael Davis', role: 'Backend Developer' },
                                { id: '4', name: 'Robert Brown', role: 'QA Tester' }
                            ]
                        }
                    ];

                    setReportData(prevData => ({
                        ...prevData,
                        projects: sampleProjectsData
                    }));
                }

            } catch (error) {
                console.error('Error fetching reports:', error);
                // Fallback to default report data
                setReportData({
                    team: {
                        performance: 87,
                        previousPerformance: 84,
                        tasksCompleted: 45,
                        tasksOverdue: 3,
                        taskDistribution: {
                            completed: 45,
                            inProgress: 12,
                            notStarted: 5,
                            overdue: 3
                        },
                        topPerformers: [
                            { id: '1', name: 'John Smith', performance: 96, tasksCompleted: 12, avatar: null },
                            { id: '2', name: 'Sarah Johnson', performance: 92, tasksCompleted: 10, avatar: null },
                            { id: '3', name: 'Michael Davis', performance: 88, tasksCompleted: 8, avatar: null }
                        ],
                        needsImprovement: [
                            { id: '4', name: 'Robert Brown', performance: 68, tasksCompleted: 4, avatar: null },
                            { id: '5', name: 'Jessica White', performance: 72, tasksCompleted: 5, avatar: null }
                        ]
                    },
                    individual: [
                        {
                            id: '1',
                            name: 'John Smith',
                            role: 'Senior Developer',
                            performance: 96,
                            previousPerformance: 93,
                            tasksCompleted: 12,
                            tasksOverdue: 0,
                            attendance: 100,
                            performanceByCategory: {
                                quality: 95,
                                timeliness: 97,
                                initiative: 94,
                                collaboration: 98
                            },
                            performanceTrend: [94, 92, 95, 93, 96, 96]
                        },
                        {
                            id: '2',
                            name: 'Sarah Johnson',
                            role: 'UI Designer',
                            performance: 92,
                            previousPerformance: 90,
                            tasksCompleted: 10,
                            tasksOverdue: 0,
                            attendance: 96,
                            performanceByCategory: {
                                quality: 94,
                                timeliness: 90,
                                initiative: 89,
                                collaboration: 95
                            },
                            performanceTrend: [88, 91, 89, 92, 90, 92]
                        }
                    ],
                    projects: [
                        {
                            id: 'p1',
                            name: 'Website Redesign',
                            progress: 75,
                            startDate: '2023-05-01',
                            endDate: '2023-07-15',
                            status: 'on_track',
                            tasks: {
                                total: 24,
                                completed: 18,
                                inProgress: 4,
                                overdue: 2
                            },
                            team: [
                                { id: '1', name: 'John Smith', role: 'Senior Developer' },
                                { id: '2', name: 'Sarah Johnson', role: 'UI Designer' },
                                { id: '5', name: 'Jessica White', role: 'Content Writer' }
                            ]
                        },
                        {
                            id: 'p2',
                            name: 'Mobile App Development',
                            progress: 45,
                            startDate: '2023-06-01',
                            endDate: '2023-09-30',
                            status: 'at_risk',
                            tasks: {
                                total: 32,
                                completed: 14,
                                inProgress: 10,
                                overdue: 1
                            },
                            team: [
                                { id: '1', name: 'John Smith', role: 'Senior Developer' },
                                { id: '3', name: 'Michael Davis', role: 'Backend Developer' },
                                { id: '4', name: 'Robert Brown', role: 'QA Tester' }
                            ]
                        }
                    ],
                    attendance: {
                        averageRate: 94,
                        previousRate: 92,
                        onTimeRate: 90,
                        lateRate: 4,
                        absentRate: 6,
                        employeeBreakdown: [
                            { id: '1', name: 'John Smith', attendance: 100, onTime: 100, late: 0, absent: 0 },
                            { id: '2', name: 'Sarah Johnson', attendance: 96, onTime: 92, late: 4, absent: 4 },
                            { id: '3', name: 'Michael Davis', attendance: 94, onTime: 90, late: 4, absent: 6 },
                            { id: '4', name: 'Robert Brown', attendance: 88, onTime: 80, late: 8, absent: 12 },
                            { id: '5', name: 'Jessica White', attendance: 92, onTime: 88, late: 4, absent: 8 }
                        ]
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [currentUser, reportType, timeframe]);

    // Helpers for displaying report data based on selected type
    const getReportContent = () => {
        switch (reportType) {
            case 'team':
                return renderTeamReport();
            case 'individual':
                return renderIndividualReport();
            case 'projects':
                return renderProjectsReport();
            case 'attendance':
                return renderAttendanceReport();
            default:
                return null;
        }
    };

    const renderTeamReport = () => {
        const teamData = reportData.team;
        const performanceChange = teamData.performance - teamData.previousPerformance;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Team Performance</h3>
                        <div className="flex items-center">
                            <p className="text-2xl font-bold text-gray-900">{teamData.performance}%</p>
                            <span className={`ml-2 text-sm ${performanceChange >= 0 ? 'text-[#057642]' : 'text-[#b74700]'}`}>
                                {performanceChange >= 0 ? '+' : ''}{performanceChange}%
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Tasks Completed</h3>
                        <p className="text-2xl font-bold text-gray-900">{teamData.tasksCompleted}</p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Tasks Overdue</h3>
                        <p className="text-2xl font-bold text-gray-900">{teamData.tasksOverdue}</p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Completion Rate</h3>
                        <p className="text-2xl font-bold text-gray-900">
                            {Math.round((teamData.taskDistribution.completed /
                                (teamData.taskDistribution.completed +
                                    teamData.taskDistribution.inProgress +
                                    teamData.taskDistribution.notStarted +
                                    teamData.taskDistribution.overdue)) * 100)}%
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-700">Completed</span>
                                    <span className="text-sm text-gray-700">{teamData.taskDistribution.completed}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-[#057642] h-2 rounded-full"
                                        style={{
                                            width: `${Math.round((teamData.taskDistribution.completed /
                                                (teamData.taskDistribution.completed +
                                                    teamData.taskDistribution.inProgress +
                                                    teamData.taskDistribution.notStarted +
                                                    teamData.taskDistribution.overdue)) * 100)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-700">In Progress</span>
                                    <span className="text-sm text-gray-700">{teamData.taskDistribution.inProgress}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-[#0a66c2] h-2 rounded-full"
                                        style={{
                                            width: `${Math.round((teamData.taskDistribution.inProgress /
                                                (teamData.taskDistribution.completed +
                                                    teamData.taskDistribution.inProgress +
                                                    teamData.taskDistribution.notStarted +
                                                    teamData.taskDistribution.overdue)) * 100)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-700">Not Started</span>
                                    <span className="text-sm text-gray-700">{teamData.taskDistribution.notStarted}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-[#915907] h-2 rounded-full"
                                        style={{
                                            width: `${Math.round((teamData.taskDistribution.notStarted /
                                                (teamData.taskDistribution.completed +
                                                    teamData.taskDistribution.inProgress +
                                                    teamData.taskDistribution.notStarted +
                                                    teamData.taskDistribution.overdue)) * 100)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-700">Overdue</span>
                                    <span className="text-sm text-gray-700">{teamData.taskDistribution.overdue}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-[#b74700] h-2 rounded-full"
                                        style={{
                                            width: `${Math.round((teamData.taskDistribution.overdue /
                                                (teamData.taskDistribution.completed +
                                                    teamData.taskDistribution.inProgress +
                                                    teamData.taskDistribution.notStarted +
                                                    teamData.taskDistribution.overdue)) * 100)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
                        <div className="space-y-4">
                            {teamData.topPerformers.map(employee => (
                                <div key={employee.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] border border-[#c3d9f0] mr-3">
                                            {employee.avatar ? (
                                                <img src={employee.avatar} alt={employee.name} className="h-10 w-10 rounded-full" />
                                            ) : (
                                                employee.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{employee.name}</h3>
                                            <p className="text-sm text-gray-600">{employee.tasksCompleted} tasks completed</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-semibold text-gray-900">{employee.performance}%</span>
                                        <div className="text-xs text-[#057642] bg-[#ddf5f2] px-2 py-0.5 rounded-full border border-[#c0e6c0]">Top Performer</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h3 className="font-medium text-gray-900 mb-2">Needs Improvement</h3>
                            <div className="space-y-4">
                                {teamData.needsImprovement.map(employee => (
                                    <div key={employee.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] border border-[#c3d9f0] mr-3">
                                                {employee.avatar ? (
                                                    <img src={employee.avatar} alt={employee.name} className="h-10 w-10 rounded-full" />
                                                ) : (
                                                    employee.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{employee.name}</h3>
                                                <p className="text-sm text-gray-600">{employee.tasksCompleted} tasks completed</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-semibold text-gray-900">{employee.performance}%</span>
                                            <div className="text-xs text-[#b74700] bg-[#FEF9F1] px-2 py-0.5 rounded-full border border-[#FACCA6]">Needs Coaching</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderIndividualReport = () => {
        // Display individual employee performance with option to select different employees
        return (
            <div className="space-y-6">
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition">
                        {reportData.individual.map(employee => (
                            <option key={employee.id} value={employee.id}>{employee.name}</option>
                        ))}
                    </select>
                </div>

                {/* Show selected employee data - using first employee as default */}
                {reportData.individual.length > 0 && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                            <div className="flex items-center mb-4">
                                <div className="h-16 w-16 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] border border-[#c3d9f0] mr-4">
                                    {reportData.individual[0].name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{reportData.individual[0].name}</h2>
                                    <p className="text-gray-600">{reportData.individual[0].role}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-2xl font-bold text-gray-900">{reportData.individual[0].performance}%</div>
                                    <div className={`text-sm ${reportData.individual[0].performance - reportData.individual[0].previousPerformance >= 0
                                        ? 'text-[#057642]'
                                        : 'text-[#b74700]'
                                        }`}>
                                        {reportData.individual[0].performance - reportData.individual[0].previousPerformance >= 0 ? '+' : ''}
                                        {reportData.individual[0].performance - reportData.individual[0].previousPerformance}% vs last period
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 border border-gray-200 rounded-md bg-[#f3f2ef]">
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Tasks Completed</h3>
                                    <p className="text-xl font-bold text-gray-900">{reportData.individual[0].tasksCompleted}</p>
                                </div>

                                <div className="p-3 border border-gray-200 rounded-md bg-[#f3f2ef]">
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Tasks Overdue</h3>
                                    <p className="text-xl font-bold text-gray-900">{reportData.individual[0].tasksOverdue}</p>
                                </div>

                                <div className="p-3 border border-gray-200 rounded-md bg-[#f3f2ef]">
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Attendance</h3>
                                    <p className="text-xl font-bold text-gray-900">{reportData.individual[0].attendance}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-700">Quality of Work</span>
                                            <span className="text-sm text-gray-700">{reportData.individual[0].performanceByCategory.quality}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-[#0a66c2] h-2 rounded-full"
                                                style={{ width: `${reportData.individual[0].performanceByCategory.quality}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-700">Timeliness</span>
                                            <span className="text-sm text-gray-700">{reportData.individual[0].performanceByCategory.timeliness}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-[#0a66c2] h-2 rounded-full"
                                                style={{ width: `${reportData.individual[0].performanceByCategory.timeliness}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-700">Initiative</span>
                                            <span className="text-sm text-gray-700">{reportData.individual[0].performanceByCategory.initiative}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-[#0a66c2] h-2 rounded-full"
                                                style={{ width: `${reportData.individual[0].performanceByCategory.initiative}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-700">Collaboration</span>
                                            <span className="text-sm text-gray-700">{reportData.individual[0].performanceByCategory.collaboration}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-[#0a66c2] h-2 rounded-full"
                                                style={{ width: `${reportData.individual[0].performanceByCategory.collaboration}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h2>
                                <div className="h-64 flex items-end space-x-2">
                                    {reportData.individual[0].performanceTrend.map((score, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div
                                                className="w-full bg-[#0a66c2] rounded-t"
                                                style={{ height: `${score * 0.6}%` }}
                                            ></div>
                                            <p className="text-xs mt-2 text-gray-600">Month {index + 1}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-600 text-center mt-2">Last 6 months performance</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderProjectsReport = () => {
        const getStatusBadge = (status) => {
            switch (status) {
                case 'on_track':
                    return 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]';
                case 'at_risk':
                    return 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]';
                case 'delayed':
                    return 'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]';
                case 'completed':
                    return 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]';
                default:
                    return 'bg-gray-100 text-gray-700 border border-gray-300';
            }
        };

        const getStatusText = (status) => {
            switch (status) {
                case 'on_track': return 'On Track';
                case 'at_risk': return 'At Risk';
                case 'delayed': return 'Delayed';
                case 'completed': return 'Completed';
                default: return 'Unknown';
            }
        };

        return (
            <div className="space-y-6">
                {reportData.projects.map(project => (
                    <div key={project.id} className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
                                <p className="text-sm text-gray-600">
                                    {new Date(project.startDate).toLocaleDateString()} to {new Date(project.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}>
                                {getStatusText(project.status)}
                            </span>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Progress</span>
                                <span className="text-gray-700">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${project.status === 'on_track' ? 'bg-[#057642]' :
                                            project.status === 'at_risk' ? 'bg-[#915907]' :
                                                project.status === 'delayed' ? 'bg-[#b74700]' :
                                                    'bg-[#0a66c2]'
                                        }`}
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="p-3 border border-gray-200 rounded-md bg-[#f3f2ef]">
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Total Tasks</h3>
                                <p className="text-xl font-bold text-gray-900">{project.tasks.total}</p>
                            </div>

                            <div className="p-3 border border-gray-200 rounded-md bg-[#f3f2ef]">
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Completed</h3>
                                <p className="text-xl font-bold text-[#057642]">{project.tasks.completed}</p>
                            </div>

                            <div className="p-3 border border-gray-200 rounded-md bg-[#f3f2ef]">
                                <h3 className="text-sm font-medium text-gray-700 mb-1">In Progress</h3>
                                <p className="text-xl font-bold text-[#0a66c2]">{project.tasks.inProgress}</p>
                            </div>

                            <div className="p-3 border border-gray-200 rounded-md bg-[#f3f2ef]">
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Overdue</h3>
                                <p className="text-xl font-bold text-[#b74700]">{project.tasks.overdue}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Team Members</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.team.map(member => (
                                    <div key={member.id} className="flex items-center bg-[#e7f3ff] text-[#0a66c2] rounded-full px-3 py-1 border border-[#c3d9f0]">
                                        <span className="font-medium mr-1">{member.name}</span>
                                        <span className="text-xs opacity-70">({member.role})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderAttendanceReport = () => {
        const attendanceData = reportData.attendance;
        const attendanceChange = attendanceData.averageRate - attendanceData.previousRate;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Attendance Rate</h3>
                        <div className="flex items-center">
                            <p className="text-2xl font-bold text-gray-900">{attendanceData.averageRate}%</p>
                            <span className={`ml-2 text-sm ${attendanceChange >= 0 ? 'text-[#057642]' : 'text-[#b74700]'}`}>
                                {attendanceChange >= 0 ? '+' : ''}{attendanceChange}%
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">On Time</h3>
                        <p className="text-2xl font-bold text-gray-900">{attendanceData.onTimeRate}%</p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Late</h3>
                        <p className="text-2xl font-bold text-gray-900">{attendanceData.lateRate}%</p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Absent</h3>
                        <p className="text-2xl font-bold text-gray-900">{attendanceData.absentRate}%</p>
                    </div>
                </div>

                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Attendance</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Employee</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Attendance</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">On Time</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Late</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Absent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {attendanceData.employeeBreakdown.map(employee => (
                                    <tr key={employee.id} className="hover:bg-[#f3f2ef]">
                                        <td className="py-3 px-4 font-medium text-gray-900">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] border border-[#c3d9f0] mr-3">
                                                    {employee.name.charAt(0)}
                                                </div>
                                                {employee.name}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <span className="mr-2 text-gray-900">{employee.attendance}%</span>
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${employee.attendance >= 90 ? 'bg-[#057642]' :
                                                                employee.attendance >= 80 ? 'bg-[#915907]' :
                                                                    'bg-[#b74700]'
                                                            }`}
                                                        style={{ width: `${employee.attendance}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-900">{employee.onTime}%</td>
                                        <td className="py-3 px-4 text-gray-900">{employee.late}%</td>
                                        <td className="py-3 px-4 text-gray-900">{employee.absent}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex items-center bg-white border border-gray-300 rounded-full overflow-hidden w-full sm:w-auto">
                        <button
                            onClick={() => setTimeframe('week')}
                            className={`px-3 py-1.5 text-sm font-medium ${timeframe === 'week'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setTimeframe('month')}
                            className={`px-3 py-1.5 text-sm font-medium ${timeframe === 'month'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setTimeframe('quarter')}
                            className={`px-3 py-1.5 text-sm font-medium ${timeframe === 'quarter'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            This Quarter
                        </button>
                    </div>

                    <button className="flex items-center justify-center px-4 py-2 bg-[#0a66c2] text-white text-sm font-medium rounded-full hover:bg-[#004182] transition-colors">
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        <button
                            onClick={() => setReportType('team')}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${reportType === 'team'
                                    ? 'border-b-2 border-[#0a66c2] text-[#0a66c2]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <ChartBarIcon className="h-5 w-5 mr-1.5" />
                            Team Performance
                        </button>
                        <button
                            onClick={() => setReportType('individual')}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${reportType === 'individual'
                                    ? 'border-b-2 border-[#0a66c2] text-[#0a66c2]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <UserIcon className="h-5 w-5 mr-1.5" />
                            Individual Performance
                        </button>
                        <button
                            onClick={() => setReportType('projects')}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${reportType === 'projects'
                                    ? 'border-b-2 border-[#0a66c2] text-[#0a66c2]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-1.5" />
                            Projects Status
                        </button>
                        <button
                            onClick={() => setReportType('attendance')}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${reportType === 'attendance'
                                    ? 'border-b-2 border-[#0a66c2] text-[#0a66c2]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <CalendarIcon className="h-5 w-5 mr-1.5" />
                            Attendance Report
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {getReportContent()}
                </div>
            </div>
        </div>
    );
}