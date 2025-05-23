import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { Link, usePage } from '@inertiajs/react';
import { FiMoreVertical } from "react-icons/fi";
import OptionsDropdown from '../../Components/styledComponents/optionsToggle';
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import { ItemInfoBlueCard } from '@/Components/ItemInfoBlueCard';
import { clientPoIcon, poInProcessIcon, completeOrderIcon } from "./../../../utils/svgIconContent";
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';
import Pagination from '@/Components/Pagination';

export default function View({ purchaseOrders, statusCounts }) {
    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const { flash = {} } = usePage().props;
    const showFlash = useAutoHideFlash(flash.success);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { auth } = usePage().props;
    const user = usePage().props.auth.user;
    const userRoles = auth?.user?.roles || [];
    const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);
    // Extract unique months from the `po_date` field
    const [selectedFilter, setSelectedFilter] = useState('all'); // Default: All Time


    // Filter orders based on search, selected date filter, and client role
    const filteredOrders = purchaseOrders.filter(order => {
        const matchesSearch =
            order.po_number.toLowerCase().includes(search.toLowerCase()) ||
            order.client.name.toLowerCase().includes(search.toLowerCase());
        const matchesDate = selectedFilter === 'all' ? true : filterByDate(order.po_date, selectedFilter);

        if (userRoles[0] === 'Client') {
            return order.client_id === user.id && matchesSearch && matchesDate;
        }
        return matchesSearch && matchesDate;
    });

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
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
    const currentOrders = filteredOrders.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

    return (
        <AuthenticatedLayout


            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Client Purchase Orders
                </h3>
            }
        >
            <Head title="Client Purchase Orders" />
            <div className="main-content-container sm:ml-52">

                <div className="mx-auto py-6">
                    <div className=''>
                        <p className='flex flex-wrap'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /> <span className="text-red">{userRoles[0] == 'Client' ? '' : 'Client'} Purchase Orders</span></p>
                        {/* Status Cards */}
                        <div className="flex my-6 flex-col gap-6 md:flex-row">
                            {userRoles[0] !== 'Client' && (
                                <ItemInfoRedCard svgIcon={clientPoIcon} cardHeading='Total POs' description={statusCounts.allpurchaseOrders} />
                            )}
                            {userRoles[0] == 'Client' && (
                                <ItemInfoRedCard svgIcon={clientPoIcon} cardHeading='Total POs' description={statusCounts.currentallpurchaseOrders} />
                            )}
                            {/* Pending Orders */}
                            {userRoles[0] !== 'Client' && (
                                <ItemInfoGreeCard svgIcon={poInProcessIcon} cardHeading='PO In Process' description={statusCounts.pendingpurchaseOrders} />
                            )}
                            {userRoles[0] == 'Client' && (
                                <ItemInfoGreeCard svgIcon={poInProcessIcon} cardHeading='PO In Process' description={statusCounts.currentpendingpurchaseOrders} />
                            )}
                            {userRoles[0] !== 'Client' && (
                                <ItemInfoBlueCard svgIcon={completeOrderIcon} cardHeading='Completed Orders' description={statusCounts.completedpurchaseOrders} />
                            )}
                            {userRoles[0] == 'Client' && (
                                <ItemInfoBlueCard svgIcon={completeOrderIcon} cardHeading='Completed Orders' description={statusCounts.currentcompletedpurchaseOrders} />
                            )}

                        </div>
                    </div>
                    <Link className='text-right bg-red px-4 py-2 rounded-md text-white block max-w-max ml-auto mb-4'
                        href={route('client-purchase-orders.create')}>Create Purchase Order</Link>
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4 flex-col md:flex-row'>
                                <h2 className='font-bold text-2xl'>{userRoles[0] == 'Client' ? '' : 'Client'} Purchase Orders</h2>
                                <div className='flex items-center justify-end flex-1 gap-2'>
                                    <form className="flex items-center max-w-sm">
                                        <label htmlFor="simple-search" className="sr-only">Search by Name or Email</label>
                                        <div className="relative w-full">

                                            <input
                                                type="text"
                                                className="bg-white border border-gray-300 pe-10 placeholder:text-black text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                placeholder="Search by PO No. or Client"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                            <div className="absolute inset-y-0 end-4 flex items-center ps-3 pointer-events-none">
                                                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </form>
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
                                    </select>
                                </div>
                            </div>
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">PO Number</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Client Name</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">PO Date</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Plant Name</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrders
                                        .filter(order => order.order_status !== "deleted")
                                        .map(order => (
                                            <tr key={order.id}>
                                                <td className="px-2 py-3 border-b text-sm">{order.po_number}</td>
                                                <td className="px-2 py-3 border-b text-sm">{order.client.name}</td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    {order.po_date
                                                        ? new Date(order.po_date)
                                                            .toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "2-digit",
                                                            })
                                                            .replace(/\s/g, "-")
                                                        : "N/A"}
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm">{order.plant.plant_name}</td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(order.order_status)}`}>
                                                        {getStatusText(order.order_status)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm relative">
                                                    <button
                                                        type="button"
                                                        className="flex justify-center items-center size-9 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                                        onClick={() => toggleDropdown(order.id)}
                                                        aria-haspopup="menu"
                                                        aria-expanded={openDropdown === order.id ? "true" : "false"}
                                                        aria-label="Dropdown"
                                                    >
                                                        <FiMoreVertical className="size-4 text-gray-600" />
                                                    </button>
                                                    {openDropdown === order.id && (
                                                        <div
                                                            className="absolute right-0 mt-2 min-w-40 bg-slate-200 rounded-lg transition-opacity duration-200 z-10"
                                                            role="menu"
                                                            aria-orientation="vertical"
                                                            onMouseLeave={closeDropdown}
                                                        >
                                                            <div className="space-y-0.5 flex flex-col p-2 gap-1">
                                                                {order.order_status == 'pending_for_approval' && (
                                                                    <>
                                                                        <Link
                                                                            href={route('client-purchase-orders.edit', order.id)}
                                                                            className="text-blue-500 hover:underline"
                                                                        >
                                                                            Edit
                                                                        </Link>
                                                                        <Link
                                                                            href={route('client-purchase-orders.suspend', order.id)}
                                                                            className="text-blue-500 hover:underline"
                                                                        >
                                                                            Delete
                                                                        </Link>
                                                                    </>
                                                                )}
                                                                <Link
                                                                    href={route('client-purchase-orders.view', order.id)}
                                                                    className="text-blue-500 hover:underline"
                                                                >
                                                                    View
                                                                </Link>
                                                                {userRoles[0] !== 'Client' && order.order_status !== 'dispatched' && order.order_status !== 'completed' && (
                                                                    <Link
                                                                        href={route('client-purchase-orders.approve', order.id)}
                                                                        className="text-blue-500 hover:underline"
                                                                    >
                                                                        MRP Calculator
                                                                    </Link>
                                                                )}

                                                                {order.order_status === 'dispatched' && userPermissions.includes("completed client-purchase-orders") && (
                                                                    <Link
                                                                        href={route('client-purchase-orders.completed', order.id)}
                                                                        className="text-blue-500 hover:underline"
                                                                    >
                                                                        Mark Completed
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
                            {/* Pagination Controls */}
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

