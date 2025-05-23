import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';

export default function Index({ permissions }) {
    const { flash = {} } = usePage().props;
    const [search, setSearch] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const showFlash = useAutoHideFlash(flash.success);

    // Filter permissions based on the search term.
    const filteredPermissions = permissions.filter((permission) =>
        permission.name.toLowerCase().includes(search.toLowerCase())
    );

    // Group permissions based on the portion of the name after the first word.
    const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
        const parts = permission.name.split(' ');
        const groupKey = parts.length > 1 ? parts.slice(1).join(' ') : 'Other';
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(permission);
        return groups;
    }, {});

    // Helper to format group names: replace hyphens with spaces and capitalize words.
    const formatGroupName = (group) => {
        return group
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
    };

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-blue-600 p-4 rounded-md text-center">
                    Permissions
                </h3>
            }
        >
            <Head title="Permissions" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div className='flex justify-content'>
                        <p className="flex">
                            <Link href={route('dashboard')}>Dashboard</Link>
                            <FiChevronRight size={24} color="black" />
                            <span className="text-red">Permissions Management</span>
                        </p>
                        <Link
                            href={route('permissions.create')}
                            className="text-right bg-red px-8 py-2 rounded-md text-white block max-w-max ml-auto mb-4"
                        >
                            Create Permission
                        </Link>
                    </div>
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-green-100 text-green-700 font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex py-4 gap-2">
                                <h2 className="font-bold text-2xl">Permissions List</h2>
                                <div className="flex items-center justify-end flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by permission name"
                                        className="border border-gray-300 rounded-md px-4 py-2"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border-b text-left">Permission Name</th>
                                            <th className="px-4 py-2 border-b text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(groupedPermissions).map((groupKey) => (
                                            <React.Fragment key={groupKey}>
                                                <tr className="bg-gray-100">
                                                    <td className="px-4 py-2 border-b font-bold" colSpan="2">
                                                        {formatGroupName(groupKey)}
                                                    </td>
                                                </tr>
                                                {groupedPermissions[groupKey].map(permission => (
                                                    <tr key={permission.id}>
                                                        <td className="px-4 py-2 border-b">{permission.name}</td>
                                                        <td className="px-4 py-2 border-b relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleDropdown(permission.id)}
                                                                className="flex items-center px-2 py-1 border border-gray-300 rounded-md"
                                                            >
                                                                <FiMoreVertical />
                                                            </button>
                                                            {openDropdown === permission.id && (
                                                                <div
                                                                    className="absolute right-0 mt-2 min-w-40 bg-white border shadow-md rounded transition-opacity duration-200 z-10"
                                                                    onMouseLeave={closeDropdown}
                                                                >
                                                                    <div className="flex flex-col p-2">
                                                                        <Link
                                                                            href={route('permissions.edit', permission.id)}
                                                                            className="text-blue-500 hover:underline"
                                                                        >
                                                                            Edit
                                                                        </Link>
                                                                        <Link
                                                                            href={route('permissions.destroy', permission.id)}
                                                                            method="delete"
                                                                            as="button"
                                                                            className="text-red-500 hover:underline mt-1"
                                                                        >
                                                                            Delete
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
