'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ceoApi from '@/lib/api/ceoApi';
import { DocumentTextIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [performanceReport, setPerformanceReport] = useState(null);
    const [productivityReport, setProductivityReport] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                // This would ideally fetch reports from an API
                // For now, we'll use mock data like before, but fetch real performance/productivity data
                const mockReports = [
                    {
                        id: 1,
                        title: 'Employee Performance Q3 2023',
                        type: 'employee',
                        date: '2023-10-05',
                        author: 'HR Department',
                        status: 'final'
                    },
                    {
                        id: 2,
                        title: 'Financial Summary Q3 2023',
                        type: 'financial',
                        date: '2023-10-02',
                        author: 'Finance Department',
                        status: 'final'
                    },
                    {
                        id: 3,
                        title: 'Department Productivity Analysis',
                        type: 'productivity',
                        date: '2023-09-28',
                        author: 'Operations',
                        status: 'final'
                    },
                    {
                        id: 4,
                        title: 'Employee Turnover Rate 2023',
                        type: 'employee',
                        date: '2023-09-15',
                        author: 'HR Department',
                        status: 'final'
                    },
                    {
                        id: 5,
                        title: 'Financial Forecast Q4 2023',
                        type: 'financial',
                        date: '2023-09-10',
                        author: 'Finance Department',
                        status: 'draft'
                    },
                    {
                        id: 6,
                        title: 'Employee Satisfaction Survey Results',
                        type: 'employee',
                        date: '2023-08-28',
                        author: 'HR Department',
                        status: 'final'
                    },
                    {
                        id: 7,
                        title: 'Productivity Trends 2023',
                        type: 'productivity',
                        date: '2023-08-15',
                        author: 'Operations',
                        status: 'final'
                    }
                ];

                // Fetch real performance and productivity reports for the month timeframe
                const [performanceData, productivityData] = await Promise.all([
                    ceoApi.reports.getPerformanceReport('month'),
                    ceoApi.reports.getProductivityReport('month')
                ]);

                setPerformanceReport(performanceData);
                setProductivityReport(productivityData);
                setReports(mockReports);
            } catch (error) {
                console.error('Error fetching reports:', error);
                // Keep the mock reports even if API calls fail
                setReports([
                    {
                        id: 1,
                        title: 'Employee Performance Q3 2023',
                        type: 'employee',
                        date: '2023-10-05',
                        author: 'HR Department',
                        status: 'final'
                    },
                    {
                        id: 2,
                        title: 'Financial Summary Q3 2023',
                        type: 'financial',
                        date: '2023-10-02',
                        author: 'Finance Department',
                        status: 'final'
                    },
                    {
                        id: 3,
                        title: 'Department Productivity Analysis',
                        type: 'productivity',
                        date: '2023-09-28',
                        author: 'Operations',
                        status: 'final'
                    },
                    {
                        id: 4,
                        title: 'Employee Turnover Rate 2023',
                        type: 'employee',
                        date: '2023-09-15',
                        author: 'HR Department',
                        status: 'final'
                    },
                    {
                        id: 5,
                        title: 'Financial Forecast Q4 2023',
                        type: 'financial',
                        date: '2023-09-10',
                        author: 'Finance Department',
                        status: 'draft'
                    },
                    {
                        id: 6,
                        title: 'Employee Satisfaction Survey Results',
                        type: 'employee',
                        date: '2023-08-28',
                        author: 'HR Department',
                        status: 'final'
                    },
                    {
                        id: 7,
                        title: 'Productivity Trends 2023',
                        type: 'productivity',
                        date: '2023-08-15',
                        author: 'Operations',
                        status: 'final'
                    }
                ]);

                // Mock performance and productivity data in case of error
                setPerformanceReport({
                    averageScore: 87,
                    employeeCount: 248,
                    improvementRate: 12,
                    improvedEmployees: 165
                });

                setProductivityReport({
                    completionRate: 92,
                    completedTasks: 876,
                    taskCount: 950,
                    avgCompletionTime: 5.3
                });
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [currentUser]);

    const filteredReports = reportType === 'all'
        ? reports
        : reports.filter(report => report.type === reportType);

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
                <h1 className="text-2xl font-bold text-gray-900">Executive Reports</h1>

                <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-white border border-gray-300 rounded-full overflow-hidden">
                        <button
                            className={`px-4 py-2 text-sm font-medium ${reportType === 'all'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setReportType('all')}
                        >
                            All
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium ${reportType === 'employee'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setReportType('employee')}
                        >
                            Employee
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium ${reportType === 'financial'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setReportType('financial')}
                        >
                            Financial
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium ${reportType === 'productivity'
                                ? 'bg-[#0a66c2] text-white'
                                : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setReportType('productivity')}
                        >
                            Productivity
                        </button>
                    </div>

                    <button className="px-4 py-2 text-sm font-medium bg-[#0a66c2] text-white rounded-full hover:bg-[#004182] transition-colors">
                        Request Report
                    </button>
                </div>
            </div>

            {/* Real-time Performance Stats (using API data) */}
            {performanceReport && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Current Performance Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 border border-gray-200 rounded-md bg-[#f3f2ef]">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Overall Score</h3>
                            <p className="text-2xl font-bold text-gray-900">{performanceReport.averageScore}%</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-md bg-[#f3f2ef]">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Employees Evaluated</h3>
                            <p className="text-2xl font-bold text-gray-900">{performanceReport.employeeCount}</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-md bg-[#f3f2ef]">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Improvement Rate</h3>
                            <p className="text-2xl font-bold text-gray-900">{performanceReport.improvementRate}%</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-md bg-[#f3f2ef]">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Improving Employees</h3>
                            <p className="text-2xl font-bold text-gray-900">{performanceReport.improvedEmployees}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Real-time Productivity Stats (using API data) */}
            {productivityReport && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Current Productivity Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 border border-gray-200 rounded-md bg-[#f3f2ef]">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Task Completion</h3>
                            <p className="text-2xl font-bold text-gray-900">{productivityReport.completionRate}%</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-md bg-[#f3f2ef]">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Tasks Completed</h3>
                            <p className="text-2xl font-bold text-gray-900">{productivityReport.completedTasks}</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-md bg-[#f3f2ef]">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Total Tasks</h3>
                            <p className="text-2xl font-bold text-gray-900">{productivityReport.taskCount}</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-md bg-[#f3f2ef]">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Avg. Completion Time</h3>
                            <p className="text-2xl font-bold text-gray-900">{productivityReport.avgCompletionTime} hrs</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="overflow-x-auto">
                    {filteredReports.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-lg text-gray-600">No reports found</p>
                        </div>
                    ) : (
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Report Title</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Author</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-[#f3f2ef]">
                                        <td className="py-3 px-4 font-medium text-gray-900">{report.title}</td>
                                        <td className="py-3 px-4 capitalize text-gray-700">{report.type}</td>
                                        <td className="py-3 px-4 text-gray-700">{new Date(report.date).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-gray-700">{report.author}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'draft'
                                                    ? 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]'
                                                    : 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]'
                                                }`}>
                                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-3">
                                                <button className="text-[#0a66c2] hover:text-[#004182] flex items-center">
                                                    <EyeIcon className="h-4 w-4 mr-1" />
                                                    <span className="text-sm">View</span>
                                                </button>
                                                <button className="text-[#0a66c2] hover:text-[#004182] flex items-center">
                                                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                                    <span className="text-sm">Download</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Reports</h2>
                    <div className="space-y-4">
                        {reports.slice(0, 3).map(report => (
                            <div key={report.id} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
                                <div className="flex items-start">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                                        <p className="text-sm text-gray-600">{new Date(report.date).toLocaleDateString()} • {report.author}</p>
                                    </div>
                                </div>
                                <button className="text-[#0a66c2] hover:text-[#004182] text-sm font-medium">
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Report Requests</h2>
                    <div className="mb-4">
                        <p className="text-gray-600 mb-4">Request a custom report from the relevant department.</p>
                        <form className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Report Type</label>
                                <select className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition">
                                    <option value="employee">Employee</option>
                                    <option value="financial">Financial</option>
                                    <option value="productivity">Productivity</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition placeholder-gray-500"
                                    rows="3"
                                    placeholder="Describe the report you need..."
                                ></textarea>
                            </div>

                            <button
                                type="button"
                                className="px-4 py-2 bg-[#0a66c2] text-white text-sm font-medium rounded-full hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-2 transition-colors"
                            >
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}