import Link from 'next/link';

export default function CEODashboard({ stats = {} }) {
    // Default values if props aren't provided
    const {
        employeeCount = 0,
        departmentCount = 0,
        productivity = 0,
        taskCompletion = 0,
        employeeGrowth = "0%",
        productivityChange = "0%"
    } = stats;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">CEO Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Employee Count Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Employees</h2>
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">{employeeCount}</span>
                        <span className="text-xs font-medium bg-[#e7f3ff] text-[#0a66c2] px-2 py-1 rounded-full border border-[#c3d9f0]">
                            {employeeGrowth} YTD
                        </span>
                    </div>
                </div>

                {/* Department Count Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Departments</h2>
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">{departmentCount}</span>
                        <span className="text-xs font-medium bg-[#ddf5f2] text-[#057642] px-2 py-1 rounded-full border border-[#c0e6c0]">
                            All Active
                        </span>
                    </div>
                </div>

                {/* Productivity Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Productivity</h2>
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">{productivity}%</span>
                        <span className="text-xs font-medium bg-[#f5f2e3] text-[#915907] px-2 py-1 rounded-full border border-[#e8d6a8]">
                            {productivityChange} MoM
                        </span>
                    </div>
                </div>

                {/* Task Completion Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Completion</h2>
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">{taskCompletion}%</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${taskCompletion >= 90 ? 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]' :
                                taskCompletion >= 75 ? 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]' :
                                    taskCompletion >= 60 ? 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]' :
                                        'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]'
                            }`}>
                            {taskCompletion >= 90 ? 'Excellent' :
                                taskCompletion >= 75 ? 'On Target' :
                                    taskCompletion >= 60 ? 'Adequate' : 'Needs Attention'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Performance Chart */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Department Performance</h2>
                        <Link href="/dashboard/ceo/analytics" className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                            View Details
                        </Link>
                    </div>
                    <div className="h-64 flex items-center justify-center border border-gray-200 rounded bg-[#f3f2ef]">
                        <p className="text-gray-500">Chart will be implemented in next phase</p>
                    </div>
                </div>

                {/* Employee Distribution Chart */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Employee Distribution</h2>
                        <Link href="/dashboard/ceo/analytics" className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                            View Details
                        </Link>
                    </div>
                    <div className="h-64 flex items-center justify-center border border-gray-200 rounded bg-[#f3f2ef]">
                        <p className="text-gray-500">Chart will be implemented in next phase</p>
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Key Projects Status</h2>
                    <Link href="/dashboard/ceo/reports" className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium">
                        View All Reports
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="border-b border-gray-200 bg-[#f3f2ef]">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Project</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Lead</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Progress</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Deadline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-[#f3f2ef]">
                                <td className="py-3 px-4 text-gray-900">Product Launch</td>
                                <td className="py-3 px-4 text-gray-700">Sarah Thompson</td>
                                <td className="py-3 px-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-[#0a66c2] h-2 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="bg-[#ddf5f2] text-[#057642] text-xs font-medium px-2 py-1 rounded-full border border-[#c0e6c0]">On Track</span>
                                </td>
                                <td className="py-3 px-4 text-gray-700">Dec 31, 2023</td>
                            </tr>
                            <tr className="hover:bg-[#f3f2ef]">
                                <td className="py-3 px-4 text-gray-900">Platform Redesign</td>
                                <td className="py-3 px-4 text-gray-700">Michael Chen</td>
                                <td className="py-3 px-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-[#0a66c2] h-2 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="bg-[#f5f2e3] text-[#915907] text-xs font-medium px-2 py-1 rounded-full border border-[#e8d6a8]">At Risk</span>
                                </td>
                                <td className="py-3 px-4 text-gray-700">Nov 15, 2023</td>
                            </tr>
                            <tr className="hover:bg-[#f3f2ef]">
                                <td className="py-3 px-4 text-gray-900">Market Expansion</td>
                                <td className="py-3 px-4 text-gray-700">Jessica Reynolds</td>
                                <td className="py-3 px-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-[#0a66c2] h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="bg-[#ddf5f2] text-[#057642] text-xs font-medium px-2 py-1 rounded-full border border-[#c0e6c0]">On Track</span>
                                </td>
                                <td className="py-3 px-4 text-gray-700">Jan 15, 2024</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}