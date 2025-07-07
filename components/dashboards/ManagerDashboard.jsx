import Link from 'next/link';
import {
    UserGroupIcon,
    ClipboardDocumentListIcon,
    ExclamationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ManagerDashboard({ stats }) {
    // Default values if props aren't provided
    const {
        teamMembers = 0,
        activeTasks = 0,
        overdueTasksCount = 0,
        attendanceRate = 0,
        attendanceFraction = '0/0',
        recentTasks = []
    } = stats;

    // Helper function to determine status badge color
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]';
            case 'in progress':
                return 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]';
            case 'not started':
                return 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]';
            case 'overdue':
                return 'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-300';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Team Members Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#e7f3ff] mr-4">
                            <UserGroupIcon className="h-6 w-6 text-[#0a66c2]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-700 mb-1">Team Members</h2>
                            <p className="text-2xl font-bold text-gray-900">{teamMembers}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href="/dashboard/manager/team"
                            className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium"
                        >
                            View team →
                        </Link>
                    </div>
                </div>

                {/* Active Tasks Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#e7f3ff] mr-4">
                            <ClipboardDocumentListIcon className="h-6 w-6 text-[#0a66c2]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-700 mb-1">Active Tasks</h2>
                            <p className="text-2xl font-bold text-gray-900">{activeTasks}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href="/dashboard/manager/tasks"
                            className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium"
                        >
                            Manage tasks →
                        </Link>
                    </div>
                </div>

                {/* Overdue Tasks Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#FEF9F1] mr-4">
                            <ExclamationCircleIcon className="h-6 w-6 text-[#b74700]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-700 mb-1">Overdue Tasks</h2>
                            <p className="text-2xl font-bold text-gray-900">{overdueTasksCount}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href="/dashboard/manager/tasks?filter=overdue"
                            className={`text-xs font-medium px-2 py-1 rounded-full ${overdueTasksCount === 0 ? 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]' :
                                    overdueTasksCount <= 2 ? 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]' :
                                        'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]'
                                }`}
                        >
                            {overdueTasksCount === 0 ? 'No overdue tasks' :
                                overdueTasksCount === 1 ? '1 task needs attention' :
                                    `${overdueTasksCount} tasks need attention`}
                        </Link>
                    </div>
                </div>

                {/* Attendance Rate Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#ddf5f2] mr-4">
                            <CheckCircleIcon className="h-6 w-6 text-[#057642]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-700 mb-1">Attendance Rate</h2>
                            <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm text-gray-600">{attendanceFraction} team members present</span>
                    </div>
                </div>
            </div>

            {/* Task Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
                        <Link href="/dashboard/manager/tasks" className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentTasks.map((task, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{task.task}</h3>
                                        <p className="text-sm text-gray-600 mt-1">Assigned to: {task.assignee}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-xs text-gray-600">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                    <Link href={`/dashboard/manager/tasks?taskId=${index}`} className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                                        Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Activity */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Team Activity</h2>
                        <Link href="/dashboard/manager/reports" className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                            View Reports
                        </Link>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Task Completion Rate</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#0a66c2] h-2 rounded-full"
                                style={{ width: `${75}%` }}
                            ></div>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-xs text-gray-600">75% Complete</span>
                            <span className="text-xs text-gray-600">27 of 36 tasks completed</span>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Team Productivity</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#057642] h-2 rounded-full"
                                style={{ width: `${89}%` }}
                            ></div>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-xs text-gray-600">89% Productive</span>
                            <span className="text-xs text-gray-600">+3% from last week</span>
                        </div>
                    </div>
                    <div className="mb-0">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Meeting Attendance</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#0a66c2] h-2 rounded-full"
                                style={{ width: `${96}%` }}
                            ></div>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-xs text-gray-600">96% Attendance</span>
                            <span className="text-xs text-gray-600">15/16 team members</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link href="/dashboard/manager/team/add" className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors text-center">
                        <UserGroupIcon className="h-6 w-6 mx-auto text-[#0a66c2] mb-2" />
                        <span className="text-sm font-medium text-gray-900">Add Team Member</span>
                    </Link>
                    <Link href="/dashboard/manager/tasks?action=new" className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors text-center">
                        <ClipboardDocumentListIcon className="h-6 w-6 mx-auto text-[#0a66c2] mb-2" />
                        <span className="text-sm font-medium text-gray-900">Create Task</span>
                    </Link>
                    <Link href="/dashboard/manager/schedule" className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mx-auto text-[#0a66c2] mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Schedule Meeting</span>
                    </Link>
                    <Link href="/dashboard/manager/reports/generate" className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mx-auto text-[#0a66c2] mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Generate Report</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}