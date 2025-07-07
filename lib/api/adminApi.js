import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    updateEmail,
    updatePassword,
    getAuth
} from 'firebase/auth';
import { db, auth } from '@/lib/firebase';

/**
 * Admin API functions for user management
 */
export const userManagementApi = {
    // Get all users
    getAllUsers: async () => {
        try {
            const usersCollection = collection(db, 'users');
            const snapshot = await getDocs(usersCollection);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Failed to fetch users');
        }
    },

    // Get user by ID
    getUserById: async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                throw new Error('User not found');
            }

            return {
                id: userSnap.id,
                ...userSnap.data()
            };
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Create new user
    createUser: async (userData) => {
        try {
            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                userData.email,
                userData.password
            );

            const user = userCredential.user;

            // Remove password from the data stored in Firestore
            const { password, ...userDataForFirestore } = userData;

            // Add user data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                ...userDataForFirestore,
                active: true,
                createdAt: serverTimestamp(),
                lastUpdatedAt: serverTimestamp()
            });

            // Log the action in system logs
            await addSystemLog({
                action: 'User created',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: { createdUserEmail: userData.email, role: userData.role },
                timestamp: serverTimestamp()
            });

            return {
                id: user.uid,
                ...userDataForFirestore
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Update user
    updateUser: async (userId, userData) => {
        try {
            const userRef = doc(db, 'users', userId);

            // Get current user data for logging changes
            const beforeUpdate = await getDoc(userRef);

            // Update user in Firestore
            await updateDoc(userRef, {
                ...userData,
                lastUpdatedAt: serverTimestamp()
            });

            // Log the action
            await addSystemLog({
                action: 'User updated',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: {
                    updatedUserId: userId,
                    updatedFields: Object.keys(userData),
                    previousRole: beforeUpdate.exists() ? beforeUpdate.data().role : null,
                    newRole: userData.role
                },
                timestamp: serverTimestamp()
            });

            return {
                id: userId,
                ...userData
            };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Deactivate user
    deactivateUser: async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);

            // Get user info for logging
            const userSnap = await getDoc(userRef);

            // Update user's active status
            await updateDoc(userRef, {
                active: false,
                lastUpdatedAt: serverTimestamp()
            });

            // Log the action
            await addSystemLog({
                action: 'User deactivated',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: {
                    deactivatedUserId: userId,
                    deactivatedUserEmail: userSnap.exists() ? userSnap.data().email : 'Unknown'
                },
                timestamp: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw error;
        }
    },

    // Reactivate user
    reactivateUser: async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);

            // Get user info for logging
            const userSnap = await getDoc(userRef);

            // Update user's active status
            await updateDoc(userRef, {
                active: true,
                lastUpdatedAt: serverTimestamp()
            });

            // Log the action
            await addSystemLog({
                action: 'User reactivated',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: {
                    reactivatedUserId: userId,
                    reactivatedUserEmail: userSnap.exists() ? userSnap.data().email : 'Unknown'
                },
                timestamp: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error reactivating user:', error);
            throw error;
        }
    }
};

/**
 * Admin API functions for system settings
 */
