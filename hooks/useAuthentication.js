import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthentication() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register, forgotPassword, userRole } = useAuth();
    const router = useRouter();

    const handleLogin = async (email, password) => {
        setLoading(true);
        setError('');

        try {
            const userCredential = await login(email, password);
            const user = userCredential.user;

            // Get the user's role and redirect accordingly
            // The role should be available from the login function result
            // or from the userRole in the auth context
            const role = userRole;

            if (role) {
                // Redirect based on role
                router.push(`/dashboard/${role.toLowerCase()}`);
            } else {
                // Fallback to employee dashboard if role is not available for some reason
                router.push('/dashboard/employee');
            }

            return user;
        } catch (err) {
            let errorMessage = 'Failed to sign in. Please check your credentials.';

            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Too many sign-in attempts. Please try again later.';
            } else if (err.code === 'auth/user-disabled') {
                errorMessage = 'This account has been disabled. Please contact support.';
            }

            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (email) => {
        setLoading(true);
        setError('');

        try {
            await forgotPassword(email);
            return true;
        } catch (err) {
            let errorMessage = 'Failed to send password reset email.';

            if (err.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }

            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        error,
        loading,
        handleLogin,
        handlePasswordReset
    };
}