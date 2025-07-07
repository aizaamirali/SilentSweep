'use client';

import { useState } from 'react';

export default function UserForm({ initialData, onSubmit, onCancel, loading, isNewUser }) {
    const [formData, setFormData] = useState({
        displayName: initialData?.displayName || '',
        email: initialData?.email || '',
        password: '',
        role: initialData?.role || 'employee',
        active: initialData?.active !== undefined ? initialData.active : true
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (isNewUser && !formData.password.trim()) {
            newErrors.password = 'Password is required for new users';
        } else if (isNewUser && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                form: error.message
            }));
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div>
            {errors.form && (
                <div className="mb-4 p-4 bg-[#FEF9F1] border border-[#FACCA6] text-[#b74700] rounded-md">
                    {errors.form}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="displayName" className="block mb-1 text-sm font-medium text-gray-900">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none ${errors.displayName ? 'border-[#b74700]' : 'border-gray-300'
                            }`}
                    />
                    {errors.displayName && (
                        <p className="mt-1 text-sm text-[#b74700]">{errors.displayName}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-900">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isNewUser} // Can't change email for existing users
                        className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none ${errors.email ? 'border-[#b74700]' : 'border-gray-300'
                            } ${!isNewUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-[#b74700]">{errors.email}</p>
                    )}
                </div>

                {isNewUser && (
                    <div>
                        <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-900">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none ${errors.password ? 'border-[#b74700]' : 'border-gray-300'
                                }`}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-[#b74700]">{errors.password}</p>
                        )}
                    </div>
                )}

                <div>
                    <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-900">
                        Role
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none"
                    >
                        <option value="admin">Admin</option>
                        <option value="ceo">CEO</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                    </select>
                </div>

                {!isNewUser && (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="active"
                            name="active"
                            checked={formData.active}
                            onChange={handleChange}
                            className="h-4 w-4 text-[#0a66c2] focus:ring-[#0a66c2] border-gray-300 rounded"
                        />
                        <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                            Active
                        </label>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-[#0a66c2] text-white rounded-full hover:bg-[#004182] transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : isNewUser ? 'Add User' : 'Update User'}
                    </button>
                </div>
            </form>
        </div>
    );
}