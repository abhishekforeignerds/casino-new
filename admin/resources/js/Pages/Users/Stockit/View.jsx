import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import { ItemInfoBlueCard } from '@/Components/ItemInfoBlueCard';
import ItemInfoSkyBlueCard from '@/Components/ItemInfoSkyBlueCard';
import { totalPlantsIcon, activePlantsIcon, maintenanceIcon, totalCapicityIcon, searchFormIcon } from '../../../../utils/svgIconContent';
import { useAutoHideFlash } from '../../../../utils/useAutoHideFlash';
import { getStatusText, getStatusClass } from '../../../../utils/statusUtils';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';

export default function View({ users, statusCounts }) {
    const [search, setSearch] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { flash = {}, auth } = usePage().props;
    const showFlash = useAutoHideFlash(flash.success);
    const userPermissions = auth.user.rolespermissions.flatMap(r => r.permissions);

    const toggleDropdown = email => setOpenDropdown(openDropdown === email ? null : email);
    const closeDropdown = () => setOpenDropdown(null);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesDate = selectedFilter === 'all'
            ? true
            : filterByDate(user.created_at, selectedFilter);
        return matchesSearch && matchesDate && user.status !== 'deleted';
    });

    // Filter only Stockits
    const subAdminUsers = filteredUsers.filter(user =>
        user.roles.some(role => role.name === 'Stockit')
    );

    const totalPages = Math.ceil(subAdminUsers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedUsers = subAdminUsers.slice(startIndex, startIndex + rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Stockit
                </h3>
            }
        >
            <Head title="Stockit" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <p className="flex">
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} />
                        <Link href={route('stockit.index')}> Stockit Management</Link>
                        <FiChevronRight size={24} />
                        <span className="text-red">Stockit List</span>
                    </p>

                    <div className="flex my-6 flex-col gap-6 md:flex-row">
                        <ItemInfoRedCard svgIcon={totalPlantsIcon} cardHeading="Total Stockit" description={statusCounts.allUsers} />
                        <ItemInfoGreeCard svgIcon={activePlantsIcon} cardHeading="Active Stockit" description={statusCounts.active} />
                        <ItemInfoBlueCard svgIcon={maintenanceIcon} cardHeading="Pending Approval" description={statusCounts.pending} />
                        <ItemInfoSkyBlueCard svgIcon={totalCapicityIcon} cardHeading="Inactive Stockit" description={statusCounts.inactive} />
                    </div>

                    <Link className="text-right bg-red px-8 py-2 rounded-md text-white block max-w-max ml-auto mb-4" href={route('stockit.create')}>
                        Create Stockit
                    </Link>

                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 text-gray-900">
                        <div className="top-search-bar-box flex py-4 gap-2">
                            <h2 className="font-bold text-2xl">Stockit List</h2>
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
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <select
                                    className="border border-gray-300 rounded-md px-2 py-2 text-sm"
                                    value={rowsPerPage}
                                    onChange={handleRowsPerPageChange}
                                >
                                    {[5, 10, 25, 50].map(size => (
                                        <option key={size} value={size}>{size} rows</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {userPermissions.includes('subadmin-table users') && (
                            <div className="overflow-x-auto mt-6">
                                {paginatedUsers.length > 0 ? (
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Full Name</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Email Address</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Commission %</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Mobile</th>

                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Balance</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedUsers.map(user => (
                                                <tr key={user.id}>
                                                    <td className="px-2 py-3 border-b text-sm font-semibold">{user.name}</td>
                                                    <td className="px-2 py-3 border-b text-sm">{user.email}</td>
                                                    <td className="px-2 py-3 border-b text-sm">{user.gstin_number || 0}%</td>
                                                    <td className="px-2 py-3 border-b text-sm">{user.mobile_number || 'N/A'}</td>

                                                    <td className="px-2 py-3 border-b text-sm">
                                                        {(Number(user.pan_card) || 0).toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="px-2 py-3 border-b text-sm">

                                                        <Link href={route('stockit.suspend', user.id)} className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(user.status)}`}> {getStatusText(user.status)}</Link>
                                                    </td>
                                                    <td className="px-2 py-3 border-b text-sm relative">
                                                        {userPermissions.includes('view users') && (
                                                            <Link className="bg-red px-3 py-1 rounded-md text-white text-xs" href={route('users.addfund', user.id)}>
                                                                Add Fund
                                                            </Link>
                                                        )}
                                                        <button onClick={() => toggleDropdown(user.email)} className="ml-2">
                                                            <FiMoreVertical />
                                                        </button>
                                                        {openDropdown === user.email && (
                                                            <div className="absolute right-0 mt-2 bg-slate-200 shadow-md rounded-lg p-2" onMouseLeave={closeDropdown}>
                                                                <Link href={route('stockit.edit', user.id)} className="block hover:underline">Edit</Link>
                                                                <Link href={route('stockit.view', user.id)} className="block hover:underline">View</Link>

                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-sm italic text-gray-500">No Stockit users found.</p>
                                )}

                                {/* Pagination controls */}
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-sm text-gray-700">
                                        Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, subAdminUsers.length)} of {subAdminUsers.length} entries
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-3 py-1">{currentPage} / {totalPages}</span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
