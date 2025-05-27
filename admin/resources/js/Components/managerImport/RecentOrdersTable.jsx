import React, { useState, useMemo } from "react";
import { Link } from '@inertiajs/react';
import { getStatusClass } from '../../../utils/statusUtils';

const RecentOrdersTable = ({ orders, vendorpurchaseOrders }) => {
    // Get unique plant IDs from both client and vendor orders (as strings for consistency)
    const plantIds = [...new Set([
        ...Object.keys(orders),
        ...Object.keys(vendorpurchaseOrders)
    ])];

    // State for filtering by plant and year
    const [selectedPlant, setSelectedPlant] = useState(plantIds.length ? plantIds[0] : null);
    const [selectedYear, setSelectedYear] = useState('');

    // Helper function to get plant name from client orders first then vendor orders
    const getPlantName = (plantId) => {
        if (orders[plantId] && orders[plantId].length > 0) {
            return orders[plantId][0].plant.plant_name;
        }
        if (vendorpurchaseOrders[plantId] && vendorpurchaseOrders[plantId].length > 0) {
            return vendorpurchaseOrders[plantId][0].plant?.plant_name || `Plant ${plantId}`;
        }
        return `Plant ${plantId}`;
    };

    // Memoized calculation of filtered and sorted orders
    const filteredOrders = useMemo(() => {
        // Flatten the client orders (orders are grouped by plant_id) and tag them as 'client'
        const clientOrders = Object.values(orders).flat().map(order => ({
            ...order,
            orderType: 'client'
        }));

        // Convert vendorpurchaseOrders from an object to an array, flatten and tag as 'vendor'
        const vendorOrders = Object.values(vendorpurchaseOrders)
            .flat()
            .map(order => ({
                ...order,
                orderType: 'vendor'
            }));

        // Combine both orders
        let combinedOrders = [...clientOrders, ...vendorOrders];

        // Filter combinedOrders by selected plant id.
        combinedOrders = combinedOrders.filter(order =>
            order.plant_id && order.plant_id.toString() === selectedPlant
        );

        // Apply year filter if selected
        if (selectedYear) {
            combinedOrders = combinedOrders.filter(order => {
                const year = new Date(order.created_at).getFullYear().toString();
                return year === selectedYear;
            });
        }

        // Sort the orders by expected_delivery_date (ascending order)
        return combinedOrders.sort((a, b) => new Date(a.expected_delivery_date) - new Date(b.expected_delivery_date));
    }, [orders, vendorpurchaseOrders, selectedPlant, selectedYear]);

    // Function to calculate the priority based on expected_delivery_date
    const getPriority = (expectedDeliveryDate) => {
        const now = new Date();
        const deliveryDate = new Date(expectedDeliveryDate);
        const diffTime = deliveryDate - now;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays < 15) return 'High';
        if (diffDays < 30) return 'Medium';
        return 'Low';
    };

    // Get unique years from filtered orders based on created_at
    const uniqueYears = [...new Set(
        filteredOrders.map(order => new Date(order.created_at).getFullYear())
    )];

    return (
        <div className="bg-white shadow-md rounded-lg p-6 min-w-[68%] overflow-x-auto sm:max-w-[68%] sm:[overflow-x-scroll]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Production Orders Section</h2>
                <select
                    className="border border-gray-300 rounded pe-8 py-1 text-sm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="">Filter by Year</option>
                    {uniqueYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Tabs for filtering by plant id */}
            <div className="flex gap-2 mb-4">
                {plantIds.map((plantId) => (
                    <button
                        key={plantId}
                        className={`px-4 py-2 rounded ${selectedPlant === plantId
                            ? "bg-red-500 text-white"
                            : "bg-gray-100 text-gray-600"
                            }`}
                        onClick={() => setSelectedPlant(plantId)}
                    >
                        {getPlantName(plantId)}
                    </button>
                ))}
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-sm">
                        <th className="p-2 border-b text-red font-bold">Order ID</th>
                        <th className="p-2 border-b text-red font-bold">Client/Vendor</th>
                        <th className="p-2 border-b text-red font-bold">Status</th>
                        <th className="p-2 border-b text-red font-bold">Priority</th>
                        <th className="p-2 border-b text-red font-bold">Due Date</th>
                        <th className="p-2 border-b text-red font-bold">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((order) => (
                        <tr key={`${order.orderType}-${order.id}`} className="hover:bg-gray-50 text-sm">
                            <td className="p-2 border-b">{order.id}</td>
                            <td className="p-2 border-b">
                                {order.orderType === 'client' ? order.client.name : order.client.name}
                            </td>
                            <td className="p-2 border-b">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(order.order_status)}`}>
                                    {order.order_status}
                                </span>
                            </td>
                            <td className="p-2 border-b">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriority(order.expected_delivery_date) === 'High'
                                    ? 'bg-red-500 text-white'
                                    : getPriority(order.expected_delivery_date) === 'Medium'
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-green-500 text-white'
                                    }`}>
                                    {getPriority(order.expected_delivery_date)}
                                </span>
                            </td>
                            <td className="p-2 border-b">{order.expected_delivery_date}</td>
                            <td className="p-2 border-b text-blue-600 cursor-pointer">
                                {order.orderType === 'client' ? (
                                    <Link
                                        href={route('client-purchase-orders.view', order.id)}
                                        className="text-black hover:underline font-bold"
                                    >
                                        View Details
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('vendor-purchase-orders.view', order.id)}
                                        className="text-black hover:underline font-bold"
                                    >
                                        View Details
                                    </Link>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentOrdersTable;
