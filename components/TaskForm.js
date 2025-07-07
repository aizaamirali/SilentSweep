'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TaskForm({ initialData, onSubmit, onCancel, loading }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: '',
        status: 'not_started'
    });

    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);

    // Initialize form with initial data if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                priority: initialData.priority || 'medium',
                dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                assignedTo: initialData.assignedTo || '',
                status: initialData.status || 'not_started'
            });
        }
    }, [initialData]);

    // Fetch employees for assignment
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const employeesCollection = collection(db, 'users');
                const snapshot = await getDocs(employeesCollection);

                const employeesList = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(user => user.active);

                setEmployees(employeesList);
            } catch (error) {
                console.error('Error fetching employees:', error);
            } finally {
                setLoadingEmployees(false);
            }
        };

        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Find the assignee's name for display purposes
        const assignee = employees.find(emp => emp.id === formData.assignedTo);
        onSubmit({
            ...formData,
            assigneeName: assignee ? assignee.displayName : ''
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block mb-2 font-medium">
                    Task Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block mb-2 font-medium">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full p-2 border rounded-md"
                    required
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="priority" className="block mb-2 font-medium">
                        Priority
                    </label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="dueDate" className="block mb-2 font-medium">
                        Due Date
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="assignedTo" className="block mb-2 font-medium">
                        Assign To
                    </label>
                    <select
                        id="assignedTo"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                        required
                    >
                        <option value="">Select Employee</option>
                        {loadingEmployees ? (
                            <option disabled>Loading employees...</option>
                        ) : (
                            employees.map(employee => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.displayName} ({employee.role})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {initialData && (
                    <div>
                        <label htmlFor="status" className="block mb-2 font-medium">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
                </button>
            </div>
        </form>
    );
}