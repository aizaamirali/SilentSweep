'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import employeeApi from '@/lib/api/employeeApi';
import {
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    UserGroupIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function AttendancePage() {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        onTime: 0
    });
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(() => {
        const current = new Date();
        return `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    });
    const [clockInLoading, setClockInLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const fetchAttendanceData = async () => {
            try {
                setLoading(true);

                // Parse selected month
                const [year, monthNum] = month.split('-').map(num => parseInt(num, 10));

                // Use the employeeApi to fetch attendance records
                const attendanceData = await employeeApi.attendance.getMonthlyAttendance(
                    currentUser.uid,
                    year,
                    monthNum
                );

                // Get attendance statistics
                const statsData = await employeeApi.attendance.getAttendanceStats(currentUser.uid);

                setAttendanceRecords(attendanceData);
                setStats(statsData);
                setError('');
            } catch (error) {
                console.error("Error fetching attendance data:", error);
                setError("Failed to load attendance records. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [currentUser, month]);

    const handleClockInOut = async () => {
        if (!currentUser) return;

        setClockInLoading(true);
        setError('');
        setSuccess('');

        try {
            // Use the employeeApi to clock in/out
            const result = await employeeApi.attendance.clockInOut();

            const action = result.action === 'clockIn' ? 'in' : 'out';
            setSuccess(`Successfully clocked ${action}`);

            // Refresh attendance data - get current month
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setMonth(currentMonth);
        } catch (error) {
            console.error("Error updating attendance:", error);
            setError(error.message || "Failed to update attendance record");
        } finally {
            setClockInLoading(false);
        }
    };

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
    };

    if (loading && attendanceRecords.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>

                <button
                    onClick={handleClockInOut}
                    disabled={clockInLoading}
                    className="px-4 py-2 bg-[#0a66c2] text-white font-medium rounded-full hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {clockInLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        <span className="flex items-center">
                            <ClockIcon className="h-5 w-5 mr-2" />
                            Clock In/Out
                        </span>
                    )}
                </button>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#ddf5f2] mr-4">
                            <UserGroupIcon className="h-6 w-6 text-[#057642]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Present Days</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#FEF9F1] mr-4">
                            <XCircleIcon className="h-6 w-6 text-[#b74700]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Absent Days</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#ddf5f2] mr-4">
                            <CheckCircleIcon className="h-6 w-6 text-[#057642]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">On Time</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.onTime}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#f5f2e3] mr-4">
                            <ClockIcon className="h-6 w-6 text-[#915907]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Late</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">Monthly Records</h2>

                    <input
                        type="month"
                        value={month}
                        onChange={handleMonthChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none"
                    />
                </div>

                <div className="overflow-x-auto">
                    {attendanceRecords.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
                            <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500">No attendance records for this month</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#f3f2ef]">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Day
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Clock In
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Clock Out
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {attendanceRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-[#f3f2ef] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.dayOfWeek}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${record.status === 'present'
                                                ? 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]'
                                                : 'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]'
                                                }`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={record.isLate
                                                ? 'text-[#b74700] font-medium'
                                                : record.clockIn
                                                    ? 'text-gray-900'
                                                    : 'text-gray-500'}>
                                                {record.clockIn || '--'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.clockOut || '--'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h2>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Attendance Rate</span>
                            <span className="font-medium text-gray-900">
                                {stats.present > 0 || stats.absent > 0
                                    ? Math.round((stats.present / (stats.present + stats.absent)) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#057642] h-2 rounded-full"
                                style={{
                                    width: `${stats.present > 0 || stats.absent > 0
                                        ? Math.round((stats.present / (stats.present + stats.absent)) * 100)
                                        : 0}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Punctuality</span>
                            <span className="font-medium text-gray-900">
                                {stats.onTime > 0 || stats.late > 0
                                    ? Math.round((stats.onTime / (stats.onTime + stats.late)) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#0a66c2] h-2 rounded-full"
                                style={{
                                    width: `${stats.onTime > 0 || stats.late > 0
                                        ? Math.round((stats.onTime / (stats.onTime + stats.late)) * 100)
                                        : 0}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}