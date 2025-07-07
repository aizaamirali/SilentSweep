'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
    HomeIcon,
    UsersIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { currentUser, userRole, loading, logout } = useAuth();

    // Protect admin routes
    useEffect(() => {
        if (!loading) {
            // If not logged in, redirect to login
            if (!currentUser) {
                router.push('/login');
                return;
            }

            // If not admin, redirect to appropriate dashboard
            if (userRole && userRole !== 'admin') {
                router.push(`/dashboard/${userRole}`);
            }
        }
    }, [currentUser, userRole, loading, router]);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard/admin', icon: HomeIcon },
        { name: 'Users', href: '/dashboard/admin/users', icon: UsersIcon },
        { name: 'Settings', href: '/dashboard/admin/settings', icon: Cog6ToothIcon },
        { name: 'Profile', href: '/dashboard/admin/profile', icon: ShieldCheckIcon },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Show loading while checking auth
    if (loading || !currentUser || userRole !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f3f2ef]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin h-12 w-12 mb-4 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
                    <p className="text-gray-900 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f2ef]">
            {/* Header - LinkedIn style */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 shadow-sm">
                <div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-[#0a66c2]">EMMS Admin</span>
                    </div>

                    {/* Profile section */}
                    <div className="flex items-center">
                        <div className="flex items-center">
                            <div className="relative">
                                <button className="flex items-center hover:bg-gray-100 p-2 rounded-full">
                                    <div className="h-8 w-8 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] border border-[#0a66c2]">
                                        <span className="text-sm font-bold">{currentUser?.displayName?.charAt(0) || 'A'}</span>
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                        {currentUser?.displayName || 'Administrator'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <div className="fixed inset-y-0 flex w-64 flex-col pt-14">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex flex-col items-center pb-6 border-b border-gray-200 px-4">
                            <div className="h-20 w-20 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] border border-[#0a66c2] mb-3">
                                <span className="text-2xl font-bold">{currentUser?.displayName?.charAt(0) || 'A'}</span>
                            </div>
                            <h2 className="text-lg font-medium text-gray-900">{currentUser?.displayName || 'Administrator'}</h2>
                            <p className="text-sm text-gray-600 mt-1">{currentUser?.email}</p>
                        </div>

                        <nav className="mt-6 px-3 space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                            ? 'bg-[#e7f3ff] text-[#0a66c2]'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <item.icon
                                            className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#0a66c2]' : 'text-gray-500'
                                                }`}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-full hover:bg-gray-100 transition-colors w-full"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-500" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64 pt-14">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}