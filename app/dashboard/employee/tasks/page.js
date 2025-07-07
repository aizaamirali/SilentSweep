'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import employeeApi from '@/lib/api/employeeApi';
import Link from 'next/link';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ClipboardDocumentIcon,
    ChevronDownIcon,
    ArrowPathIcon,
    ClockIcon,
    CheckIcon,
    PauseIcon,
    ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';

export default function EmployeeTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('all');
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, [currentUser]);

    const fetchTasks = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // Use the employeeApi to fetch tasks
            const tasksData = await employeeApi.tasks.getMyTasks(currentUser.uid);

            // Sort tasks by due date (ascending)
            tasksData.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            setTasks(tasksData);
            setError('');
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            // Use the employeeApi to update task status
            await employeeApi.tasks.updateTaskStatus(taskId, newStatus);

            // Update local state
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            ));

            setSuccess('Task status updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating task status:', err);
            setError(err.message || 'Failed to update task status. Please try again.');
            setTimeout(() => setError(''), 5000);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    // Calculate stats
    const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        notStarted: tasks.filter(t => t.status === 'not_started').length,
        overdue: tasks.filter(t => {
            const dueDate = new Date(t.dueDate);
            const today = new Date();
            return dueDate < today && t.status !== 'completed';
        }).length
    };

    // Helper function to get status badge style
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]';
            case 'in_progress':
                return 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]';
            case 'not_started':
                return 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    // Helper function to format the status text
    const formatStatus = (status) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Helper to check if task is overdue
    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date() ? 'text-[#b74700]' : '';
    };

    // Helper to format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading && tasks.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchTasks}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh tasks"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                    </button>

                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none pl-3 pr-10 py-2 text-sm font-medium border border-gray-300 rounded-full focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none bg-white"
                        >
                            <option value="all">All Tasks</option>
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <ChevronDownIcon className="h-4 w-4" />
                        </div>
                    </div>
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

            {/* Task Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#e7f3ff] mr-4">
                            <ClipboardDocumentIcon className="h-6 w-6 text-[#0a66c2]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Total Tasks</h3>
                            <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#ddf5f2] mr-4">
                            <CheckIcon className="h-6 w-6 text-[#057642]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Completed</h3>
                            <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#e7f3ff] mr-4">
                            <ArrowPathRoundedSquareIcon className="h-6 w-6 text-[#0a66c2]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">In Progress</h3>
                            <p className="text-2xl font-bold text-gray-900">{taskStats.inProgress}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#FEF9F1] mr-4">
                            <ClockIcon className="h-6 w-6 text-[#b74700]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Overdue</h3>
                            <p className="text-2xl font-bold text-gray-900">{taskStats.overdue}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Task List</h2>
                </div>

                <div className="overflow-x-auto">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-10 px-6">
                            <ClipboardDocumentIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500">No tasks found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {filter !== 'all' ? 'Try changing the filter or' : ''} check back later for new assignments
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredTasks.map((task) => (
                                <div key={task.id} className="p-6 hover:bg-[#f3f2ef] transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center">
                                                <h3 className="text-lg font-medium text-gray-900 mr-3">{task.title}</h3>
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(task.status)}`}>
                                                    {formatStatus(task.status)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className={`text-sm ${isOverdue(task.dueDate)} flex items-center`}>
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    <span>Due: {formatDate(task.dueDate)}</span>
                                                </span>
                                                <span className="text-sm text-gray-500 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round" className="h-4 w-4 mr-1">
                                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                        <circle cx="9" cy="7" r="4" />
                                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                    </svg>
                                                    Assigned by: {task.assignedBy?.name || "Manager"}
                                                </span>
                                                <span className="text-sm text-gray-500 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round" className="h-4 w-4 mr-1">
                                                        <path d="M12 20V10" />
                                                        <path d="M18 20V4" />
                                                        <path d="M6 20v-6" />
                                                    </svg>
                                                    Priority: {task.priority || "Medium"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 mt-4 sm:mt-0">
                                            {task.status === 'not_started' && (
                                                <button
                                                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                                                    className="flex items-center px-3 py-1.5 bg-[#e7f3ff] text-[#0a66c2] text-sm font-medium rounded-full hover:bg-[#d3e7f8] transition-colors border border-[#c3d9f0]"
                                                >
                                                    <ArrowPathRoundedSquareIcon className="h-4 w-4 mr-1.5" />
                                                    Start Task
                                                </button>
                                            )}
                                            {task.status === 'in_progress' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(task.id, 'completed')}
                                                        className="flex items-center px-3 py-1.5 bg-[#ddf5f2] text-[#057642] text-sm font-medium rounded-full hover:bg-[#c9edea] transition-colors border border-[#c0e6c0]"
                                                    >
                                                        <CheckIcon className="h-4 w-4 mr-1.5" />
                                                        Complete
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(task.id, 'not_started')}
                                                        className="flex items-center px-3 py-1.5 bg-[#f5f2e3] text-[#915907] text-sm font-medium rounded-full hover:bg-[#f0edd8] transition-colors border border-[#e8d6a8]"
                                                    >
                                                        <PauseIcon className="h-4 w-4 mr-1.5" />
                                                        Pause
                                                    </button>
                                                </>
                                            )}
                                            {task.status === 'completed' && (
                                                <button
                                                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                                                    className="flex items-center px-3 py-1.5 bg-[#e7f3ff] text-[#0a66c2] text-sm font-medium rounded-full hover:bg-[#d3e7f8] transition-colors border border-[#c3d9f0]"
                                                >
                                                    <ArrowPathRoundedSquareIcon className="h-4 w-4 mr-1.5" />
                                                    Reopen
                                                </button>
                                            )}
                                            <Link
                                                href={`/dashboard/employee/tasks/${task.id}`}
                                                className="flex items-center px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors border border-gray-300"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {tasks.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Progress</h2>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-700">Completed</span>
                                <span className="text-sm text-gray-700">{taskStats.completed}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#057642] h-2 rounded-full"
                                    style={{
                                        width: `${Math.round((taskStats.completed / taskStats.total) * 100)}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-700">In Progress</span>
                                <span className="text-sm text-gray-700">{taskStats.inProgress}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#0a66c2] h-2 rounded-full"
                                    style={{
                                        width: `${Math.round((taskStats.inProgress / taskStats.total) * 100)}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-700">Not Started</span>
                                <span className="text-sm text-gray-700">{taskStats.notStarted}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#915907] h-2 rounded-full"
                                    style={{
                                        width: `${Math.round((taskStats.notStarted / taskStats.total) * 100)}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-700">Overdue</span>
                                <span className="text-sm text-gray-700">{taskStats.overdue}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#b74700] h-2 rounded-full"
                                    style={{
                                        width: `${Math.round((taskStats.overdue / taskStats.total) * 100)}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}