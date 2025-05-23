import React, { useState, useEffect } from "react";
import { Link, usePage } from '@inertiajs/react';
import { getStatusText, getStatusClass } from '../../../utils/statusUtils';

const RecentProductionTable = ({ productionPos }) => {
    // productionPos is an object keyed by plant_id.
    const plantIds = Object.keys(productionPos);
    // Set the first plant id as selected by default.
    const [selectedPlant, setSelectedPlant] = useState(
        plantIds.length ? plantIds[0] : null
    );
    const [selectedYear, setSelectedYear] = useState('');

    // Extract unique years from productionPos based on created_at
    const uniqueYears = [...new Set(
        Object.values(productionPos)
            .flat() // Flatten productionPos array
            .map(order => new Date(order.created_at).getFullYear())
    )];

    // Update selectedOrders based on selectedPlant and selectedYear
    const selectedOrders = selectedPlant
        ? productionPos[selectedPlant].filter(order => {
            const orderYear = new Date(order.created_at).getFullYear();
            return selectedYear === '' || orderYear.toString() === selectedYear;
        })
        : [];

    return (
        <div className="bg-white shadow-md rounded-lg p-6 min-w-[68%] sm:max-w-[68%] overflow-x-auto sm:[overflow-x-scroll]">
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

            {/* Dynamically list plants based on the grouped productionPos */}
            <div className="flex gap-2 mb-4">
                {Object.keys(productionPos).map((plantId) => {
                    const plantName = productionPos[plantId][0]?.plant.plant_name || `Plant ${plantId}`;
                    return (
                        <button
                            key={plantId}
                            className={`px-4 py-2 rounded ${selectedPlant === plantId
                                ? "bg-red text-white"
                                : "bg-gray-100 text-gray-600"
                                }`}
                            onClick={() => setSelectedPlant(plantId)}
                        >
                            {plantName}
                        </button>
                    );
                })}
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
                    {selectedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 text-sm">
                            <td className="p-2 border-b">{order.id}</td>
                            <td className="p-2 border-b">{order.client.name}</td>
                            <td className="p-2 border-b">
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(
                                        order.order_status
                                    )}`}
                                >
                                    {order.order_status === 'production_initiated' ? 'In Progress' : 'Completed'}

                                </span>
                            </td>
                            <td className="p-2 border-b"><span
                                className={`px-2 py-1 rounded text-xs font-medium bg-lightBlue
                               
                                `}
                            >
                                High
                            </span></td>
                            <td className="p-2 border-b">{order.po_date}</td>
                            {/* <td className="p-2 border-b">{order.expected_delivery_date}</td> */}
                            <td className="p-2 border-b text-blue-600 cursor-pointer"><Link
                                href={route('ongoingProduction.index')}
                                className="text-black hover:underline font-bold"
                            >
                                View Details
                            </Link></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentProductionTable;
