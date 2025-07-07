'use client';

import { useState, useEffect } from 'react';
import {
    Cog6ToothIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    BellIcon,
    ClockIcon,
    ShieldCheckIcon,
    UserPlusIcon,
    EnvelopeIcon,
    SunIcon
} from '@heroicons/react/24/outline';
import adminApi from '@/lib/api/adminApi';

export default function SystemSettingsPage() {
    const [formData, setFormData] = useState({
        systemName: 'Innovatech EMMS',
        notificationsEnabled: true,
        logRetentionDays: 30,
        maintenanceMode: false,
        allowUserRegistration: false,
        emailNotifications: true,
        taskReminders: true,
        theme: 'light',
        timezone: 'UTC'
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeSection, setActiveSection] = useState('general');

    // Fetch system settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await adminApi.settings.getSystemSettings();
                setFormData(settings);
                setError('');
            } catch (err) {
                console.error('Error fetching settings:', err);
                setError('Failed to load system settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? parseInt(value, 10) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await adminApi.settings.updateSystemSettings(formData);
            setSuccess('Settings updated successfully');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError(err.message || 'Failed to save settings. Please try again.');

            // Clear error message after 5 seconds
            setTimeout(() => setError(''), 5000);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    const sections = [
        { id: 'general', name: 'General Settings' },
        { id: 'appearance', name: 'Appearance' },
        { id: 'notifications', name: 'Notifications' },
        { id: 'security', name: 'Security & Access' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-[#0a66c2] text-white px-4 py-2 rounded-full hover:bg-[#004182] transition-colors font-medium disabled:opacity-50 flex items-center"
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving Changes...
                        </>
                    ) : (
                        <>
                            <Cog6ToothIcon className="h-5 w-5 mr-2" />
                            Save All Changes
                        </>
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

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex overflow-x-auto" aria-label="Settings sections">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${activeSection === section.id
                                        ? 'border-b-2 border-[#0a66c2] text-[#0a66c2]'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {section.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* General Settings Section */}
                    {activeSection === 'general' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 mb-4">
                                <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
                                <h2 className="text-lg font-medium text-gray-900">General Configuration</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="systemName" className="block mb-2 font-medium text-gray-900">
                                        System Name
                                    </label>
                                    <input
                                        type="text"
                                        id="systemName"
                                        name="systemName"
                                        value={formData.systemName}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none text-gray-900"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500">The name of your employee management system.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="logRetentionDays" className="block mb-2 font-medium text-gray-900">
                                            Log Retention (days)
                                        </label>
                                        <input
                                            type="number"
                                            id="logRetentionDays"
                                            name="logRetentionDays"
                                            value={formData.logRetentionDays}
                                            onChange={handleChange}
                                            min="1"
                                            max="365"
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none text-gray-900"
                                            required
                                        />
                                        <p className="mt-1 text-sm text-gray-500">Number of days to retain system logs.</p>
                                    </div>

                                    <div>
                                        <label htmlFor="timezone" className="block mb-2 font-medium text-gray-900">
                                            System Timezone
                                        </label>
                                        <select
                                            id="timezone"
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleChange}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none text-gray-900"
                                        >
                                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                                            <option value="America/New_York">Eastern Time (ET)</option>
                                            <option value="America/Chicago">Central Time (CT)</option>
                                            <option value="America/Denver">Mountain Time (MT)</option>
                                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                            <option value="Asia/Kolkata">India Standard Time (IST)</option>
                                            <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                                            <option value="Europe/Paris">Central European Time (CET)</option>
                                            <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                                            <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                                        </select>
                                        <p className="mt-1 text-sm text-gray-500">Default timezone for the application.</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                                            <label htmlFor="maintenanceMode" className="font-medium text-gray-900">
                                                Maintenance Mode
                                            </label>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id="maintenanceMode"
                                                name="maintenanceMode"
                                                checked={formData.maintenanceMode}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0a66c2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a66c2]"></div>
                                        </label>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 ml-7">When enabled, the system will show a maintenance message to all users.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Section */}
                    {activeSection === 'appearance' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 mb-4">
                                <SunIcon className="h-5 w-5 text-gray-500" />
                                <h2 className="text-lg font-medium text-gray-900">Appearance & Display</h2>
                            </div>

                            <div>
                                <label htmlFor="theme" className="block mb-2 font-medium text-gray-900">
                                    Default Theme
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                                    <div
                                        className={`border p-4 rounded-lg cursor-pointer ${formData.theme === 'light' ? 'border-[#0a66c2] bg-[#e7f3ff]' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setFormData({ ...formData, theme: 'light' })}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="w-full h-24 bg-white border border-gray-300 rounded mb-2 overflow-hidden">
                                                <div className="h-6 bg-[#f3f2ef] border-b border-gray-300"></div>
                                                <div className="p-2">
                                                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="themeLight"
                                                    name="theme"
                                                    value="light"
                                                    checked={formData.theme === 'light'}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-[#0a66c2] border-gray-300 focus:ring-[#0a66c2]"
                                                />
                                                <label htmlFor="themeLight" className="ml-2 text-sm font-medium text-gray-900">Light</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`border p-4 rounded-lg cursor-pointer ${formData.theme === 'dark' ? 'border-[#0a66c2] bg-[#e7f3ff]' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setFormData({ ...formData, theme: 'dark' })}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="w-full h-24 bg-gray-800 border border-gray-700 rounded mb-2 overflow-hidden">
                                                <div className="h-6 bg-gray-900 border-b border-gray-700"></div>
                                                <div className="p-2">
                                                    <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="themeDark"
                                                    name="theme"
                                                    value="dark"
                                                    checked={formData.theme === 'dark'}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-[#0a66c2] border-gray-300 focus:ring-[#0a66c2]"
                                                />
                                                <label htmlFor="themeDark" className="ml-2 text-sm font-medium text-gray-900">Dark</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`border p-4 rounded-lg cursor-pointer ${formData.theme === 'system' ? 'border-[#0a66c2] bg-[#e7f3ff]' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setFormData({ ...formData, theme: 'system' })}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="w-full h-24 bg-gradient-to-r from-white to-gray-800 border border-gray-300 rounded mb-2 overflow-hidden">
                                                <div className="h-6 bg-gradient-to-r from-[#f3f2ef] to-gray-900 border-b border-gray-300"></div>
                                                <div className="p-2 flex">
                                                    <div className="w-1/2 pr-1">
                                                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    </div>
                                                    <div className="w-1/2 pl-1">
                                                        <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="themeSystem"
                                                    name="theme"
                                                    value="system"
                                                    checked={formData.theme === 'system'}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-[#0a66c2] border-gray-300 focus:ring-[#0a66c2]"
                                                />
                                                <label htmlFor="themeSystem" className="ml-2 text-sm font-medium text-gray-900">System Preference</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">Select the default visual theme for all users.</p>
                            </div>
                        </div>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 mb-4">
                                <BellIcon className="h-5 w-5 text-gray-500" />
                                <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-[#f3f2ef] transition-colors">
                                    <div className="flex items-start">
                                        <BellIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <label htmlFor="notificationsEnabled" className="font-medium text-gray-900 block">
                                                System Notifications
                                            </label>
                                            <span className="text-sm text-gray-500">Enable in-app notifications for users</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="notificationsEnabled"
                                            name="notificationsEnabled"
                                            checked={formData.notificationsEnabled}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0a66c2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a66c2]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-[#f3f2ef] transition-colors">
                                    <div className="flex items-start">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <label htmlFor="emailNotifications" className="font-medium text-gray-900 block">
                                                Email Notifications
                                            </label>
                                            <span className="text-sm text-gray-500">Send important notifications via email</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="emailNotifications"
                                            name="emailNotifications"
                                            checked={formData.emailNotifications}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0a66c2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a66c2]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-[#f3f2ef] transition-colors">
                                    <div className="flex items-start">
                                        <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <label htmlFor="taskReminders" className="font-medium text-gray-900 block">
                                                Task Deadline Reminders
                                            </label>
                                            <span className="text-sm text-gray-500">Send reminders for upcoming task deadlines</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="taskReminders"
                                            name="taskReminders"
                                            checked={formData.taskReminders}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0a66c2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a66c2]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Section */}
                    {activeSection === 'security' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 mb-4">
                                <ShieldCheckIcon className="h-5 w-5 text-gray-500" />
                                <h2 className="text-lg font-medium text-gray-900">Security & Access</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-[#f3f2ef] transition-colors">
                                    <div className="flex items-start">
                                        <UserPlusIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <label htmlFor="allowUserRegistration" className="font-medium text-gray-900 block">
                                                Public User Registration
                                            </label>
                                            <span className="text-sm text-gray-500">Allow new users to register through the public-facing portal</span>
                                            <div className="mt-1 text-xs text-[#b74700]">
                                                <strong>Warning:</strong> Only enable this if you want to allow anyone to create an account.
                                            </div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="allowUserRegistration"
                                            name="allowUserRegistration"
                                            checked={formData.allowUserRegistration}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0a66c2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a66c2]"></div>
                                    </label>
                                </div>

                                <div className="p-3 border border-gray-200 rounded-lg bg-[#f8fafc]">
                                    <h3 className="font-medium text-gray-900 mb-2">Security Controls</h3>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Additional security settings can be configured in the Advanced Security section.
                                    </p>
                                    <a href="/dashboard/admin/security" className="text-[#0a66c2] text-sm font-medium hover:underline">
                                        Go to Advanced Security Settings →
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#0a66c2] text-white px-4 py-2 rounded-full hover:bg-[#004182] transition-colors font-medium disabled:opacity-50 flex items-center"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}