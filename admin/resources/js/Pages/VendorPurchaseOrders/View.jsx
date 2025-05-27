import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { Link, usePage } from '@inertiajs/react';
import { FiMoreVertical } from "react-icons/fi";
import OptionsDropdown from '../../Components/styledComponents/optionsToggle';
import { vendorTotalOrderIcon, VendorPOProcessIcon, vendorPoOrderIcon } from '../../../utils/svgIconContent'
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';


export default function View({ purchaseOrders, statusCounts }) {
    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const { auth } = usePage().props;
    const user = usePage().props.auth.user;
    const userRoles = auth?.user?.roles || [];
    const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);

    const { flash = {} } = usePage().props;
    const showFlash = useAutoHideFlash(flash.success);


    // Extract unique months from the `po_date` field
    const [selectedFilter, setSelectedFilter] = useState('all'); // Default: All Time


    // Fixed date-range filter options
    const filterOptions = [
        { label: "All Time", value: "all" },
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "This Week", value: "this_week" },
        { label: "Previous 7 Days", value: "previous_7_days" },
        { label: "Last 14 Days", value: "last_14_days" },
        { label: "Last 30 Days", value: "last_30_days" },
        { label: "This Month", value: "this_month" },
        { label: "Last Month", value: "last_month" },
        { label: "Last 3 Months", value: "last_3_months" },
        { label: "Last 6 Months", value: "last_6_months" },
        { label: "This Year", value: "this_year" },
        { label: "Last Year", value: "last_year" },

    ];

    // Helper function to filter by date range (including today)
    const filterByDate = (date, filter) => {
        const d = new Date(date);
        const now = new Date();
        switch (filter) {
            case 'today':
                return d.toDateString() === now.toDateString();
            case 'yesterday': {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                return d.toDateString() === yesterday.toDateString();
            }
            case 'this_week': {
                // Assuming week starts on Sunday
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return d >= startOfWeek && d <= endOfWeek;
            }
            case 'previous_7_days': {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(now.getDate() - 7);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                return d >= sevenDaysAgo && d < todayStart;
            }
            case 'last_14_days': {
                const fourteenDaysAgo = new Date(now);
                fourteenDaysAgo.setDate(now.getDate() - 14);
                return d >= fourteenDaysAgo && d <= now;
            }
            case 'last_30_days': {
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(now.getDate() - 30);
                return d >= thirtyDaysAgo && d <= now;
            }
            case 'this_month':
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            case 'last_month': {
                const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
                return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
            }
            case 'this_year':
                return d.getFullYear() === now.getFullYear();
            case 'last_year':
                return d.getFullYear() === now.getFullYear() - 1;
            case 'last_3_months': {
                const threeMonthsAgo = new Date(now);
                threeMonthsAgo.setMonth(now.getMonth() - 3);
                return d >= threeMonthsAgo && d <= now;
            }
            case 'last_6_months': {
                const sixMonthsAgo = new Date(now);
                sixMonthsAgo.setMonth(now.getMonth() - 6);
                return d >= sixMonthsAgo && d <= now;
            }
            default:
                return true;
        }
    };

    // Filter orders based on search term, selected date range, and vendor-specific rules
    const filteredOrders = purchaseOrders.filter(order => {
        const matchesSearch =
            order.po_number.toLowerCase().includes(search.toLowerCase()) ||
            order.client.name.toLowerCase().includes(search.toLowerCase());
        const matchesDate = selectedFilter === 'all' ? true : filterByDate(order.po_date, selectedFilter);

        if (userRoles[0] === 'Vendor') {
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

    return (
        <AuthenticatedLayout


            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Vendor Purchase Orders
                </h3>
            }
        >
            <Head title="Vendor Purchase Orders" />
            <div className="main-content-container sm:ml-52">

                <div className="mx-auto py-6">
                    <div className=''>
                        <p className='flex flex-wrap'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /><span className="text-red">Vendor Purchase Orders</span></p>

                        {/* Status Cards */}
                        <div className="flex space-x-8 my-6">
                            {/* Total Orders */}
                            <div className="bg-lightPink text-gray-800 p-4 rounded-lg shadow w-full text-center">
                                <div className="svg-box bg-red w-12 h-12 flex justify-center items-center rounded-md ml-auto mr-auto mb-4">
                                    {vendorTotalOrderIcon}
                                </div>

                                <h3 className="text-md font-medium">Total POs</h3>
                                {userRoles[0] !== 'Vendor' && (
                                    <p className="text-2xl">{statusCounts.allpurchaseOrders}</p>
                                )}
                                {userRoles[0] == 'Vendor' && (
                                    <p className="text-2xl">{statusCounts.currentallpurchaseOrders}</p>
                                )}
                            </div>
                            {/* Pending Orders */}
                            <div className="bg-lightGreen text-gray-800 p-4 rounded-lg shadow w-full text-center">
                                <div className="svg-box bg-green w-12 h-12 flex justify-center items-center rounded-md ml-auto mr-auto mb-4">
                                    {VendorPOProcessIcon}
                                </div>
                                <h3 className="text-md font-medium">PO In Process</h3>
                                {userRoles[0] !== 'Vendor' && (
                                    <p className="text-2xl">{statusCounts.pendingpurchaseOrders}</p>
                                )}
                                {userRoles[0] == 'Vendor' && (
                                    <p className="text-2xl">{statusCounts.pendingpurchaseOrders}</p>
                                )}
                            </div>
                            {/* Completed Orders */}
                            <div className="bg-lightBlue text-gray-800 p-4 rounded-lg shadow w-full text-center">
                                <div className="svg-box bg-blue w-12 h-12 flex justify-center items-center rounded-md ml-auto mr-auto mb-4">{vendorPoOrderIcon}</div>
                                <h3 className="text-md font-medium">Completed Orders</h3>
                                {userRoles[0] !== 'Vendor' && (
                                    <p className="text-2xl">{statusCounts.currentpendingpurchaseOrders}</p>
                                )}
                                {userRoles[0] == 'Vendor' && (
                                    <p className="text-2xl">{statusCounts.currentcompletedpurchaseOrders}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    {userPermissions.includes("create client-purchase-orders") && (
                        <Link className='text-right bg-red px-4 py-2 rounded-md text-white block max-w-max ml-auto mb-4'
                            href={route('vendor-purchase-orders.create')}>Create Purchase Order</Link>
                    )}

                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='font-bold text-2xl'>
                                    {/* {userRoles[0] === 'Client' ? '' : 'Client'}  */}
                                    Vendor Purchase Orders</h2>
                                <div className='flex items-center justify-end flex-1 gap-2'>
                                    <form className="flex items-center max-w-sm">
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                className="bg-white border border-gray-300 pe-10 placeholder:text-black text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                placeholder="Search by PO Number or Client"
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
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Vendor Name</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">PO Date</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Plant Name</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders
                                        .filter(order => {
                                            if (userRoles[0] === "Vendor") {
                                                return !["deleted", "pr_requsted", "plant_head_approved"].includes(order.order_status);
                                            }
                                            return order.order_status !== "deleted";
                                        })
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
                                                                <Link
                                                                    href={route('vendor-purchase-orders.view', order.id)}
                                                                    className="text-blue-500 hover:underline"
                                                                >
                                                                    View
                                                                </Link>
                                                                {order.order_status !== "fulfilled" ? (
                                                                    <>
                                                                        {userPermissions.includes("edit client-purchase-orders") && (
                                                                            <Link
                                                                                href={route('vendor-purchase-orders.edit', order.id)}
                                                                                className="text-blue-500 hover:underline"
                                                                            >
                                                                                Edit
                                                                            </Link>
                                                                        )}
                                                                        {userPermissions.includes("delete client-purchase-orders") && (
                                                                            <Link
                                                                                href={route('vendor-purchase-orders.suspend', order.id)}
                                                                                className="text-blue-500 hover:underline"
                                                                            >
                                                                                Delete
                                                                            </Link>
                                                                        )}
                                                                    </>
                                                                ) : null}
                                                                {userPermissions.includes("accept-po vendor-purchase-orders") && order.order_status === "pending" ? (
                                                                    <Link
                                                                        href={route('vendor-purchase-orders.accept-po', order.id)}
                                                                        className="text-blue-500 hover:underline"
                                                                    >
                                                                        Accept
                                                                    </Link>
                                                                ) : null}
                                                                {userPermissions.includes("plantheadapproved-po vendor-purchase-orders") && order.order_status === "pr_requsted" ? (
                                                                    <Link
                                                                        href={route('vendor-purchase-orders.plantheadapproved-po', order.id)}
                                                                        className="text-blue-500 hover:underline"
                                                                    >
                                                                        Plant Head Approved
                                                                    </Link>
                                                                ) : null}
                                                                {userPermissions.includes("adminapproved-po vendor-purchase-orders") && order.order_status === "plant_head_approved" ? (
                                                                    <Link
                                                                        href={route('vendor-purchase-orders.adminapproved-po', order.id)}
                                                                        className="text-blue-500 hover:underline"
                                                                    >
                                                                        Admin Approved
                                                                    </Link>
                                                                ) : null}
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
        </AuthenticatedLayout>
    );
}
