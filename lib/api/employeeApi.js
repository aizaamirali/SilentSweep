import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    setDoc, 
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
 * Employee API functions for tasks
 */
export const taskApi = {
    // Get tasks assigned to the employee
    getMyTasks: async (userId) => {
        try {
            // Query tasks assigned to the current user
            const tasksQuery = query(
                collection(db, 'tasks'),
                where('assignedTo', '==', userId),
                orderBy('dueDate', 'asc')
            );
            
            const snapshot = await getDocs(tasksQuery);
            
            // Process tasks (e.g., check for overdue status)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return snapshot.docs.map(doc => {
                const task = {
                    id: doc.id,
                    ...doc.data(),
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
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw new Error('Failed to fetch tasks');
        }
    },
    
    // Update task status
    updateTaskStatus: async (taskId, newStatus) => {
        try {
            const taskRef = doc(db, 'tasks', taskId);
            const taskDoc = await getDoc(taskRef);
            
            if (!taskDoc.exists()) {
                throw new Error('Task not found');
            }
            
            // Check if the user is the assignee
            if (taskDoc.data().assignedTo !== auth.currentUser.uid) {
                throw new Error('You are not authorized to update this task');
            }
            
            await updateDoc(taskRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            
            if (newStatus === 'completed') {
                await updateDoc(taskRef, {
                    completedAt: serverTimestamp()
                });
            }
            
            // Log task status update
            await addSystemLog({
                action: 'Task status updated',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: { 
                    taskId,
                    taskTitle: taskDoc.data().title,
                    previousStatus: taskDoc.data().status,
                    newStatus 
                },
                timestamp: serverTimestamp()
            });
            
            return {
                id: taskId,
                status: newStatus
            };
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    }
};

/**
 * Employee API functions for attendance
 */
export const attendanceApi = {
    // Record clock in/out
    clockInOut: async () => {
        try {
            const userId = auth.currentUser.uid;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check if there's already an attendance record for today
            const attendanceQuery = query(
                collection(db, 'attendance'),
                where('employeeId', '==', userId),
                where('date', '==', Timestamp.fromDate(today))
            );
            
            const attendanceSnapshot = await getDocs(attendanceQuery);
            
            const now = new Date();
            // Configuration for work hours (could be moved to system settings)
            const workStartHour = 9; // 9:00 AM
            const isLate = now.getHours() > workStartHour || 
                          (now.getHours() === workStartHour && now.getMinutes() > 0);
            
            if (attendanceSnapshot.empty) {
                // No record found, create a new one (clock in)
                const attendanceRef = doc(collection(db, 'attendance'));
                await setDoc(attendanceRef, {
                    employeeId: userId,
                    date: Timestamp.fromDate(today),
                    status: 'present',
                    clockIn: serverTimestamp(),
                    clockOut: null,
                    isLate,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                
                await addSystemLog({
                    action: 'Employee clocked in',
                    user: { id: userId, email: auth.currentUser.email },
                    details: { isLate },
                    timestamp: serverTimestamp()
                });
                
                return { action: 'clockIn', isLate };
            } else {
                // Record exists, update it (clock out)
                const attendanceDoc = attendanceSnapshot.docs[0];
                
                if (attendanceDoc.data().clockOut) {
                    throw new Error('You have already clocked out for today');
                }
                
                await updateDoc(doc(db, 'attendance', attendanceDoc.id), {
                    clockOut: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                
                await addSystemLog({
                    action: 'Employee clocked out',
                    user: { id: userId, email: auth.currentUser.email },
                    timestamp: serverTimestamp()
                });
                
                return { action: 'clockOut' };
            }
        } catch (error) {
            console.error('Error recording attendance:', error);
            throw error;
        }
    },
    
    // Get monthly attendance records
    getMonthlyAttendance: async (userId, year, month) => {
        try {
            // Create start and end dates for the month
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            
            const attendanceQuery = query(
                collection(db, 'attendance'),
                where('employeeId', '==', userId),
                where('date', '>=', Timestamp.fromDate(startDate)),
                where('date', '<=', Timestamp.fromDate(endDate)),
                orderBy('date', 'asc')
            );
            
            const snapshot = await getDocs(attendanceQuery);
            
            // Format attendance records
            return snapshot.docs.map(doc => {
                const data = doc.data();
                const date = data.date.toDate();
                const clockIn = data.clockIn?.toDate() || null;
                const clockOut = data.clockOut?.toDate() || null;
                
                return {
                    id: doc.id,
                    date: date.toISOString().split('T')[0],
                    dayOfWeek: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
                    status: data.status,
                    isLate: data.isLate || false,
                    clockIn: clockIn ? new Intl.DateTimeFormat('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                    }).format(clockIn) : null,
                    clockOut: clockOut ? new Intl.DateTimeFormat('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                    }).format(clockOut) : null
                };
            });
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            throw new Error('Failed to fetch attendance records');
        }
    },
    
    // Get attendance statistics
    getAttendanceStats: async (userId) => {
        try {
            // Get records for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const attendanceQuery = query(
                collection(db, 'attendance'),
                where('employeeId', '==', userId),
                where('date', '>=', Timestamp.fromDate(thirtyDaysAgo)),
                orderBy('date', 'desc')
            );
            
            const snapshot = await getDocs(attendanceQuery);
            const records = snapshot.docs.map(doc => doc.data());
            
            // Calculate stats
            const present = records.filter(record => record.status === 'present').length;
            const absent = records.filter(record => record.status === 'absent').length;
            const late = records.filter(record => record.isLate).length;
            const onTime = present - late;
            
            return {
                present,
                absent,
                late,
                onTime
            };
        } catch (error) {
            console.error('Error calculating attendance stats:', error);
            throw new Error('Failed to calculate attendance statistics');
        }
    }
};

/**
 * Employee API functions for performance
 */
export const performanceApi = {
    // Get performance data
    getPerformanceData: async (userId) => {
        try {
            // Get the latest evaluation
            const evaluationsQuery = query(
                collection(db, 'evaluations'),
                where('employeeId', '==', userId),
                orderBy('date', 'desc'),
                limit(1)
            );
            
            // Get recent feedback
            const feedbackQuery = query(
                collection(db, 'feedback'),
                where('employeeId', '==', userId),
                orderBy('date', 'desc'),
                limit(5)
            );
            
            // Get historical evaluations for trends
            const historicalQuery = query(
                collection(db, 'evaluations'),
                where('employeeId', '==', userId),
                orderBy('date', 'desc'),
                limit(6)
            );
            
            const [evaluationsSnapshot, feedbackSnapshot, historicalSnapshot] = await Promise.all([
                getDocs(evaluationsQuery),
                getDocs(feedbackQuery),
                getDocs(historicalQuery)
            ]);
            
            // Process latest evaluation
            let overallScore = 0;
            let categories = [];
            let trend = "+0%";
            
            if (!evaluationsSnapshot.empty) {
                const latestEval = evaluationsSnapshot.docs[0].data();
                overallScore = latestEval.overallRating * 20; // Convert 1-5 scale to percentage
                
                categories = Object.entries(latestEval.categories || {}).map(([name, score]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    score: Math.round(score * 20), // Convert to percentage
                    trend: "+2%" // Placeholder - would calculate from historical data
                }));
            }
            
            // Process feedback
            const recentFeedback = feedbackSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    from: data.giverName || 'Anonymous',
                    role: data.giverRole || 'Team Member',
                    date: data.date.toDate().toISOString(),
                    message: data.message,
                    rating: data.rating
                };
            });
            
            // Process historical data for trends
            const monthlyScores = historicalSnapshot.docs.map(doc => {
                const data = doc.data();
                const date = data.date.toDate();
                return {
                    month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
                    score: Math.round(data.overallRating * 20) // Convert to percentage
                };
            }).reverse(); // Chronological order
            
            // Calculate trend
            if (monthlyScores.length >= 2) {
                const currentScore = monthlyScores[monthlyScores.length - 1].score;
                const previousScore = monthlyScores[monthlyScores.length - 2].score;
                const difference = currentScore - previousScore;
                trend = (difference >= 0 ? "+" : "") + difference + "%";
            }
            
            return {
                overallScore,
                trend,
                categories: categories.length > 0 ? categories : [
                    { name: 'Task Completion', score: 90, trend: '+2%' },
                    { name: 'Quality of Work', score: 85, trend: '+5%' },
                    { name: 'Timeliness', score: 88, trend: '+1%' },
                    { name: 'Collaboration', score: 92, trend: '+3%' }
                ],
                monthlyScores: monthlyScores.length > 0 ? monthlyScores : [
                    { month: 'Jan', score: 85 },
                    { month: 'Feb', score: 87 },
                    { month: 'Mar', score: 86 },
                    { month: 'Apr', score: 88 },
                    { month: 'May', score: 90 },
                    { month: 'Jun', score: 92 }
                ],
                recentFeedback
            };
        } catch (error) {
            console.error('Error fetching performance data:', error);
            throw new Error('Failed to fetch performance data');
        }
    }
};

/**
 * Get employee dashboard stats
 */
export const getEmployeeDashboardStats = async (userId) => {
    try {
        // Get task statistics
        const tasksQuery = query(
            collection(db, 'tasks'),
            where('assignedTo', '==', userId)
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Process task data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueToday = tasks.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime() && task.status !== 'completed';
        }).length;
        
        const completed = tasks.filter(task => task.status === 'completed').length;
        const inProgress = tasks.filter(task => task.status === 'in_progress').length;
        const notStarted = tasks.filter(task => task.status === 'not_started').length;
        const overdue = tasks.filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            return new Date(task.dueDate) < today;
        }).length;
        
        // Calculate completion rate
        const completionRate = tasks.length > 0 
            ? Math.round((completed / tasks.length) * 100) 
            : 0;
        
        // Format recent tasks for display
        const recentTasks = tasks
            .filter(task => task.status !== 'completed')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5)
            .map(task => {
                const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                let dueText = 'No due date';
                
                if (dueDate) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    if (dueDate < today) {
                        dueText = `Overdue by ${Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))} days`;
                    } else if (dueDate.getTime() === today.getTime()) {
                        dueText = 'Due today';
                    } else if (dueDate.getTime() === tomorrow.getTime()) {
                        dueText = 'Due tomorrow';
                    } else {
                        dueText = `Due in ${Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))} days`;
                    }
                }
                
                return {
                    id: task.id,
                    title: task.title,
                    status: task.status,
                    dueText
                };
            });
        
        return {
            tasksDueToday: dueToday,
            tasksCompleted: completed,
            taskCompletion: completionRate,
            tasksOverdue: overdue,
            recentTasks
        };
    } catch (error) {
        console.error('Error fetching employee dashboard stats:', error);
        throw error;
    }
};

export default {
    tasks: taskApi,
    attendance: attendanceApi,
    performance: performanceApi,
    getDashboardStats: getEmployeeDashboardStats
};