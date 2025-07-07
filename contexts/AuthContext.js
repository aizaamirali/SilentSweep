'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to login with email and password
    async function login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Fetch user role and set it
            await fetchUserRole(userCredential.user.uid);
            return userCredential;
        } catch (error) {
            throw error;
        }
    }

    // Function to register a new user
    async function register(email, password, displayName, role = 'employee') {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with display name
            await updateProfile(user, { displayName });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email,
                displayName,
                role,
                createdAt: new Date().toISOString(),
                active: true
            });

            setUserRole(role);
            return userCredential;
        } catch (error) {
            throw error;
        }
    }

    // Function to fetch user role from Firestore
    async function fetchUserRole(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserRole(userData.role || 'employee'); // Default to employee if no role is found
            } else {
                // If user document doesn't exist, set a default role
                setUserRole('employee');
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole('employee'); // Default to employee on error
        }
    }

    // Function to logout
    function logout() {
        setUserRole(null);
        return signOut(auth);
    }

    // Function to reset password
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserRole(user.uid);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        login,
        register,
        logout,
        resetPassword,
        fetchUserRole
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}