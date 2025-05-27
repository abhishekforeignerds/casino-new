import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function Create({ permissions }) {
    // Define the form data using Inertia's useForm hook.
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: []
    });

    // Group permissions based on the portion of the name after the first word.
    const groupedPermissions = permissions.reduce((groups, permission) => {
        const parts = permission.name.split(' ');
        const groupKey = parts.length > 1 ? parts.slice(1).join(' ') : 'Other';
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(permission);
        return groups;
    }, {});

    // Formats group names: replace hyphens with spaces and capitalize each word.
    const formatGroupName = (group) => {
        return group
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Handle individual checkbox changes.
    const handleCheckboxChange = (e, permissionName) => {
        if (e.target.checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permissionName));
        }
    };

    // Toggle all permissions in a group.
    const handleGroupToggle = (groupPermissions) => {
        const allSelected = groupPermissions.every(permission => data.permissions.includes(permission.name));
        if (allSelected) {
            // Remove all permissions in the group.
            setData('permissions', data.permissions.filter(p => !groupPermissions.some(permission => permission.name === p)));
        } else {
            // Add missing permissions.
            const newSelections = groupPermissions
                .map(permission => permission.name)
                .filter(name => !data.permissions.includes(name));
            setData('permissions', [...data.permissions, ...newSelections]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Post data to the roles.store route
        post(route('roles.store'));
    };

    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Role
                </h2>
            }
        >
            <Head title="Create Role" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex flex-wrap'>
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('roles.index')}>Roles Management</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className='text-red'>Create Role</span>
                    </p>
                    <Link
                        href={route('roles.index')}
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='font-semibold text-3xl mb-6'>Create New Role</h2>
                            </div>
                            <form onSubmit={handleSubmit} className='styled-form'>
                                <div className='theme-style-form grid grid-cols-1 gap-6'>
                                    {/* Role Name Field */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Role Name*</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Role Name"
                                        />
                                        {errors.name && <div className="text-errorRed text-sm">{errors.name}</div>}
                                    </div>
                                    {/* Grouped Permissions */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Assign Permissions</label>
                                        {Object.keys(groupedPermissions).map((groupKey) => {
                                            const groupPermissions = groupedPermissions[groupKey];
                                            const isGroupChecked = groupPermissions.every(permission =>
                                                data.permissions.includes(permission.name)
                                            );
                                            return (
                                                <div key={groupKey} className="mb-6">
                                                    <h3 className="font-bold text-gray-700 flex items-center">
                                                        {formatGroupName(groupKey)}
                                                        <span className="mx-2 text-sm text-gray-600">
                                                            Permissions:
                                                        </span>
                                                        <div className="flex items-center">
                                                            <label htmlFor={`group-toggle-${groupKey}`} className="mr-2 text-sm text-gray-600">
                                                                {isGroupChecked ? 'Deselect All' : 'Select All'}
                                                            </label>
                                                            <input
                                                                type="checkbox"
                                                                id={`group-toggle-${groupKey}`}
                                                                checked={isGroupChecked}
                                                                onChange={() => handleGroupToggle(groupPermissions)}
                                                            />
                                                        </div>
                                                    </h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                        {groupPermissions.map((permission) => (
                                                            <div key={permission.id} className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`perm-${permission.id}`}
                                                                    value={permission.name}
                                                                    checked={data.permissions.includes(permission.name)}
                                                                    onChange={(e) => handleCheckboxChange(e, permission.name)}
                                                                    className="mr-2"
                                                                />
                                                                <label htmlFor={`perm-${permission.id}`} className="text-gray-700">
                                                                    {permission.name.split(' ')[0]}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {errors.permissions && (
                                                        <div className="text-errorRed text-sm">
                                                            {errors.permissions}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Create Role
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
