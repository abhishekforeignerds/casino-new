import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';


export default function Index({ roles }) {
    const { flash = {} } = usePage().props;
    const [search, setSearch] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const showFlash = useAutoHideFlash(flash.success);

    // Filter roles based on search term
    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
    };

    // Helper to determine background color based on permission module keywords
    const getModuleColor = (permissionName) => {
        const lowerName = permissionName.toLowerCase();
        if (lowerName.includes("users")) {
            return "bg-red text-white";
        } else if (lowerName.includes("client-purchase-orders")) {
            return "bg-purple-500";
        }
        else if (lowerName.includes("vendor-purchase-orders")) {
            return "bg-red text-white";
        }
        else if (lowerName.includes("reports")) {
            return "bg-red text-white";
        }
        else if (lowerName.includes("finished-goods")) {
            return "bg-red text-white";
        }

        else {
            return "bg-gray-500";
        }
    };

    return (
        <AuthenticatedLayout


            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Roles
                </h3>
            }
        >
            <Head title="Roles" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div>
                        <p className="flex">
                            <Link href={route('dashboard')}>Dashboard</Link>
                            <FiChevronRight size={24} color="black" />
                            <span className="text-red">Roles Management</span>
                        </p>
                        <Link
                            href={route('roles.create')}
                            className="text-right bg-red px-8 py-2 rounded-md text-white block max-w-max ml-auto mb-4"
                        >
                            Create Role
                        </Link>
                    </div>
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex py-4 gap-2">
                                <h2 className="font-bold text-2xl">Roles List</h2>
                                <div className="flex items-center justify-end flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by role name"
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
                                            <th className="px-4 py-2 border-b text-left">Role Name</th>
                                            <th className="px-4 py-2 border-b text-left">Permissions</th>
                                            <th className="px-4 py-2 border-b text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRoles.map((role) => (
                                            <tr key={role.id}>
                                                <td className="px-4 py-2 border-b">{role.name}</td>
                                                <td className="px-4 py-2 border-b">
                                                    {role.permissions.map((perm) => {
                                                        const bgColor = getModuleColor(perm.name);
                                                        return (
                                                            <span
                                                                key={perm.id}
                                                                className={`${bgColor} text-white px-2 py-1 rounded-full text-xs mr-1 mb-1 inline-block`}
                                                            >
                                                                {perm.name}
                                                            </span>
                                                        );
                                                    })}
                                                </td>
                                                <td className="px-4 py-2 border-b relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleDropdown(role.id)}
                                                        className="flex items-center px-2 py-1 border border-gray-300 rounded-md"
                                                    >
                                                        <FiMoreVertical />
                                                    </button>
                                                    {openDropdown === role.id && (
                                                        <div
                                                            className="absolute right-0 mt-2 min-w-40 bg-white border shadow-md rounded transition-opacity duration-200 z-10"
                                                            onMouseLeave={closeDropdown}
                                                        >
                                                            <div className="flex flex-col p-2">
                                                                <Link
                                                                    href={route('roles.edit', role.id)}
                                                                    className="text-blue-500 hover:underline"
                                                                >
                                                                    Edit
                                                                </Link>
                                                                {/* Additional actions can be added here */}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
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
