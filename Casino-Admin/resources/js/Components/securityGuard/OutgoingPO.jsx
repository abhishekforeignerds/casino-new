import React, { useState, useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import { getStatusText, getStatusClass } from "../../../utils/statusUtils";
import { filterOptions, filterByDate } from "@/Components/FilterUtils";

const OutgoingPOTable = ({ orders }) => {
    const plantIds = Object.keys(orders);
    const [selectedPlant, setSelectedPlant] = useState(plantIds.length ? plantIds[0] : null);
    const [selectedFilter, setSelectedFilter] = useState("today");

    // Filter orders based on selected date filter
    const selectedOrders = useMemo(() => {
        return selectedPlant
            ? orders[selectedPlant].filter(order => filterByDate(order.created_at, selectedFilter))
            : [];
    }, [orders, selectedPlant, selectedFilter]);

    const { auth } = usePage().props;
    const userRoles = auth?.user?.roles || [];

    return (
        <div className="bg-white shadow-md rounded-lg p-6 min-w-[68%] sm:max-w-[68%] overflow-x-auto sm:[overflow-x-scroll]">
            <div className="flex justify-between items-center mb-4">
                {userRoles[0] === "Security Guard" ? (
                    <h2 className="text-lg font-semibold">Outgoing PO</h2>
                ) : (
                    <h2 className="text-lg font-semibold">Purchase Order Requests from Client</h2>
                )}
                <div className="flex gap-2">
                    <button className="bg-red text-white px-4 py-2 rounded">See All</button>
                    <select
                        className="border border-gray-300 rounded px-4 py-1 text-sm"
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

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-sm">
                        <th className="p-2 border-b text-red font-bold">PO Number</th>
                        <th className="p-2 border-b text-red font-bold">Client</th>
                        <th className="p-2 border-b text-red font-bold">Status</th>
                        <th className="p-2 border-b text-red font-bold">Dispatch Date</th>
                        <th className="p-2 border-b text-red font-bold">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedOrders.length > 0 ? (
                        selectedOrders.map((order) => (
                            <tr key={order.id} className="text-sm">
                                <td className="p-2 border-b">{order.id}</td>
                                <td className="p-2 border-b">{order.client.name}</td>
                                <td className="p-2 border-b">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(
                                            order.order_status
                                        )}`}
                                    >
                                        {order.order_status}
                                    </span>
                                </td>
                                <td className="p-2 border-b">{order.po_date}</td>
                                <td className="p-2 border-b text-black cursor-pointer">
                                    <Link
                                        href={route("client-purchase-orders.view", order.id)}
                                        className="text-black hover:underline font-bold"
                                    >
                                        View PO
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="p-4 text-center text-gray-500">
                                No records found for the selected filter.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OutgoingPOTable;
