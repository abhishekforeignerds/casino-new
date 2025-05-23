import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import OptionsDropdown from '../../Components/styledComponents/optionsToggle';
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import { clientUserIcon, activeClientIcon, clientAndVendorIcon, uploadFileIcon, searchFormIcon } from '../../../utils/svgIconContent';
import { ItemInfoBlueCard } from '@/Components/ItemInfoBlueCard';
import { useAutoHideFlash } from '../../../utils/useAutoHideFlash';
import { getStatusText, getStatusClass } from '../../../utils/statusUtils';
import { filterOptions, filterByDate } from '@/Components/FilterUtils';
import Pagination from '@/Components/Pagination';

export default function View({ users, allusers }) {
    console.log(users, 'users')
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const { flash = {} } = usePage().props;
    const [selectedFilter, setSelectedFilter] = useState('all'); // Default: All Time
    const [openDropdown, setOpenDropdown] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const showFlash = useAutoHideFlash(flash.success);

    // Update debouncedSearch after 300ms of no changes to search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // Memoized filtering for performance
    const filteredClients = useMemo(() => {
        return users.filter((user) => {
            // Check if search term matches name (or full name), email, or even the new user flag (if needed)
            const matchesSearch =
                (user.name && user.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
                // Optionally, you can search by formatted created_at if desired:
                (user.created_at && user.created_at.toLowerCase().includes(debouncedSearch.toLowerCase()));

            // Filter by date using your utility (could be updated to use created_at as well)
            const matchesDate = filterByDate(user.created_at, selectedFilter);
            return matchesSearch && matchesDate && user.status !== "deleted";
        });
    }, [users, debouncedSearch, selectedFilter]);

    const currentRoute = route().current(); // Assuming it gives current route

    const { auth } = usePage().props; // Get user data from Inertia
    const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);

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
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

    // Utility to check if a user is new: for example, if created within 7 days
    const isNewUser = (createdAt) => {
        const createdDate = new Date(createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return createdDate >= sevenDaysAgo;
    };

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Players
                </h3>
            }
        >
            <Head title="Players" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div>
                        <p className="flex flex-wrap">
                            <Link href={route('dashboard')}>Dashboard</Link>
                            <FiChevronRight size={24} color="black" />
                            <Link href={route('players.index')}>Players Management</Link>
                            <FiChevronRight size={24} color="black" />
                            <span className="text-red">Client List</span>
                        </p>
                        {/* Conditional Create button */}
                        {userPermissions.includes("create clients") && (
                            <Link
                                className="text-right bg-red px-8 py-2 rounded-md text-white block max-w-max ml-auto mb-4"
                                href={route('players.create')}
                            >
                                Create Client
                            </Link>
                        )}
                        <div className="flex my-6 flex-col gap-6 md:flex-row">

                            <ItemInfoRedCard svgIcon={clientUserIcon} cardHeading='All Players' description={allusers} />






                        </div>
                        <Link
                            className="text-right bg-red px-8 py-2 rounded-md text-white block max-w-max ml-auto mb-4"
                            href={route('players.create')}
                        >
                            Add Player
                        </Link>
                    </div>
                    {/* Flash Message - visible for a few seconds */}
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="top-search-bar-box flex py-4">
                                <h2 className="font-bold text-2xl">Players List</h2>
                                <div className="flex items-center justify-end flex-1 gap-2">
                                    <form className="flex items-center max-w-sm">
                                        <label htmlFor="simple-search" className="sr-only">
                                            Search by Name or Email
                                        </label>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                id="simple-search"
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-10 p-2.5 placeholder:text-black"
                                                placeholder="Search by Name or Email"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                            <div className="absolute inset-y-0 end-4 flex items-center ps-3 pointer-events-none">
                                                {searchFormIcon}
                                            </div>
                                        </div>
                                    </form>
                                    <div>
                                        <select
                                            className="border border-gray-300 rounded-md px-8 py-2.5 text-sm"
                                            value={selectedFilter}
                                            onChange={(e) => setSelectedFilter(e.target.value)}
                                        >
                                            {filterOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Name</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Phone</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Email Address</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Username</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Points</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Type</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Ticket</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentClients.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-2 py-3 border-b text-sm font-bold">{user.first_name} {user.last_name}</td>
                                            <td className="px-2 py-3 border-b text-sm">{user.phone}</td>
                                            <td className="px-2 py-3 border-b text-sm">{user.email}</td>
                                            <td className="px-2 py-3 border-b text-sm">{user.username}</td>
                                            <td className="px-2 py-3 border-b text-sm">{user.points}</td>

                                            <td className="px-2 py-3 border-b text-sm">{user.type}</td>
                                            <td className="px-2 py-3 border-b text-sm">

                                                <Link href={route('players.suspend', user.id)} className={`px-2 py-1 rounded text-xs font-medium block hover:underline ${getStatusClass(user.status)}`}>{getStatusText(user.status)}</Link>
                                            </td>
                                            <td className="px-2 py-3 border-b text-sm">{user.type == 'desktop' && (
                                                <Link
                                                    className="bg-red px-3 py-1 rounded-md text-white text-xs"
                                                    href={route('players.viewticket', user.id)}
                                                >
                                                    View Ticket
                                                </Link>
                                            )}</td>
                                            {/* <td className="px-2 py-3 border-b text-sm">
                                                {user.created_at && isNewUser(user.created_at) ? 'Yes' : 'No'}
                                            </td> */}
                                            <td className="px-2 py-3 border-b text-sm relative">
                                                {user.type != 'desktop' && (
                                                    <Link
                                                        className="text-right bg-red px-8 py-2 rounded-md text-white block max-w-max ml-auto mb-4"
                                                        href={route('players.addfund', user.id)}
                                                    >
                                                        Add Fund
                                                    </Link>
                                                )}


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
                                                                href={route('players.edit', user.id)}
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <Link
                                                                href={route('players.view', user.id)}
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                View Games
                                                            </Link>

                                                            <Link
                                                                href={route('players.suspend', user.id)}
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                Suspend
                                                            </Link>

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
