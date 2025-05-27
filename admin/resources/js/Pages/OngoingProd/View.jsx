import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { clientPoIcon, poInProcessIcon, completeOrderIcon } from "./../../../utils/svgIconContent";
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import { ItemInfoBlueCard } from '@/Components/ItemInfoBlueCard';
import Pagination from '@/Components/Pagination';


export default function View({ ongoingProds, statusCounts, finishedGoods }) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDropdown, setOpenDropdown] = useState(null);
    // Group records by PO ID without summing quantity.

    // Group records by PO ID while deduplicating item_codes, units, and statuses.
    const groupedProds = ongoingProds.reduce((acc, item) => {
        if (!acc[item.po_id]) {
            acc[item.po_id] = {
                po_id: item.po_id,
                item_codes: [item.item_code],
                quantities: [item.quantity],
                units: [item.unit],
                statuses: [item.status],
            };
        } else {
            // Add item_code if not already in array
            if (!acc[item.po_id].item_codes.includes(item.item_code)) {
                acc[item.po_id].item_codes.push(item.item_code);
            }
            // Always push quantity (no summing, just listing)
            acc[item.po_id].quantities.push(item.quantity);
            // Add unit if not already in array
            if (!acc[item.po_id].units.includes(item.unit)) {
                acc[item.po_id].units.push(item.unit);
            }
            // Add status if not already in array
            if (!acc[item.po_id].statuses.includes(item.status)) {
                acc[item.po_id].statuses.push(item.status);
            }
        }
        return acc;
    }, {});

    const groupedProdsArray = Object.values(groupedProds);
    const handleRowsPerPageChange = (rows) => {
        setRowsPerPage(rows);
        setCurrentPage(1); // Reset to page 1 when rows change
    };

    // Corrected Pagination Calculations
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentOrders = groupedProdsArray.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(groupedProdsArray.length / rowsPerPage);

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Ongoing Production
                </h3>
            }
        >
            <Head title="Ongoing Production" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div>
                        <p className="flex flex-wrap">
                            <Link href={route('dashboard')}>Dashboard</Link>
                            <FiChevronRight size={24} color="black" />
                            <span className="text-red">Ongoing Production</span>
                        </p>
                    </div>
                    <div className="flex my-6 flex-col gap-6 md:flex-row">
                        <ItemInfoRedCard svgIcon={clientPoIcon} cardHeading='Total Productions' description={statusCounts.totalProduction} />
                        <ItemInfoGreeCard svgIcon={poInProcessIcon} cardHeading='Production In Process' description={statusCounts.ongoingCount} />
                        <ItemInfoBlueCard svgIcon={completeOrderIcon} cardHeading='Completed Production' description={statusCounts.completeCount} />

                    </div>
                    <div className="flex gap-2 justify-end">
                        {/* You can add your search input or other controls here */}
                    </div>
                    <div className="bg-white shadow-sm sm:rounded-lg my-6">
                        <div className="p-6 text-gray-900">
                            <div className="top-search-bar-box flex py-4 gap-2">
                                <h2 className="font-bold text-2xl">Ongoing Production List</h2>
                            </div>
                            <div className="table-container md:overflow-x-visible overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">PO ID</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Item Code</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Unit</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Quantity</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentOrders.map((group) => (
                                            <tr key={group.po_id}>
                                                <td className="px-2 py-3 border-b text-sm font-semibold">{group.po_id}</td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    {group.item_codes.join(', ')}
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    {group.units.join(', ')}
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    {group.quantities.join(', ')}
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    {group.statuses.join(', ')}
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    {group.statuses.every(status => status.toLowerCase() === 'completed') ? (
                                                        <span>Completed</span>
                                                    ) : (
                                                        <Link
                                                            href={route('ongoingProduction.complete', group.po_id)}
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            Mark Completed
                                                        </Link>
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
            </div>
        </AuthenticatedLayout>
    );
}
