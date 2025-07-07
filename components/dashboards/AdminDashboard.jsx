import Link from 'next/link';

export default function AdminDashboard({ stats = {}, recentActivities = [] }) {
    // Default values if props aren't provided
    const {
        activeUsers = 42,
        totalUsers = 156,
        inactiveUsers = 14,
        logEvents = 165,
        pendingUpdates = 8,
        roleCounts = {
            admin: 4,
            manager: 12,
            employee: 139,
            ceo: 1
        }
    } = stats;

    // Use provided activities or fallback to dummy data
    const activities = recentActivities.length > 0 ? recentActivities : [
        { user: 'John Doe', action: 'User login', time: '10 mins ago' },
        { user: 'Jane Smith', action: 'Password reset', time: '45 mins ago' },
        { user: 'Mike Johnson', action: 'Role changed to Manager', time: '2 hours ago' },
        { user: 'Sarah Williams', action: 'New user created', time: '3 hours ago' },
        { user: 'Robert Brown', action: 'User deactivated', time: '5 hours ago' }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

            {/* User Overview */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">User Overview</h2>
                    <Link href="/dashboard/admin/users" className="text-sm text-[#0a66c2] hover:underline font-medium">
                        View All Users
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-gray-200 border-b border-gray-200">
                    <div className="p-5">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Users</h3>
                        <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                    </div>

                    <div className="p-5">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Active Users</h3>
                        <p className="text-2xl font-bold text-[#057642]">{activeUsers}</p>
                    </div>

                    <div className="p-5">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Inactive Users</h3>
                        <p className="text-2xl font-bold text-[#b74700]">{inactiveUsers}</p>
                    </div>

                    <div className="p-5">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">System Logs</h3>
                        <p className="text-2xl font-bold text-gray-900">{logEvents}</p>
                    </div>
                </div>

                <div className="p-5">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">User Role Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Admins</h4>
                            <p className="text-xl font-bold text-[#0a66c2]">{roleCounts.admin}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">CEOs</h4>
                            <p className="text-xl font-bold text-[#0a66c2]">{roleCounts.ceo}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Managers</h4>
                            <p className="text-xl font-bold text-[#0a66c2]">{roleCounts.manager}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Employees</h4>
                            <p className="text-xl font-bold text-[#0a66c2]">{roleCounts.employee}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center p-5 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
                        <Link href="/dashboard/admin/settings" className="text-sm text-[#0a66c2] hover:underline font-medium">
                            Manage Settings
                        </Link>
                    </div>
                    <div className="p-5">
                        <p className="text-sm text-gray-600 mb-4">Configure system-wide settings and preferences</p>
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-900">{pendingUpdates}</span>
                            <span className="text-sm bg-[#FEF9F1] text-[#b74700] px-3 py-1.5 rounded-full border border-[#FACCA6] font-medium">
                                Pending Updates
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center p-5 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">System Logs</h2>
                        <Link href="/dashboard/admin/logs" className="text-sm text-[#0a66c2] hover:underline font-medium">
                            View All Logs
                        </Link>
                    </div>
                    <div className="p-5">
                        <p className="text-sm text-gray-600 mb-4">Monitor system activity and security logs</p>
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-900">{logEvents}</span>
                            <span className="text-sm bg-[#e7f3ff] text-[#0a66c2] px-3 py-1.5 rounded-full border border-[#c3d9f0] font-medium">
                                Today's Events
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
                    <Link href="/dashboard/admin/logs" className="text-sm text-[#0a66c2] hover:underline font-medium">
                        View All Logs
                    </Link>
                </div>
                <div className="divide-y divide-gray-200">
                    {activities.map((activity, index) => (
                        <div key={index} className="flex justify-between items-center p-4 hover:bg-gray-50">
                            <div>
                                <p className="font-medium text-gray-900">{activity.user}</p>
                                <p className="text-sm text-gray-600">{activity.action}</p>
                            </div>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}