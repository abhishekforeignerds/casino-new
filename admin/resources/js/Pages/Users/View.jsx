import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import { ItemInfoBlueCard } from '@/Components/ItemInfoBlueCard';
import ItemInfoSkyBlueCard from '@/Components/ItemInfoSkyBlueCard';
import Pagination from '@/Components/Pagination';
import { totalPlantsIcon, activePlantsIcon, maintenanceIcon, totalCapicityIcon, searchFormIcon } from '../../../utils/svgIconContent';
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';

export default function View({ users, statusCounts }) {
    const [search, setSearch] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [openDropdown, setOpenDropdown] = useState(null);
    const { flash = {}, auth } = usePage().props;
    const showFlash = useAutoHideFlash(flash.success);
    const userPermissions = auth.user.rolespermissions.flatMap(r => r.permissions);

    // 1️⃣ Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesDate = selectedFilter === 'all'
            ? true
            : filterByDate(user.created_at, selectedFilter);
        return matchesSearch && matchesDate && user.status !== 'deleted';
    });

    // 2️⃣ Define display order and permission keys
    const rolesOrder = ['Super Admin', 'Stockit', 'Retailer'];
    const rolePermissionsMap = {
        'Super Admin': 'superadmin-table users',
        'Stockit': 'stockit-table users',
        'Retailer': 'retailer-table users',
    };

    // 3️⃣ Group users by role
    const groupedUsers = rolesOrder.reduce((acc, roleName) => {
        acc[roleName] = filteredUsers.filter(u =>
            u.roles.some(r => r.name === roleName)
        );
        return acc;
    }, {});

    const toggleDropdown = email =>
        setOpenDropdown(openDropdown === email ? null : email);
    const closeDropdown = () => setOpenDropdown(null);

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Users
                </h3>
            }
        >
            <Head title="Users" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    {/* Breadcrumb + Status Cards + Create Button */}
                    <p className="flex">
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} />
                        <Link href={route('users.index')}> Users Management</Link>
                        <FiChevronRight size={24} />
                        <span className="text-red">User List</span>
                    </p>

                    <div className="flex my-6 flex-col gap-6 md:flex-row">
                        <ItemInfoRedCard
                            svgIcon={totalPlantsIcon}
                            cardHeading="Total Users"
                            description={statusCounts.allUsers}
                        />
                        <ItemInfoGreeCard
                            svgIcon={activePlantsIcon}
                            cardHeading="Active Users"
                            description={statusCounts.active}
                        />
                        <ItemInfoBlueCard
                            svgIcon={maintenanceIcon}
                            cardHeading="Pending Approval"
                            description={statusCounts.pending}
                        />
                        <ItemInfoSkyBlueCard
                            svgIcon={totalCapicityIcon}
                            cardHeading="Inactive Users"
                            description={statusCounts.inactive}
                        />
                    </div>

                    {/* <Link
                        className="text-right bg-red px-8 py-2 rounded-md text-white block max-w-max ml-auto mb-4"
                        href={route('users.create')}
                    >
                        Create Users
                    </Link> */}

                    {/* Flash Message */}
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}

                    {/* Search + Date Filter */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6 text-gray-900">
                        <div className="top-search-bar-box flex py-4 gap-2">
                            <h2 className="font-bold text-2xl">Users List</h2>
                            <div className="flex items-center gap-2 flex-1 justify-end">
                                <form className="flex items-center max-w-sm">
                                    <input
                                        type="text"
                                        placeholder="Search by Name or Email"
                                        className="bg-white border border-gray-300 text-sm rounded-lg block w-full pe-10 p-2.5"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 end-2 ps-3 pointer-events-none">
                                        {searchFormIcon}
                                    </div>
                                </form>
                                <select
                                    className="border border-gray-300 rounded-md px-4 py-2.5 text-sm"
                                    value={selectedFilter}
                                    onChange={e => setSelectedFilter(e.target.value)}
                                >
                                    {filterOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 4️⃣ Render one table per role, gated by permission */}
                        {rolesOrder.map(roleName => {
                            const permissionKey = rolePermissionsMap[roleName];
                            if (!userPermissions.includes(permissionKey)) {
                                return null;
                            }
                            const usersForRole = groupedUsers[roleName];
                            return (
                                <div key={roleName} className="mt-8">
                                    <h3 className="text-xl font-semibold mb-2">{roleName}</h3>
                                    {usersForRole.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full bg-white">
                                                <thead>
                                                    <tr>
                                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Full Name</th>
                                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Sub‑Admin</th>
                                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Stockit</th>
                                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Email</th>
                                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Commission %</th>
                                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Mobile</th>
                                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Balance</th>
                                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {usersForRole.map(user => (
                                                        <tr key={user.id}>
                                                            {console.log(user, 'user')}
                                                            <td className="px-2 py-3 border-b text-sm font-semibold">{user.name}</td>
                                                            <td className="px-2 py-3 border-b text-sm">
                                                                {user.sub_admin ? user.sub_admin.name : '—'}
                                                            </td>
                                                            <td className="px-2 py-3 border-b text-sm">
                                                                {user.stockit ? user.stockit.name : '—'}
                                                            </td>
                                                            <td className="px-2 py-3 border-b text-sm">{user.email}</td>
                                                            <td className="px-2 py-3 border-b text-sm">{user.gstin_number || 0}%</td>
                                                            <td className="px-2 py-3 border-b text-sm">{user.mobile_number || 'N/A'}</td>
                                                            <td className="px-2 py-3 border-b text-sm">
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(user.status)}`}>
                                                                    {getStatusText(user.status)}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-3 border-b text-sm">
                                                                {(Number(user.pan_card) || 0).toLocaleString('en-IN')}
                                                            </td>
                                                            <td className="px-2 py-3 border-b text-sm">
                                                                {/* … your Add Fund / Edit buttons … */}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm italic text-gray-500">No {roleName} users found.</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
