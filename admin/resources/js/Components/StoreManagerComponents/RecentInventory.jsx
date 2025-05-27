import React, { useState, useEffect } from "react";
import { Link, usePage } from '@inertiajs/react';
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';

const RecentInventory = ({ orders }) => {
    // orders is an object keyed by plant_id.
    const plantIds = Object.keys(orders);
    // Set the first plant id as selected by default.
    const [selectedPlant, setSelectedPlant] = useState(
        plantIds.length ? plantIds[0] : null
    );
    const [selectedYear, setSelectedYear] = useState('');

    // Extract unique years from orders based on created_at
    const uniqueYears = [...new Set(
        Object.values(orders)
            .flat() // Flatten orders array
            .map(order => new Date(order.created_at).getFullYear())
    )];

    // Update selectedOrders based on selectedPlant and selectedYear
    const selectedOrders = selectedPlant
        ? orders[selectedPlant].filter(order => {
            const orderYear = new Date(order.created_at).getFullYear();
            return selectedYear === '' || orderYear.toString() === selectedYear;
        })
        : [];

    return (
        <div className="bg-white shadow-md rounded-lg p-6 min-w-[68%] sm:max-w-[68%] overflow-x-auto sm:[overflow-x-scroll]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Inventory Movements</h2>
                <select
                    className="border border-gray-300 rounded pe-8 py-1 text-sm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="">This Week</option>
                    {uniqueYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-sm text-red">
                        <th className="p-2 border-b">Date</th>
                        <th className="p-2 border-b">Time</th>
                        <th className="p-2 border-b">Category</th>
                        <th className="p-2 border-b">Material Name</th>
                        <th className="p-2 border-b">Movement Type</th>
                        <th className="p-2 border-b">Source/Destination</th>
                        <th className="p-2 border-b">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedOrders.map((order) => (
                        <tr key={order.id} className="text-sm">
                            <td className="p-2 border-b">
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
                            <td className="p-2 border-b">10:15 AM</td>
                            <td className="p-2 border-b text-center">RM</td>
                            <td className="p-2 border-b">Copper Wire</td>
                            <td className="p-2 border-b font-bold">
                                Inbound Delivery
                            </td>
                            <td className="p-2 border-b">
                                Vendor ABC
                            </td>
                            <td className="p-2 border-b text-gray-600 cursor-pointer"><Link
                                href={route('client-purchase-orders.view', order.id)}
                                className="text-blue-500 hover:underline"
                            >
                                View
                            </Link></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentInventory;
