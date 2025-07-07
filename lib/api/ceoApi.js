import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * CEO API functions for analytics
 */
export const analyticsApi = {
    // Get organization-wide analytics
    getOrganizationAnalytics: async () => {
        try {
            // Get all departments
            const departmentsQuery = query(
                collection(db, 'users'),
                where('role', '==', 'manager')
            );

            const departmentsSnapshot = await getDocs(departmentsQuery);
            const managers = departmentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get all employees
            const employeesQuery = query(
                collection(db, 'users'),
                where('role', '==', 'employee')
            );

            const employeesSnapshot = await getDocs(employeesQuery);
            const employees = employeesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                departmentId: doc.data().managerId // Using managerId as departmentId for simplicity
            }));

            // Get all tasks
            const tasksQuery = query(collection(db, 'tasks'));
            const tasksSnapshot = await getDocs(tasksQuery);
            const tasks = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get all attendance records for the current month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const attendanceQuery = query(
                collection(db, 'attendance'),
                where('date', '>=', Timestamp.fromDate(startOfMonth))
            );

            const attendanceSnapshot = await getDocs(attendanceQuery);
            const attendance = attendanceSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate key metrics

            // 1. Employee metrics
            const totalEmployees = employees.length;
            const activeEmployees = employees.filter(emp => emp.active).length;

            // 2. Task metrics
            const taskStats = {
                total: tasks.length,
                completed: tasks.filter(task => task.status === 'completed').length,
                inProgress: tasks.filter(task => task.status === 'in_progress').length,
                notStarted: tasks.filter(task => task.status === 'not_started').length,
                overdue: tasks.filter(task =>
                    task.status !== 'completed' &&
                    task.dueDate &&
                    new Date(task.dueDate) < new Date()
                ).length
            };

            // 3. Attendance metrics
            const totalAttendanceRecords = attendance.length;
            const presentRecords = attendance.filter(record => record.status === 'present').length;
            const attendanceRate = totalAttendanceRecords > 0
                ? Math.round((presentRecords / totalAttendanceRecords) * 100)
                : 0;

            // 4. Department metrics
            const departmentStats = [];

            for (const manager of managers) {
                // Count employees in this department
                const deptEmployees = employees.filter(emp => emp.managerId === manager.id);

                // Get tasks assigned to this department
                const deptTasks = tasks.filter(task =>
                    deptEmployees.some(emp => emp.id === task.assignedTo)
                );

                // Get attendance for this department
                const deptAttendance = attendance.filter(record =>
                    deptEmployees.some(emp => emp.id === record.employeeId)
                );

                // Calculate department-specific metrics
                const completedTasks = deptTasks.filter(task => task.status === 'completed').length;
                const taskCompletionRate = deptTasks.length > 0
                    ? Math.round((completedTasks / deptTasks.length) * 100)
                    : 0;

                const deptPresentRecords = deptAttendance.filter(record =>
                    record.status === 'present'
                ).length;
                const deptAttendanceRate = deptAttendance.length > 0
                    ? Math.round((deptPresentRecords / deptAttendance.length) * 100)
                    : 0;

                // Calculate productivity score (combination of task completion and attendance)
                const productivity = Math.round((taskCompletionRate + deptAttendanceRate) / 2);

                departmentStats.push({
                    id: manager.id,
                    name: manager.department || manager.displayName || 'Department',
                    managerId: manager.id,
                    managerName: manager.displayName || manager.email,
                    headCount: deptEmployees.length,
                    taskCompletion: taskCompletionRate,
                    attendanceRate: deptAttendanceRate,
                    productivity
                });
            }

            // Sort departments by productivity
            departmentStats.sort((a, b) => b.productivity - a.productivity);

            return {
                employeeStats: {
                    total: totalEmployees,
                    active: activeEmployees,
                    inactive: totalEmployees - activeEmployees
                },
                taskStats,
                attendanceRate,
                departmentStats
            };
        } catch (error) {
            console.error('Error fetching organization analytics:', error);
            throw new Error('Failed to fetch organization analytics');
        }
    }
};

