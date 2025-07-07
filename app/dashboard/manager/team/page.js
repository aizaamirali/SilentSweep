'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import managerApi from '@/lib/api/managerApi';
import {
    ExclamationCircleIcon,
    CheckCircleIcon,
    PlusIcon,
    UserGroupIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function TeamPage() {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showPerformanceForm, setShowPerformanceForm] = useState(false);
    const [performanceData, setPerformanceData] = useState({
        rating: 3,
        feedback: '',
        areas: {
            taskCompletion: 3,
            quality: 3,
            communication: 3,
            teamwork: 3
        }
    });

    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const fetchTeamMembers = async () => {
            try {
                setLoading(true);

                // Use the managerApi to fetch team members
                const members = await managerApi.team.getTeamMembers(currentUser.uid);
                setTeamMembers(members);
                setError('');
            } catch (error) {
                console.error('Error fetching team members:', error);
                setError('Failed to load team members');

                // Fallback to sample data
                setTeamMembers([
                    {
                        id: '1',
                        displayName: 'John Doe',
                        email: 'john.doe@example.com',
                        role: 'Frontend Developer',
                        active: true,
                        joinDate: '2023-02-15',
                        performance: {
                            rating: 4,
                            lastReviewDate: '2023-09-15',
                            attendance: 98
                        }
                    },
                    {
                        id: '2',
                        displayName: 'Jane Smith',
                        email: 'jane.smith@example.com',
                        role: 'Backend Developer',
                        active: true,
                        joinDate: '2022-11-03',
                        performance: {
                            rating: 5,
                            lastReviewDate: '2023-09-10',
                            attendance: 96
                        }
                    },
                    {
                        id: '3',
                        displayName: 'Mike Johnson',
                        email: 'mike.johnson@example.com',
                        role: 'UI/UX Designer',
                        active: true,
                        joinDate: '2023-01-20',
                        performance: {
                            rating: 3,
                            lastReviewDate: '2023-08-22',
                            attendance: 92
                        }
                    },
                    {
                        id: '4',
                        displayName: 'Sarah Williams',
                        email: 'sarah.williams@example.com',
                        role: 'QA Engineer',
                        active: true,
                        joinDate: '2022-08-05',
                        performance: {
                            rating: 4,
                            lastReviewDate: '2023-09-05',
                            attendance: 99
                        }
                    },
                    {
                        id: '5',
                        displayName: 'Robert Brown',
                        email: 'robert.brown@example.com',
                        role: 'DevOps Engineer',
                        active: false,
                        joinDate: '2023-03-12',
                        performance: {
                            rating: 4,
                            lastReviewDate: '2023-08-15',
                            attendance: 90
                        }
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMembers();
    }, [currentUser]);

    const handlePerformanceSubmit = async (e) => {
        e.preventDefault();

        if (!selectedEmployee) return;

        try {
            // Use the managerApi to submit evaluation
            await managerApi.team.submitEvaluation(selectedEmployee.id, performanceData);

            // Update local state
            setTeamMembers(teamMembers.map(member =>
                member.id === selectedEmployee.id
                    ? {
                        ...member,
                        performance: {
                            ...member.performance,
                            rating: performanceData.rating,
                            lastReviewDate: new Date().toLocaleDateString()
                        }
                    }
                    : member
            ));

            setSuccess('Performance evaluation submitted successfully');
            setShowPerformanceForm(false);
            setSelectedEmployee(null);

            // Reset form
            setPerformanceData({
                rating: 3,
                feedback: '',
                areas: {
                    taskCompletion: 3,
                    quality: 3,
                    communication: 3,
                    teamwork: 3
                }
            });

            // Clear success message after a while
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            console.error('Error submitting evaluation:', error);
            setError(error.message || 'Failed to submit evaluation');

            // Clear error message after a while
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleEmployeeStatusChange = async (employeeId, newStatus) => {
        try {
            // Use the managerApi to update employee status
            await managerApi.team.updateEmployeeStatus(employeeId, newStatus);

            // Update in local state
            setTeamMembers(teamMembers.map(member =>
                member.id === employeeId ? { ...member, active: newStatus } : member
            ));

            setSuccess(`Employee status ${newStatus ? 'activated' : 'deactivated'} successfully`);

            // Clear success message after a while
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            console.error('Error updating employee status:', error);
            setError(error.message || 'Failed to update employee status');

            // Clear error message after a while
            setTimeout(() => setError(''), 5000);
        }
    };

    const evaluateEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowPerformanceForm(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    // Calculate team stats
    const teamStats = {
        total: teamMembers.length,
        active: teamMembers.filter(m => m.active).length,
        avgPerformance: (teamMembers.reduce((sum, m) => sum + m.performance.rating, 0) / teamMembers.length).toFixed(1),
        avgAttendance: (teamMembers.reduce((sum, m) => sum + m.performance.attendance, 0) / teamMembers.length).toFixed(1)
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => fetchTeamMembers()}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh team members"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <Link
                        href="/dashboard/manager/team/add"
                        className="flex items-center px-4 py-2 bg-[#0a66c2] text-white text-sm font-medium rounded-full hover:bg-[#004182] transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Team Member
                    </Link>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-[#FEF9F1] border border-[#FACCA6] text-[#b74700] rounded-lg flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 bg-[#ddf5f2] border border-[#c0e6c0] text-[#057642] rounded-lg flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{success}</p>
                </div>
            )}

            {/* Team Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#e7f3ff] mr-4">
                            <UserGroupIcon className="h-6 w-6 text-[#0a66c2]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Total Members</h3>
                            <p className="text-2xl font-bold text-gray-900">{teamStats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#ddf5f2] mr-4">
                            <UserGroupIcon className="h-6 w-6 text-[#057642]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Active Members</h3>
                            <p className="text-2xl font-bold text-gray-900">
                                {teamStats.active}/{teamStats.total}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#f5f2e3] mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round" className="h-6 w-6 text-[#915907]">
                                <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Avg Performance</h3>
                            <p className="text-2xl font-bold text-gray-900">{teamStats.avgPerformance}/5</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#e7f3ff] mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round" className="h-6 w-6 text-[#0a66c2]">
                                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Avg Attendance</h3>
                            <p className="text-2xl font-bold text-gray-900">{teamStats.avgAttendance}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Evaluation Form */}
            {showPerformanceForm ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Performance Evaluation</h2>
                        <button
                            onClick={() => {
                                setShowPerformanceForm(false);
                                setSelectedEmployee(null);
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-[#f3f2ef] rounded-lg">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] border border-[#c3d9f0] mr-3 text-lg font-semibold">
                                {selectedEmployee?.displayName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 text-lg">{selectedEmployee?.displayName}</h3>
                                <p className="text-gray-600">{selectedEmployee?.role}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handlePerformanceSubmit} className="space-y-6">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Overall Rating</label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <label
                                        key={rating}
                                        className={`flex items-center justify-center w-10 h-10 rounded-full cursor-pointer border ${performanceData.rating === rating
                                                ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setPerformanceData({ ...performanceData, rating })}
                                    >
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={rating}
                                            checked={performanceData.rating === rating}
                                            onChange={() => { }}
                                            className="sr-only"
                                        />
                                        {rating}
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                                <span>Needs Improvement</span>
                                <span>Excellent</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Task Completion</label>
                                <select
                                    value={performanceData.areas.taskCompletion}
                                    onChange={(e) => setPerformanceData({
                                        ...performanceData,
                                        areas: {
                                            ...performanceData.areas,
                                            taskCompletion: parseInt(e.target.value)
                                        }
                                    })}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                                >
                                    <option value={1}>1 - Poor</option>
                                    <option value={2}>2 - Below Average</option>
                                    <option value={3}>3 - Average</option>
                                    <option value={4}>4 - Good</option>
                                    <option value={5}>5 - Excellent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Quality of Work</label>
                                <select
                                    value={performanceData.areas.quality}
                                    onChange={(e) => setPerformanceData({
                                        ...performanceData,
                                        areas: {
                                            ...performanceData.areas,
                                            quality: parseInt(e.target.value)
                                        }
                                    })}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                                >
                                    <option value={1}>1 - Poor</option>
                                    <option value={2}>2 - Below Average</option>
                                    <option value={3}>3 - Average</option>
                                    <option value={4}>4 - Good</option>
                                    <option value={5}>5 - Excellent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Communication</label>
                                <select
                                    value={performanceData.areas.communication}
                                    onChange={(e) => setPerformanceData({
                                        ...performanceData,
                                        areas: {
                                            ...performanceData.areas,
                                            communication: parseInt(e.target.value)
                                        }
                                    })}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                                >
                                    <option value={1}>1 - Poor</option>
                                    <option value={2}>2 - Below Average</option>
                                    <option value={3}>3 - Average</option>
                                    <option value={4}>4 - Good</option>
                                    <option value={5}>5 - Excellent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Teamwork</label>
                                <select
                                    value={performanceData.areas.teamwork}
                                    onChange={(e) => setPerformanceData({
                                        ...performanceData,
                                        areas: {
                                            ...performanceData.areas,
                                            teamwork: parseInt(e.target.value)
                                        }
                                    })}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                                >
                                    <option value={1}>1 - Poor</option>
                                    <option value={2}>2 - Below Average</option>
                                    <option value={3}>3 - Average</option>
                                    <option value={4}>4 - Good</option>
                                    <option value={5}>5 - Excellent</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Feedback</label>
                            <textarea
                                value={performanceData.feedback}
                                onChange={(e) => setPerformanceData({
                                    ...performanceData,
                                    feedback: e.target.value
                                })}
                                rows={4}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                                placeholder="Provide detailed feedback for the employee..."
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPerformanceForm(false);
                                    setSelectedEmployee(null);
                                }}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#0a66c2] text-white font-medium rounded-full hover:bg-[#004182] transition-colors"
                            >
                                Submit Evaluation
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-0">Team Members</h2>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                    </svg>
                                </div>
                                <input type="search" className="block w-full sm:w-64 p-2 pl-10 text-sm border border-gray-300 rounded-full focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none" placeholder="Search team members..." />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#f3f2ef]">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Join Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Performance
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Attendance
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teamMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-[#f3f2ef] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] border border-[#c3d9f0] mr-3">
                                                    {member.displayName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{member.displayName}</div>
                                                    <div className="text-sm text-gray-500">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {member.role}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {member.joinDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${member.active
                                                    ? 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                }`}>
                                                {member.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`text-sm ${i < member.performance.rating
                                                                ? 'text-[#915907]'
                                                                : 'text-gray-300'
                                                            }`}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {member.performance.lastReviewDate}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className={`text-sm font-medium ${member.performance.attendance >= 95
                                                        ? 'text-[#057642]'
                                                        : member.performance.attendance >= 90
                                                            ? 'text-[#915907]'
                                                            : 'text-[#b74700]'
                                                    }`}>
                                                    {member.performance.attendance}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    onClick={() => evaluateEmployee(member)}
                                                    className="text-[#0a66c2] hover:text-[#004182] transition-colors"
                                                    title="Evaluate performance"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </button>
                                                <Link
                                                    href={`/dashboard/manager/tasks?assignTo=${member.id}`}
                                                    className="text-[#0a66c2] hover:text-[#004182] transition-colors"
                                                    title="Assign tasks"
                                                >
                                                    <ClipboardDocumentListIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleEmployeeStatusChange(member.id, !member.active)}
                                                    className={`${member.active
                                                            ? 'text-[#b74700] hover:text-[#933800]'
                                                            : 'text-[#057642] hover:text-[#046235]'
                                                        } transition-colors`}
                                                    title={member.active ? "Deactivate employee" : "Activate employee"}
                                                >
                                                    {member.active ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round" className="h-5 w-5">
                                                            <path d="M18.364 18.364A9 9 0 0 1 12 21a9 9 0 0 1-6.364-2.636m12.728-12.728A9 9 0 0 0 12 3a9 9 0 0 0-6.366 2.636" />
                                                            <path d="m4.5 19.5 15-15" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round" className="h-5 w-5">
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                            <path d="m9 11 3 3L22 4" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Average Performance Rating</span>
                                <span className="font-medium text-gray-900">
                                    {teamStats.avgPerformance}/5
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#0a66c2] h-2 rounded-full"
                                    style={{
                                        width: `${(teamMembers.reduce((sum, member) => sum + member.performance.rating, 0) / teamMembers.length) * 20}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Team Attendance Rate</span>
                                <span className="font-medium text-gray-900">
                                    {teamStats.avgAttendance}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#057642] h-2 rounded-full"
                                    style={{
                                        width: `${teamMembers.reduce((sum, member) => sum + member.performance.attendance, 0) / teamMembers.length}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Active Team Members</span>
                                <span className="font-medium text-gray-900">
                                    {teamStats.active}/{teamStats.total}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#0a66c2] h-2 rounded-full"
                                    style={{
                                        width: `${(teamMembers.filter(m => m.active).length / teamMembers.length) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-medium text-gray-900 mb-3">Top Performers</h3>
                        <div className="space-y-3">
                            {teamMembers
                                .sort((a, b) => b.performance.rating - a.performance.rating)
                                .slice(0, 3)
                                .map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] border border-[#c3d9f0] mr-3">
                                                {member.displayName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{member.displayName}</div>
                                                <div className="text-sm text-gray-500">{member.role}</div>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`text-lg ${i < member.performance.rating
                                                        ? 'text-[#915907]'
                                                        : 'text-gray-300'
                                                    }`}>
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h2>
                    <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                            <div className="flex items-start">
                                <div className="h-8 w-8 rounded-full bg-[#ddf5f2] flex items-center justify-center text-[#057642] mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round" className="h-4 w-4">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <path d="m9 11 3 3L22 4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">Jane Smith completed the UI design for the new dashboard</p>
                                    <p className="text-xs text-gray-500 mt-1">Today, 10:24 AM</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                            <div className="flex items-start">
                                <div className="h-8 w-8 rounded-full bg-[#FEF9F1] flex items-center justify-center text-[#b74700] mr-3">
                                    <ExclamationCircleIcon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">Performance evaluation for John Doe is overdue by 2 weeks</p>
                                    <p className="text-xs text-gray-500 mt-1">Yesterday, 2:15 PM</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                            <div className="flex items-start">
                                <div className="h-8 w-8 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round" className="h-4 w-4">
                                        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">Project deadline extension approved by management</p>
                                    <p className="text-xs text-gray-500 mt-1">May 12, 2025, 9:30 AM</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                            <div className="flex items-start">
                                <div className="h-8 w-8 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] mr-3">
                                    <UserGroupIcon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">Team meeting scheduled for Friday at 10:00 AM</p>
                                    <p className="text-xs text-gray-500 mt-1">May 10, 2025, 3:45 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link href="/dashboard/manager/reports" className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                            View detailed team reports →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}