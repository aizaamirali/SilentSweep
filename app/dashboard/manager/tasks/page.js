'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import managerApi from '@/lib/api/managerApi';
import {
    PlusIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

export default function ManagerTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [filteredStatus, setFilteredStatus] = useState('all');
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, [currentUser]);

    const fetchTasks = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // Use the managerApi to fetch tasks
            const tasksData = await managerApi.tasks.getTeamTasks(currentUser.uid);

            // Sort tasks by due date (ascending)
            tasksData.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            setTasks(tasksData);
            setError('');
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            // Use the managerApi to update task status via the updateTask method
            await managerApi.tasks.updateTask(taskId, { status: newStatus });

            // Update local state
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            ));

            setSuccess('Task status updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating task status:', err);
            setError(err.message || 'Failed to update task status');
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleEdit = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        setEditingTask(task);
        setShowForm(true);
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            // Use the managerApi to delete task
            await managerApi.tasks.deleteTask(taskId);

            // Update local state
            setTasks(tasks.filter(task => task.id !== taskId));
            setSuccess('Task deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting task:', err);
            setError(err.message || 'Failed to delete task');
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleSubmit = async (taskData) => {
        setFormLoading(true);
        setError('');
        setSuccess('');

        try {
            if (editingTask) {
                // Update existing task
                const updatedTask = await managerApi.tasks.updateTask(editingTask.id, taskData);

                // Update local state
                setTasks(tasks.map(task =>
                    task.id === editingTask.id ? { ...task, ...updatedTask } : task
                ));

                setSuccess('Task updated successfully');
            } else {
                // Create new task
                const newTask = await managerApi.tasks.createTask(taskData);

                // Update local state
                setTasks([...tasks, newTask]);

                setSuccess('Task created successfully');
            }

            // Reset form
            setShowForm(false);
            setEditingTask(null);
        } catch (err) {
            console.error('Error saving task:', err);
            setError(err.message || 'Failed to save task');
        } finally {
            setFormLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]';
            case 'in progress':
                return 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]';
            case 'not started':
                return 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]';
            case 'overdue':
                return 'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-300';
        }
    };

    // Filter tasks based on selected status
    const filteredTasks = filteredStatus === 'all'
        ? tasks
        : tasks.filter(task => task.status.toLowerCase() === filteredStatus.toLowerCase());

    // Calculate task stats
    const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status.toLowerCase() === 'completed').length,
        inProgress: tasks.filter(t => t.status.toLowerCase() === 'in progress').length,
        notStarted: tasks.filter(t => t.status.toLowerCase() === 'not started').length,
        overdue: tasks.filter(t => t.status.toLowerCase() === 'overdue').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                <button
                    onClick={() => {
                        setEditingTask(null);
                        setShowForm(!showForm);
                    }}
                    className="flex items-center px-4 py-2 bg-[#0a66c2] text-white text-sm font-medium rounded-full hover:bg-[#004182] transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    {showForm ? 'Cancel' : 'Create New Task'}
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

            {/* Task Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Total Tasks</h3>
                    <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Completed</h3>
                    <p className="text-2xl font-bold text-[#057642]">{taskStats.completed}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">In Progress</h3>
                    <p className="text-2xl font-bold text-[#0a66c2]">{taskStats.inProgress}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Not Started</h3>
                    <p className="text-2xl font-bold text-[#915907]">{taskStats.notStarted}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Overdue</h3>
                    <p className="text-2xl font-bold text-[#b74700]">{taskStats.overdue}</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {showForm ? (
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">
                            {editingTask ? 'Edit Task' : 'Create New Task'}
                        </h2>

                        <TaskForm
                            initialData={editingTask}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingTask(null);
                            }}
                            loading={formLoading}
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-0">Team Tasks</h2>

                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                                <div className="flex items-center bg-white border border-gray-300 rounded-full overflow-hidden w-full sm:w-auto">
                                    <button
                                        className={`px-3 py-1.5 text-sm font-medium ${filteredStatus === 'all'
                                                ? 'bg-[#0a66c2] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setFilteredStatus('all')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`px-3 py-1.5 text-sm font-medium ${filteredStatus === 'completed'
                                                ? 'bg-[#057642] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setFilteredStatus('completed')}
                                    >
                                        Completed
                                    </button>
                                    <button
                                        className={`px-3 py-1.5 text-sm font-medium ${filteredStatus === 'in progress'
                                                ? 'bg-[#0a66c2] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setFilteredStatus('in progress')}
                                    >
                                        In Progress
                                    </button>
                                    <button
                                        className={`px-3 py-1.5 text-sm font-medium ${filteredStatus === 'not started'
                                                ? 'bg-[#915907] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setFilteredStatus('not started')}
                                    >
                                        Not Started
                                    </button>
                                    <button
                                        className={`px-3 py-1.5 text-sm font-medium ${filteredStatus === 'overdue'
                                                ? 'bg-[#b74700] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setFilteredStatus('overdue')}
                                    >
                                        Overdue
                                    </button>
                                </div>

                                <button
                                    onClick={fetchTasks}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                                    title="Refresh tasks"
                                >
                                    <ArrowPathIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto h-12 w-12 text-gray-400">
                                    <ClipboardIcon className="h-12 w-12" />
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filteredStatus === 'all'
                                        ? "Get started by creating a new task for your team."
                                        : `No tasks with status "${filteredStatus}" found.`}
                                </p>
                                {filteredStatus !== 'all' && (
                                    <button
                                        onClick={() => setFilteredStatus('all')}
                                        className="mt-4 text-sm text-[#0a66c2] hover:text-[#004182] font-medium"
                                    >
                                        View all tasks
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-[#f3f2ef]">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Task
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Assigned To
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Due Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Priority
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTasks.map((task) => {
                                            const isOverdue = new Date(task.dueDate) < new Date() && task.status.toLowerCase() !== 'completed';
                                            let statusToShow = task.status;

                                            if (isOverdue && task.status.toLowerCase() !== 'overdue') {
                                                statusToShow = 'Overdue';
                                            }

                                            return (
                                                <tr key={task.id} className="hover:bg-[#f3f2ef]">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0a66c2] mr-2">
                                                                <span>{task.assignedTo.charAt(0)}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-900">{task.assignedTo}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <ClockIcon className={`h-4 w-4 mr-1 ${isOverdue ? 'text-[#b74700]' : 'text-gray-500'}`} />
                                                            <span className={`text-sm ${isOverdue ? 'text-[#b74700] font-medium' : 'text-gray-900'}`}>
                                                                {new Date(task.dueDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select
                                                            value={statusToShow}
                                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                            className={`text-xs font-medium px-2.5 py-1.5 rounded-full ${getStatusBadgeClass(statusToShow)}`}
                                                        >
                                                            <option value="Not Started">Not Started</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="Overdue">Overdue</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${task.priority === 'High'
                                                                ? 'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]'
                                                                : task.priority === 'Medium'
                                                                    ? 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]'
                                                                    : 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]'
                                                            }`}>
                                                            {task.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(task.id)}
                                                                className="text-[#0a66c2] hover:text-[#004182]"
                                                                title="Edit task"
                                                            >
                                                                <PencilSquareIcon className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(task.id)}
                                                                className="text-[#b74700] hover:text-[#933800]"
                                                                title="Delete task"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Helper component for task icon
function ClipboardIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
    );
}

// Task Form Component
function TaskForm({ initialData, onSubmit, onCancel, loading }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Not Started',
        ...initialData
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                    />
                </div>

                <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To *
                    </label>
                    <input
                        type="text"
                        id="assignedTo"
                        name="assignedTo"
                        required
                        value={formData.assignedTo}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                    />
                </div>

                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date *
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        required
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                    />
                </div>

                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                    </label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition"
                    ></textarea>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#0a66c2] text-white font-medium rounded-full hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-2 disabled:opacity-70"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Saving...</span>
                        </div>
                    ) : (
                        <span>{initialData ? 'Update Task' : 'Create Task'}</span>
                    )}
                </button>
            </div>
        </form>
    );
}