/**
 * CEO API functions for reports
 */
export const reportApi = {
    // Get organization-wide performance report
    getPerformanceReport: async (timeframe = 'month') => {
        try {
            // Get date range based on timeframe
            const endDate = new Date();
            let startDate = new Date();

            if (timeframe === 'month') {
                startDate.setMonth(endDate.getMonth() - 1);
            } else if (timeframe === 'quarter') {
                startDate.setMonth(endDate.getMonth() - 3);
            } else if (timeframe === 'year') {
                startDate.setFullYear(endDate.getFullYear() - 1);
            }

            // Get all evaluations in the timeframe
            const evaluationsQuery = query(
                collection(db, 'evaluations'),
                where('date', '>=', Timestamp.fromDate(startDate))
            );

            const evaluationsSnapshot = await getDocs(evaluationsQuery);
            const evaluations = evaluationsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate average performance score
            const averageScore = evaluations.length > 0
                ? Math.round(evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / evaluations.length * 20)
                : 0;

            // Get employees who improved
            const employeeEvaluations = {};
            evaluations.forEach(evaluation => {
                if (!employeeEvaluations[evaluation.employeeId]) {
                    employeeEvaluations[evaluation.employeeId] = [];
                }
                employeeEvaluations[evaluation.employeeId].push(evaluation);
            });

            let improvedEmployees = 0;
            let totalEvaluatedEmployees = 0;

            for (const employeeId in employeeEvaluations) {
                const evaluations = employeeEvaluations[employeeId];
                if (evaluations.length >= 2) {
                    // Sort by date
                    evaluations.sort((a, b) => a.date.seconds - b.date.seconds);

                    const latestEval = evaluations[evaluations.length - 1];
                    const previousEval = evaluations[evaluations.length - 2];

                    if (latestEval.overallRating > previousEval.overallRating) {
                        improvedEmployees++;
                    }

                    totalEvaluatedEmployees++;
                }
            }

            // Calculate category averages
            const categories = {
                quality: 0,
                timeliness: 0,
                initiative: 0,
                collaboration: 0
            };

            let categoryCount = 0;

            evaluations.forEach(evaluation => {
                if (evaluation.categories) {
                    for (const category in categories) {
                        if (evaluation.categories[category]) {
                            categories[category] += evaluation.categories[category];
                        }
                    }
                    categoryCount++;
                }
            });

            // Calculate averages
            if (categoryCount > 0) {
                for (const category in categories) {
                    categories[category] = Math.round((categories[category] / categoryCount) * 20);
                }
            }

            return {
                averageScore,
                employeeCount: Object.keys(employeeEvaluations).length,
                improvedEmployees,
                improvementRate: totalEvaluatedEmployees > 0
                    ? Math.round((improvedEmployees / totalEvaluatedEmployees) * 100)
                    : 0,
                categoryAverages: categories
            };
        } catch (error) {
            console.error('Error generating performance report:', error);
            throw new Error('Failed to generate performance report');
        }
    },

    // Get organization-wide productivity report
    getProductivityReport: async (timeframe = 'month') => {
        try {
            // Get date range based on timeframe
            const endDate = new Date();
            let startDate = new Date();

            if (timeframe === 'month') {
                startDate.setMonth(endDate.getMonth() - 1);
            } else if (timeframe === 'quarter') {
                startDate.setMonth(endDate.getMonth() - 3);
            } else if (timeframe === 'year') {
                startDate.setFullYear(endDate.getFullYear() - 1);
            }

            // Get tasks in the timeframe
            const tasksQuery = query(
                collection(db, 'tasks'),
                where('createdAt', '>=', Timestamp.fromDate(startDate))
            );

            const tasksSnapshot = await getDocs(tasksQuery);
            const tasks = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get all employees
            const employeesQuery = query(
                collection(db, 'users'),
                where('role', '==', 'employee')
            );

            const employeesSnapshot = await getDocs(employeesQuery);
            const employees = employeesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate productivity metrics
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const completionRate = totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;

            // Calculate average completion time for tasks
            let totalCompletionTime = 0;
            let completedTasksWithTimes = 0;

            tasks.forEach(task => {
                if (task.status === 'completed' && task.completedAt && task.createdAt) {
                    const completionTime = (task.completedAt.seconds - task.createdAt.seconds) / (60 * 60); // in hours
                    totalCompletionTime += completionTime;
                    completedTasksWithTimes++;
                }
            });

            const avgCompletionTime = completedTasksWithTimes > 0
                ? Math.round(totalCompletionTime / completedTasksWithTimes)
                : 0;

            // Calculate employee-specific productivity
            const employeeProductivity = [];

            for (const employee of employees) {
                const empTasks = tasks.filter(task => task.assignedTo === employee.id);
                const empCompletedTasks = empTasks.filter(task => task.status === 'completed').length;
                const empCompletionRate = empTasks.length > 0
                    ? Math.round((empCompletedTasks / empTasks.length) * 100)
                    : 0;

                if (empTasks.length > 0) {
                    employeeProductivity.push({
                        id: employee.id,
                        name: employee.displayName || employee.email,
                        taskCount: empTasks.length,
                        completedTasks: empCompletedTasks,
                        completionRate: empCompletionRate
                    });
                }
            }

            // Sort by completion rate
            employeeProductivity.sort((a, b) => b.completionRate - a.completionRate);

            // Calculate task distribution by priority
            const priorityDistribution = {
                low: tasks.filter(task => task.priority === 'low').length,
                medium: tasks.filter(task => task.priority === 'medium').length,
                high: tasks.filter(task => task.priority === 'high').length,
                urgent: tasks.filter(task => task.priority === 'urgent').length
            };

            return {
                taskCount: totalTasks,
                completedTasks,
                completionRate,
                avgCompletionTime,
                topPerformers: employeeProductivity.slice(0, 5),
                priorityDistribution
            };
        } catch (error) {
            console.error('Error generating productivity report:', error);
            throw new Error('Failed to generate productivity report');
        }
    }
};

