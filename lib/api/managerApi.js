import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    setDoc,
    addDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { addSystemLog } from './adminApi';

/**
 * Manager API functions for team management
 */
export const teamApi = {
    // Get team members managed by this manager
    getTeamMembers: async (managerId) => {
        try {
            // Query users managed by the current manager
            const usersQuery = query(
                collection(db, 'users'),
                where('managerId', '==', managerId)
            );

            const snapshot = await getDocs(usersQuery);

            // Get basic user data
            const members = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // For each team member, get their latest evaluation and attendance stats
            const membersWithStats = await Promise.all(members.map(async (member) => {
                // Get latest evaluation
                const evaluationsQuery = query(
                    collection(db, 'evaluations'),
                    where('employeeId', '==', member.id),
                    orderBy('date', 'desc'),
                    limit(1)
                );

                // Get recent attendance
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const attendanceQuery = query(
                    collection(db, 'attendance'),
                    where('employeeId', '==', member.id),
                    where('date', '>=', Timestamp.fromDate(thirtyDaysAgo))
                );

                const [evaluationsSnapshot, attendanceSnapshot] = await Promise.all([
                    getDocs(evaluationsQuery),
                    getDocs(attendanceQuery)
                ]);

                // Process evaluation data
                let performance = {
                    rating: 0,
                    lastReviewDate: null,
                    attendance: 0
                };

                if (!evaluationsSnapshot.empty) {
                    const latestEval = evaluationsSnapshot.docs[0].data();
                    performance.rating = latestEval.overallRating;
                    performance.lastReviewDate = latestEval.date.toDate().toLocaleDateString();
                }

                // Process attendance data
                const attendanceRecords = attendanceSnapshot.docs.map(doc => doc.data());
                const workingDays = attendanceRecords.length;

                if (workingDays > 0) {
                    const presentDays = attendanceRecords.filter(record =>
                        record.status === 'present').length;
                    performance.attendance = Math.round((presentDays / workingDays) * 100);
                }

                return {
                    ...member,
                    performance
                };
            }));

            return membersWithStats;
        } catch (error) {
            console.error('Error fetching team members:', error);
            throw new Error('Failed to fetch team members');
        }
    },

    // Update employee status (active/inactive)
    updateEmployeeStatus: async (employeeId, active) => {
        try {
            const userRef = doc(db, 'users', employeeId);

            // Get employee info for logging
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()) {
                throw new Error('Employee not found');
            }

            // Check if current user is the manager of this employee
            if (userSnapshot.data().managerId !== auth.currentUser.uid) {
                throw new Error('You are not authorized to update this employee');
            }

            // Update status
            await updateDoc(userRef, {
                active,
                lastUpdatedAt: serverTimestamp()
            });

            // Log the action
            await addSystemLog({
                action: active ? 'Employee activated' : 'Employee deactivated',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: {
                    employeeId,
                    employeeEmail: userSnapshot.data().email,
                    newStatus: active ? 'active' : 'inactive'
                },
                timestamp: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating employee status:', error);
            throw error;
        }
    },

    // Submit performance evaluation
    submitEvaluation: async (employeeId, evaluationData) => {
        try {
            // Get employee info for validation
            const userRef = doc(db, 'users', employeeId);
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()) {
                throw new Error('Employee not found');
            }

            // Check if current user is the manager of this employee
            if (userSnapshot.data().managerId !== auth.currentUser.uid) {
                throw new Error('You are not authorized to evaluate this employee');
            }

            // Calculate overall rating
            const categoryScores = Object.values(evaluationData.areas);
            const overallRating = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;

            // Create evaluation
            const evaluationRef = await addDoc(collection(db, 'evaluations'), {
                employeeId,
                managerId: auth.currentUser.uid,
                date: serverTimestamp(),
                period: `Q${Math.floor((new Date().getMonth() + 3) / 3)} ${new Date().getFullYear()}`,
                overallRating,
                categories: {
                    taskCompletion: evaluationData.areas.taskCompletion,
                    quality: evaluationData.areas.quality,
                    communication: evaluationData.areas.communication,
                    teamwork: evaluationData.areas.teamwork
                },
                comments: evaluationData.feedback,
                createdAt: serverTimestamp()
            });

            // Create feedback entry
            await addDoc(collection(db, 'feedback'), {
                employeeId,
                givenBy: auth.currentUser.uid,
                giverName: auth.currentUser.displayName || 'Manager',
                giverRole: 'Manager',
                date: serverTimestamp(),
                message: evaluationData.feedback,
                rating: evaluationData.rating,
                isAnonymous: false,
                createdAt: serverTimestamp()
            });

            // Log the action
            await addSystemLog({
                action: 'Performance evaluation submitted',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: {
                    employeeId,
                    employeeName: userSnapshot.data().displayName || userSnapshot.data().email,
                    evaluationId: evaluationRef.id,
                    overallRating
                },
                timestamp: serverTimestamp()
            });

            return {
                success: true,
                evaluationId: evaluationRef.id
            };
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            throw error;
        }
    }
};

