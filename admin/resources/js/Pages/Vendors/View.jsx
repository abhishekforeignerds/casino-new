import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { FiMoreVertical } from "react-icons/fi";
import OptionsDropdown from '../../Components/styledComponents/optionsToggle';
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import { clientUserIcon, activeClientIcon, clientAndVendorIcon, searchFormIcon } from './../../../utils/svgIconContent';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import { ItemInfoBlueCard } from '@/Components/ItemInfoBlueCard';
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';
import { filterOptions, filterByDate } from '@/Components/FilterUtils';
import Pagination from '@/Components/Pagination';

export default function View({ users, statusCounts }) {
    const [search, setSearch] = useState('');
    const { flash = {} } = usePage().props;
    const [selectedMonth, setSelectedMonth] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const showFlash = useAutoHideFlash(flash.success);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Extract unique months from the `created_at` field
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Filter users based on search term and selected date range
    const filteredClients = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesDate = selectedFilter === 'all' ? true : filterByDate(user.created_at, selectedFilter);
        return matchesSearch && matchesDate && user.status !== "deleted";
    });

    const toggleDropdown = (email) => {
        setOpenDropdown(openDropdown === email ? null : email);
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
    };
    const handleRowsPerPageChange = (rows) => {
        setRowsPerPage(rows);
        setCurrentPage(1); // Reset to page 1 when rows change
    };

    // Pagination calculations
    const totalRows = filteredplayers.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const currentPageSafe = Math.min(currentPage, totalPages); // Ensure page number is within bounds
    const indexOfLastRow = currentPageSafe * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentVendor = filteredplayers.slice(indexOfFirstRow, indexOfLastRow);

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Vendors
                </h3>
            }
        >
            <Head title="Vendors" />
            <div className="main-content-container sm:ml-52">

                <div className="mx-auto py-6">
                    <div className=''>
                        <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /><Link href={route('vendors.index')}> Vendors Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Vendor List</span></p>

                        {/* Status Cards */}
                        <div className="flex space-x-8 my-6">
                            {/* total users */}
                            <ItemInfoRedCard svgIcon={clientUserIcon} cardHeading='Total Vendors' description={statusCounts.allUsers} />
                            {/* Active Vendors */}
                            <ItemInfoGreeCard svgIcon={activeClientIcon} cardHeading='Active Vendors' description={statusCounts.active} />
                            <ItemInfoBlueCard svgIcon={clientAndVendorIcon} cardHeading='Recent Vendors Added' description={statusCounts.inactive} />

                            {/* Inactive Vendors */}

                        </div>
                        <Link className='text-right bg-red px-8 py-2 rounded-md text-white block max-w-max ml-auto mb-4'
                            href={route('vendors.create')}>Create Vendors</Link>

                    </div>
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='font-bold text-2xl'>Vendors List</h2>
                                <div className='flex items-center justify-end flex-1 gap-2'>
                                    <form className="flex items-center max-w-sm">
                                        <label htmlFor="simple-search" className="sr-only">Search by Name or Email</label>
                                        <div className="relative w-full">
                                            <div className="absolute inset-y-0 end-4 flex items-center ps-3 pointer-events-none">
                                                {searchFormIcon}
                                            </div>
                                            <input
                                                type="text"
                                                id="simple-search"
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-10 p-2.5 placeholder:text-black"
                                                placeholder="Search by Name or Email"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)} // Set search state
                                            />
                                        </div>
                                    </form>
                                    {/*  */}
                                    <div className="">
                                        <select
                                            className="border border-gray-300 rounded-md px-8 py-2.5 text-sm"
                                            value={selectedFilter}
                                            onChange={(e) => setSelectedFilter(e.target.value)}
                                        >

                                            {filterOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select></div>
                                    {/*  */}
                                </div>
                            </div>
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Company Name</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Email Address</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Plant Name</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Mobile</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">State Code</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentVendor.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-2 py-3 border-b text-sm font-bold">{user.company_name}</td>
                                            <td className="px-2 py-3 border-b text-sm">{user.email}</td>
                                            <td className="px-2 py-3 border-b text-sm">
                                                {user.plant && user.plant.plant_name ? user.plant.plant_name : 'No Plant Assigned'}
                                            </td>
                                            <td className="px-2 py-3 border-b text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(user.status)}`}>
                                                    {getStatusText(user.status)}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 border-b text-sm">{user.mobile_number || 'N/A'}</td>
                                            <td className="px-2 py-3 border-b text-sm">{user.state_code}</td>
                                            <td className="px-2 py-3 border-b text-sm relative">
                                                <button
                                                    type="button"
                                                    className="flex justify-center items-center size-9 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                                    onClick={() => toggleDropdown(user.email)}
                                                    aria-haspopup="menu"
                                                    aria-expanded={openDropdown === user.email ? "true" : "false"}
                                                    aria-label="Dropdown"
                                                >
                                                    <FiMoreVertical className="size-4 text-gray-600" />
                                                </button>
                                                {openDropdown === user.email && (
                                                    <div
                                                        className="absolute right-0 mt-2 min-w-40 bg-slate-200 shadow-md rounded-lg transition-opacity duration-200 z-10"
                                                        role="menu"
                                                        aria-orientation="vertical"
                                                        onMouseLeave={closeDropdown}
                                                    >
                                                        <div className="space-y-0.5 flex flex-col p-2 gap-1">
                                                            <Link
                                                                href={route('vendors.edit', user.id)}
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <Link
                                                                href={route('vendors.view', user.id)}
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                View
                                                            </Link>
                                                            {!user.roles.map(role => role.name).includes('Super Admin') && (
                                                                <Link
                                                                    href={route('vendors.suspend', user.id)}
                                                                    className="text-blue-500 hover:underline"
                                                                >
                                                                    Suspend
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                rowsPerPage={rowsPerPage}
                                setRowsPerPage={handleRowsPerPageChange}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