/**
 * Get CEO dashboard stats
 */
export const getCEODashboardStats = async () => {
    try {
        // Get employee count by role
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const roleCounts = {
            total: users.length,
            employees: users.filter(user => user.role === 'employee').length,
            managers: users.filter(user => user.role === 'manager').length,
            admins: users.filter(user => user.role === 'admin').length
        };

        // Count departments (based on unique manager IDs)
        const managerIds = new Set();
        users.forEach(user => {
            if (user.role === 'manager') {
                managerIds.add(user.id);
            }
        });

        // Get task stats
        const tasksQuery = query(collection(db, 'tasks'));
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const taskStats = {
            total: tasks.length,
            completed: tasks.filter(task => task.status === 'completed').length,
            inProgress: tasks.filter(task => task.status === 'in_progress').length,
            overdue: tasks.filter(task =>
                task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== 'completed'
            ).length
        };

        // Get current month attendance rate
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const attendanceQuery = query(
            collection(db, 'attendance'),
            where('date', '>=', Timestamp.fromDate(startOfMonth))
        );

        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendance = attendanceSnapshot.docs.map(doc => doc.data());

        const presentCount = attendance.filter(record => record.status === 'present').length;
        const attendanceRate = attendance.length > 0
            ? Math.round((presentCount / attendance.length) * 100)
            : 0;

        // Get recent activities from system logs
        const logsQuery = query(
            collection(db, 'systemLogs'),
            orderBy('timestamp', 'desc'),
            limit(5)
        );

        const logsSnapshot = await getDocs(logsQuery);
        const recentActivities = logsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                action: data.action,
                user: data.user?.email || 'System',
                timestamp: data.timestamp?.toDate() || new Date()
            };
        });

        return {
            roleCounts,
            departmentCount: managerIds.size,
            taskStats,
            attendanceRate,
            recentActivities
        };
    } catch (error) {
        console.error('Error fetching CEO dashboard stats:', error);
        throw error;
    }
};

export default {
    analytics: analyticsApi,
    reports: reportApi,
    getDashboardStats: getCEODashboardStats
};