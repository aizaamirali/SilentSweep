'use client';

import { useState } from 'react';

export default function TaskList({ tasks, loading, onStatusChange, onEdit, onDelete, userRole }) {
    const [filter, setFilter] = useState('all');

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-foreground/20 border-t-foreground rounded-full"></div>
            </div>
        );
    }

    if (!tasks || tasks.length === 0) {
        return (
            <div className="text-center py-8 border rounded-md bg-background/50">
                <p className="text-lg opacity-70">No tasks found</p>
            </div>
        );
    }

    const filteredTasks = filter === 'all'
        ? tasks
        : tasks.filter(task => task.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'not_started': return 'bg-gray-100 text-gray-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'not_started': return 'Not Started';
            case 'in_progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'overdue': return 'Overdue';
            default: return status;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 pb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-sm rounded-md ${filter === 'all'
                        ? 'bg-foreground text-background'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('not_started')}
                    className={`px-3 py-1 text-sm rounded-md ${filter === 'not_started'
                        ? 'bg-foreground text-background'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    Not Started
                </button>
                <button
                    onClick={() => setFilter('in_progress')}
                    className={`px-3 py-1 text-sm rounded-md ${filter === 'in_progress'
                        ? 'bg-foreground text-background'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    In Progress
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-3 py-1 text-sm rounded-md ${filter === 'completed'
                        ? 'bg-foreground text-background'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    Completed
                </button>
                <button
                    onClick={() => setFilter('overdue')}
                    className={`px-3 py-1 text-sm rounded-md ${filter === 'overdue'
                        ? 'bg-foreground text-background'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    Overdue
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="px-4 py-3 text-left text-sm font-medium">Task</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Assigned To</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-4 py-3">
                                    <div>
                                        <h3 className="font-medium">{task.title}</h3>
                                        <p className="text-sm opacity-70 line-clamp-1">{task.description}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={task.status}
                                        onChange={(e) => onStatusChange(task.id, e.target.value)}
                                        className={`text-xs px-2 py-1 rounded-md ${getStatusColor(task.status)}`}
                                        disabled={userRole !== 'manager' && task.status === 'completed'}
                                    >
                                        <option value="not_started">Not Started</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="overdue" disabled>Overdue</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {task.assigneeName || 'Unassigned'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => onEdit(task.id)}
                                            className="p-1 text-blue-600 hover:text-blue-800"
                                            disabled={userRole !== 'manager'}
                                        >
                                            Edit
                                        </button>
                                        {userRole === 'manager' && (
                                            <button
                                                onClick={() => onDelete(task.id)}
                                                className="p-1 text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}