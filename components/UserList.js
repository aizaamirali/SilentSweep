export default function UserList({ users, loading, onEdit, onDeactivate, onReactivate }) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] rounded-full"></div>
            </div>
        );
    }

    if (!users.length) {
        return (
            <div className="text-center py-8 bg-white border border-gray-200 rounded-md">
                <p className="text-lg text-gray-500">No users found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-auto">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900">{user.displayName || 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-700">{user.email}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-[#e7f3ff] text-[#0a66c2] border border-[#c3d9f0]' :
                                        user.role === 'ceo' ? 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]' :
                                            user.role === 'manager' ? 'bg-[#f5f2e3] text-[#915907] border border-[#e8d6a8]' :
                                                'bg-[#f3f2ef] text-gray-700 border border-gray-300'
                                    }`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.active
                                        ? 'bg-[#ddf5f2] text-[#057642] border border-[#c0e6c0]'
                                        : 'bg-[#FEF9F1] text-[#b74700] border border-[#FACCA6]'
                                    }`}>
                                    {user.active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => onEdit(user.id)}
                                        className="px-3 py-1 text-sm text-[#0a66c2] hover:bg-[#e7f3ff] rounded-full transition-colors"
                                    >
                                        Edit
                                    </button>
                                    {user.active ? (
                                        <button
                                            onClick={() => onDeactivate(user.id)}
                                            className="px-3 py-1 text-sm text-[#b74700] hover:bg-[#FEF9F1] rounded-full transition-colors"
                                        >
                                            Deactivate
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onReactivate(user.id)}
                                            className="px-3 py-1 text-sm text-[#057642] hover:bg-[#ddf5f2] rounded-full transition-colors"
                                        >
                                            Reactivate
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}