export const systemSettingsApi = {
    // Get system settings
    getSystemSettings: async () => {
        try {
            const settingsRef = doc(db, 'systemSettings', 'general');
            const settingsSnap = await getDoc(settingsRef);

            if (settingsSnap.exists()) {
                return settingsSnap.data();
            } else {
                // Default settings
                const defaultSettings = {
                    systemName: 'Innovatech EMMS',
                    notificationsEnabled: true,
                    logRetentionDays: 30,
                    maintenanceMode: false,
                    allowUserRegistration: false,
                    emailNotifications: true,
                    taskReminders: true,
                    theme: 'light',
                    timezone: 'UTC',
                    lastUpdatedAt: serverTimestamp()
                };

                // Create default settings in Firestore
                await setDoc(settingsRef, defaultSettings);

                return defaultSettings;
            }
        } catch (error) {
            console.error('Error fetching system settings:', error);
            throw error;
        }
    },

    // Update system settings
    updateSystemSettings: async (settingsData) => {
        try {
            const settingsRef = doc(db, 'systemSettings', 'general');

            // Get current settings for logging changes
            const beforeUpdate = await getDoc(settingsRef);

            // Update settings
            await updateDoc(settingsRef, {
                ...settingsData,
                lastUpdatedAt: serverTimestamp()
            });

            // Log the action
            await addSystemLog({
                action: 'System settings updated',
                user: { id: auth.currentUser.uid, email: auth.currentUser.email },
                details: {
                    updatedFields: Object.keys(settingsData),
                    previousSettings: beforeUpdate.exists() ? beforeUpdate.data() : null
                },
                timestamp: serverTimestamp()
            });

            return {
                ...settingsData
            };
        } catch (error) {
            console.error('Error updating system settings:', error);
            throw error;
        }
    }
};

/**
 * Admin API functions for system logs
 */
export const systemLogsApi = {
    // Get recent system logs
    getRecentLogs: async (limitCount = 10) => {
        try {
            const logsQuery = query(
                collection(db, 'systemLogs'),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const logsSnapshot = await getDocs(logsQuery);

            return logsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || null
            }));
        } catch (error) {
            console.error('Error fetching system logs:', error);
            throw error;
        }
    },  // Added missing comma here

    // Get filtered logs
    getFilteredLogs: async (filters, maxResults = 100) => {
        try {
            let logsQuery = query(
                collection(db, 'systemLogs'),
                orderBy('timestamp', 'desc')
            );

            // Apply filters if provided
            if (filters.action) {
                logsQuery = query(logsQuery, where('action', '==', filters.action));
            }

            if (filters.userId) {
                logsQuery = query(logsQuery, where('user.id', '==', filters.userId));
            }

            if (filters.startDate && filters.endDate) {
                logsQuery = query(
                    logsQuery,
                    where('timestamp', '>=', filters.startDate),
                    where('timestamp', '<=', filters.endDate)
                );
            }

            logsQuery = query(logsQuery, limit(maxResults));

            const logsSnapshot = await getDocs(logsQuery);

            return logsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || null
            }));
        } catch (error) {
            console.error('Error fetching filtered logs:', error);
            throw error;
        }
    }
};

/**
 * Add a new system log entry
 */
export const addSystemLog = async (logData) => {
    try {
        const logsCollection = collection(db, 'systemLogs');
        await setDoc(doc(logsCollection), {
            ...logData,
            timestamp: logData.timestamp || serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding system log:', error);
        // Don't throw - logging should not interrupt normal operation
    }
};

/**
 * Get admin dashboard stats
 */
export const getAdminDashboardStats = async () => {
    try {
        // Fetch user statistics
        const usersQuery = collection(db, 'users');
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;
        const activeUsers = usersSnapshot.docs.filter(doc => doc.data().active).length;

        // Fetch recent system logs
        const logsQuery = query(
            collection(db, 'systemLogs'),
            orderBy('timestamp', 'desc'),
            limit(5)
        );
        const logsSnapshot = await getDocs(logsQuery);

        // Get role counts
        const roleCounts = {
            admin: 0,
            manager: 0,
            employee: 0,
            ceo: 0
        };

        usersSnapshot.docs.forEach(doc => {
            const role = doc.data().role;
            if (roleCounts.hasOwnProperty(role)) {
                roleCounts[role]++;
            }
        });

        return {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            logEvents: logsSnapshot.size,
            pendingUpdates: 0, // Placeholder for future feature
            roleCounts
        };
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        throw error;
    }
};

export default {
    users: userManagementApi,
    settings: systemSettingsApi,
    logs: systemLogsApi,
    getDashboardStats: getAdminDashboardStats,
    addSystemLog: addSystemLog  // Add this line
};