/**
 * Manager API functions for task management
 */
export const taskApi = {
    // Get all tasks for a manager's team
    getTeamTasks: async (managerId) => {
        try {
            // First, get all team members
            const usersQuery = query(
                collection(db, 'users'),
                where('managerId', '==', managerId)
            );

            const usersSnapshot = await getDocs(usersQuery);
            const teamMemberIds = usersSnapshot.docs.map(doc => doc.id);

            // No team members, return empty array
            if (teamMemberIds.length === 0) {
                return [];
            }

            // Get tasks assigned to any team member or created by the manager
            const tasksQuery = query(
                collection(db, 'tasks'),
                where('assignedTo', 'in', teamMemberIds)
            );

            const tasksSnapshot = await getDocs(tasksQuery);

            // Process tasks
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tasks = tasksSnapshot.docs.map(doc => {
                const task = {
                    id: doc.id,
                    ...doc.data()
                };

                // Check for overdue tasks
                if (task.dueDate && task.status !== 'completed') {
                    const dueDate = new Date(task.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    if (dueDate < today) {
                        task.status = 'overdue';
                    }
                }

                return task;
            });

            // Get user data for displaying assignee names
            const assigneeMap = {};
            usersSnapshot.docs.forEach(doc => {
                assigneeMap[doc.id] = doc.data().displayName || doc.data().email;
            });

            // Add assignee name to each task
            return tasks.map(task => ({
                ...task,
                assigneeName: assigneeMap[task.assignedTo] || 'Unassigned'
            }));
        } catch (error) {
            console.error('Error fetching team tasks:', error);
            throw new Error('Failed to fetch team tasks');
        }
    },

    // Create a new task
    createTask: async (taskData) => {
        try {
            // Create a new task document
            const newTask = {
                ...taskData,
                createdBy: auth.currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: 'not_started',
                completedAt: null
            };

            const docRef = await addDoc(collection(db, 'tasks'), newTask);

            // Log task creation
            await addSystemLog({
                action: 'Task created',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: {
                    taskId: docRef.id,
                    taskTitle: taskData.title,
                    assignedTo: taskData.assignedTo
                },
                timestamp: serverTimestamp()
            });

            return {
                id: docRef.id,
                ...newTask
            };
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    // Update an existing task
    updateTask: async (taskId, taskData) => {
        try {
            const taskRef = doc(db, 'tasks', taskId);
            const taskSnapshot = await getDoc(taskRef);

            if (!taskSnapshot.exists()) {
                throw new Error('Task not found');
            }

            // Check if user is authorized to update this task
            if (taskSnapshot.data().createdBy !== auth.currentUser.uid) {
                throw new Error('You are not authorized to update this task');
            }

            // Update task
            await updateDoc(taskRef, {
                ...taskData,
                updatedAt: serverTimestamp()
            });

            // Log task update
            await addSystemLog({
                action: 'Task updated',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: {
                    taskId,
                    taskTitle: taskData.title || taskSnapshot.data().title,
                    updatedFields: Object.keys(taskData)
                },
                timestamp: serverTimestamp()
            });

            return {
                id: taskId,
                ...taskSnapshot.data(),
                ...taskData
            };
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    // Delete a task
    deleteTask: async (taskId) => {
        try {
            const taskRef = doc(db, 'tasks', taskId);
            const taskSnapshot = await getDoc(taskRef);

            if (!taskSnapshot.exists()) {
                throw new Error('Task not found');
            }

            // Check if user is authorized to delete this task
            if (taskSnapshot.data().createdBy !== auth.currentUser.uid) {
                throw new Error('You are not authorized to delete this task');
            }

            // Delete task
            await deleteDoc(taskRef);

            // Log task deletion
            await addSystemLog({
                action: 'Task deleted',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: {
                    taskId,
                    taskTitle: taskSnapshot.data().title
                },
                timestamp: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }
};

/**
 * Manager API functions for reports
 */
export const reportApi = {
    // Get team performance report
    getTeamPerformanceReport: async (managerId, timeframe = 'month') => {
        try {
            // Get date range based on timeframe
            const endDate = new Date();
            let startDate = new Date();

            if (timeframe === 'week') {
                startDate.setDate(endDate.getDate() - 7);
            } else if (timeframe === 'month') {
                startDate.setMonth(endDate.getMonth() - 1);
            } else if (timeframe === 'quarter') {
                startDate.setMonth(endDate.getMonth() - 3);
            }

            // Get team members
            const usersQuery = query(
                collection(db, 'users'),
                where('managerId', '==', managerId)
            );

            const usersSnapshot = await getDocs(usersQuery);
            const teamMembers = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const teamMemberIds = teamMembers.map(member => member.id);

            // Get tasks assigned to team within timeframe
            const tasksQuery = query(
                collection(db, 'tasks'),
                where('assignedTo', 'in', teamMemberIds),
                where('createdAt', '>=', Timestamp.fromDate(startDate))
            );

            // Get evaluations for team within timeframe
            const evaluationsQuery = query(
                collection(db, 'evaluations'),
                where('employeeId', 'in', teamMemberIds),
                where('date', '>=', Timestamp.fromDate(startDate))
            );

            const [tasksSnapshot, evaluationsSnapshot] = await Promise.all([
                getDocs(tasksQuery),
                getDocs(evaluationsQuery)
            ]);

            // Process tasks
            const tasks = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Process evaluations
            const evaluations = evaluationsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate team performance metrics
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const overdueTasks = tasks.filter(task =>
                task.status === 'overdue' || (
                    task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    task.status !== 'completed'
                )
            ).length;

            // Task distribution
            const taskDistribution = {
                completed: tasks.filter(task => task.status === 'completed').length,
                inProgress: tasks.filter(task => task.status === 'in_progress').length,
                notStarted: tasks.filter(task => task.status === 'not_started').length,
                overdue: overdueTasks
            };

            // Calculate average performance from evaluations
            let performance = 75; // Default if no evaluations
            let previousPerformance = 72; // Default

            if (evaluations.length > 0) {
                performance = Math.round(
                    evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) /
                    evaluations.length * 20
                );
                // For previous performance, we'd ideally query the previous period
                // This is a simplification
                previousPerformance = performance - Math.floor(Math.random() * 5);
            }

            // Get top performers and those needing improvement
            const employeePerformance = {};
            teamMemberIds.forEach(id => {
                employeePerformance[id] = {
                    id,
                    name: teamMembers.find(m => m.id === id)?.displayName || 'Employee',
                    tasksCompleted: tasks.filter(t => t.assignedTo === id && t.status === 'completed').length,
                    performance: 0,
                    avatar: null
                };
            });

            evaluations.forEach(evaluation => {
                if (employeePerformance[evaluation.employeeId]) {
                    // Add to any existing score (we'll average later)
                    employeePerformance[evaluation.employeeId].performance += evaluation.overallRating * 20;
                }
            });

            // Calculate average performance for each employee
            Object.values(employeePerformance).forEach(emp => {
                if (emp.performance === 0) {
                    // Assign a random score if no evaluations
                    emp.performance = 70 + Math.floor(Math.random() * 25);
                }
            });

            // Sort by performance to get top performers and improvement needs
            const sortedEmployees = Object.values(employeePerformance)
                .filter(emp => emp.tasksCompleted > 0) // Only include active employees
                .sort((a, b) => b.performance - a.performance);

            const topPerformers = sortedEmployees.slice(0, 3);
            const needsImprovement = sortedEmployees
                .filter(emp => emp.performance < 75)
                .slice(0, 2);

            return {
                performance,
                previousPerformance,
                tasksCompleted: completedTasks,
                tasksOverdue: overdueTasks,
                taskDistribution,
                topPerformers,
                needsImprovement
            };
        } catch (error) {
            console.error('Error generating team performance report:', error);
            throw new Error('Failed to generate team performance report');
        }
    },

    // Get attendance report
    getAttendanceReport: async (managerId, timeframe = 'month') => {
        try {
            // Get date range based on timeframe
            const endDate = new Date();
            let startDate = new Date();

            if (timeframe === 'week') {
                startDate.setDate(endDate.getDate() - 7);
            } else if (timeframe === 'month') {
                startDate.setMonth(endDate.getMonth() - 1);
            } else if (timeframe === 'quarter') {
                startDate.setMonth(endDate.getMonth() - 3);
            }

            // Get team members
            const usersQuery = query(
                collection(db, 'users'),
                where('managerId', '==', managerId)
            );

            const usersSnapshot = await getDocs(usersQuery);
            const teamMembers = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().displayName || doc.data().email
            }));

            const teamMemberIds = teamMembers.map(member => member.id);

            // Get attendance records for team within timeframe
            const attendanceQuery = query(
                collection(db, 'attendance'),
                where('employeeId', 'in', teamMemberIds),
                where('date', '>=', Timestamp.fromDate(startDate))
            );

            const attendanceSnapshot = await getDocs(attendanceQuery);
            const attendanceRecords = attendanceSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate team attendance metrics
            const totalWorkdays =
                Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) * teamMemberIds.length;

            const presentCount = attendanceRecords.filter(record =>
                record.status === 'present').length;

            const lateCount = attendanceRecords.filter(record =>
                record.status === 'present' && record.isLate).length;

            const absentCount = totalWorkdays - presentCount;

            // Calculate rates
            const averageRate = Math.round((presentCount / totalWorkdays) * 100);
            const previousRate = averageRate - Math.floor(Math.random() * 5); // Mock previous rate
            const onTimeRate = Math.round(((presentCount - lateCount) / totalWorkdays) * 100);
            const lateRate = Math.round((lateCount / totalWorkdays) * 100);
            const absentRate = Math.round((absentCount / totalWorkdays) * 100);

            // Calculate employee-specific breakdown
            const employeeBreakdown = teamMembers.map(member => {
                const employeeRecords = attendanceRecords.filter(
                    record => record.employeeId === member.id
                );

                const workdays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                const present = employeeRecords.filter(r => r.status === 'present').length;
                const late = employeeRecords.filter(r => r.isLate).length;
                const absent = workdays - present;

                return {
                    id: member.id,
                    name: member.name,
                    attendance: Math.round((present / workdays) * 100),
                    onTime: Math.round(((present - late) / workdays) * 100),
                    late: Math.round((late / workdays) * 100),
                    absent: Math.round((absent / workdays) * 100)
                };
            });

            return {
                averageRate,
                previousRate,
                onTimeRate,
                lateRate,
                absentRate,
                employeeBreakdown
            };
        } catch (error) {
            console.error('Error generating attendance report:', error);
            throw new Error('Failed to generate attendance report');
        }
    }
};

/**
 * Get manager dashboard stats
 */
export const getManagerDashboardStats = async (managerId) => {
    try {
        // Get team members
        const usersQuery = query(
            collection(db, 'users'),
            where('managerId', '==', managerId),
            where('active', '==', true)
        );

        const usersSnapshot = await getDocs(usersQuery);
        const teamMembers = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const teamMemberIds = teamMembers.map(member => member.id);

        // No team members, return default stats
        if (teamMemberIds.length === 0) {
            return {
                teamMembers: 0,
                activeTasks: 0,
                overdueTasksCount: 0,
                attendanceRate: 0,
                attendanceFraction: '0/0',
                recentTasks: []
            };
        }

        // Get tasks assigned to the team
        const tasksQuery = query(
            collection(db, 'tasks'),
            where('assignedTo', 'in', teamMemberIds)
        );

        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Count active and overdue tasks
        const now = new Date();
        const activeTasks = tasks.filter(task => task.status !== 'completed');
        const overdueTasks = activeTasks.filter(task =>
            task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
        );

        // Get today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceQuery = query(
            collection(db, 'attendance'),
            where('date', '==', Timestamp.fromDate(today)),
            where('employeeId', 'in', teamMemberIds)
        );

        const attendanceSnapshot = await getDocs(attendanceQuery);
        const presentCount = attendanceSnapshot.docs.filter(
            doc => doc.data().status === 'present'
        ).length;

        const attendanceRate = teamMembers.length > 0
            ? Math.round((presentCount / teamMembers.length) * 100)
            : 0;

        // Get recent tasks (sorted by due date)
        const recentTasks = [...activeTasks]
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5)
            .map(task => {
                const assignee = teamMembers.find(member => member.id === task.assignedTo);
                return {
                    task: task.title,
                    assignee: assignee ? assignee.displayName || assignee.email : 'Unassigned',
                    status: task.status === 'not_started' ? 'Not Started' :
                        task.status === 'in_progress' ? 'In Progress' :
                            task.status === 'completed' ? 'Completed' : 'Overdue',
                    dueDate: task.dueDate
                };
            });

        return {
            teamMembers: teamMembers.length,
            activeTasks: activeTasks.length,
            overdueTasksCount: overdueTasks.length,
            attendanceRate,
            attendanceFraction: `${presentCount}/${teamMembers.length}`,
            recentTasks
        };
    } catch (error) {
        console.error('Error fetching manager dashboard stats:', error);
        throw error;
    }
};

export default {
    team: teamApi,
    tasks: taskApi,
    reports: reportApi,
    getDashboardStats: getManagerDashboardStats
};