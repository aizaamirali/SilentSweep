import Link from 'next/link';
import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    CalendarIcon,
    ChartBarIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';

export default function EmployeeDashboard({
    stats = {
        taskStats: { total: 0, dueToday: 0 },
        attendance: { rate: "98%", period: "This Month" },
        performance: { score: "92%", status: "Above Target" }
    },
    recentTasks = [],
    upcomingEvents = []
}) {
    // Use the provided tasks or fallback to empty array
    const tasks = recentTasks.length > 0 ? recentTasks : [
        { title: 'Complete frontend design', status: 'In Progress', due: 'Today' },
        { title: 'Test authentication flow', status: 'Not Started', due: 'Tomorrow' },
        { title: 'Update user documentation', status: 'In Progress', due: '3 days' },
        { title: 'Fix reported bugs', status: 'Not Started', due: '1 week' },
        { title: 'Team meeting preparation', status: 'Completed', due: 'Yesterday' }
    ];

    // Use provided events or fallback to empty array
    const events = upcomingEvents.length > 0 ? upcomingEvents : [
        { title: 'Weekly Team Meeting', time: 'Tomorrow, 10:00 AM', type: 'Meeting' },
        { title: 'Project Deadline', time: 'Friday, 5:00 PM', type: 'Deadline' },
        { title: 'Performance Review', time: 'Next Monday, 2:00 PM', type: 'Meeting' },
        { title: 'Training Session', time: 'Next Wednesday, 11:00 AM', type: 'Training' }
    ];

    // Helper function to get status badge styles
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]';
            case 'In Progress':
                return 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]';
            case 'Overdue':
                return 'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]';
            case 'Not Started':
                return 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    // Helper function to get event type badge styles
    const getEventTypeBadge = (type) => {
        switch (type) {
            case 'Meeting':
                return 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]';
            case 'Deadline':
                return 'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]';
            case 'Training':
                return 'bg-[#f0ebff] text-[#5e35b1] border border-[#d8ccf7]';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#e7f3ff] mr-4">
                            <ClipboardDocumentListIcon className="h-6 w-6 text-[#0a66c2]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">My Tasks</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.taskStats.total}</p>
                            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]">
                                {stats.taskStats.dueToday} Due Today
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#ddf5f2] mr-4">
                            <ClockIcon className="h-6 w-6 text-[#057642]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Attendance</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.attendance.rate}</p>
                            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]">
                                {stats.attendance.period}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#e7f3ff] mr-4">
                            <ChartBarIcon className="h-6 w-6 text-[#0a66c2]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Performance</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.performance.score}</p>
                            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]">
                                {stats.performance.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/dashboard/employee/attendance/clock" className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors text-center">
                        <ClockIcon className="h-6 w-6 mx-auto text-[#0a66c2] mb-2" />
                        <span className="text-sm font-medium text-gray-900">Clock In/Out</span>
                    </Link>
                    <Link href="/dashboard/employee/tasks" className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors text-center">
                        <ClipboardDocumentListIcon className="h-6 w-6 mx-auto text-[#0a66c2] mb-2" />
                        <span className="text-sm font-medium text-gray-900">View All Tasks</span>
                    </Link>
                    <Link href="/dashboard/employee/calendar" className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors text-center">
                        <CalendarIcon className="h-6 w-6 mx-auto text-[#0a66c2] mb-2" />
                        <span className="text-sm font-medium text-gray-900">My Calendar</span>
                    </Link>
                    <Link href="/dashboard/employee/performance" className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors text-center">
                        <ChartBarIcon className="h-6 w-6 mx-auto text-[#0a66c2] mb-2" />
                        <span className="text-sm font-medium text-gray-900">My Performance</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
                        <Link href="/dashboard/employee/tasks" className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {tasks.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
                                <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500">No tasks assigned</p>
                            </div>
                        ) : (
                            tasks.map((task, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">Due: {task.due}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <Link href={`/dashboard/employee/tasks/${index}`} className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Events Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                        <Link href="/dashboard/employee/calendar" className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                            View Calendar
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {events.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
                                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500">No upcoming events</p>
                            </div>
                        ) : (
                            events.map((event, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-md hover:bg-[#f3f2ef] transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{event.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{event.time}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getEventTypeBadge(event.type)}`}>
                                            {event.type}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Performance Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Task Completion Rate</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#0a66c2] h-2 rounded-full"
                                style={{ width: `${85}%` }}
                            ></div>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-xs text-gray-600">85% Complete</span>
                            <span className="text-xs text-gray-600">17 of 20 tasks</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Attendance Score</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#057642] h-2 rounded-full"
                                style={{ width: `${98}%` }}
                            ></div>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-xs text-gray-600">98% Present</span>
                            <span className="text-xs text-gray-600">+2% from last month</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Productivity Score</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#0a66c2] h-2 rounded-full"
                                style={{ width: `${92}%` }}
                            ></div>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-xs text-gray-600">92% Productive</span>
                            <span className="text-xs text-gray-600">Above average</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}