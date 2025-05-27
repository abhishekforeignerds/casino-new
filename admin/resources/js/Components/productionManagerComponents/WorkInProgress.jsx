import React, { useState, useMemo } from "react";
import { getStatusClass } from "../../../utils/statusUtils";
import { filterOptions, filterByDate } from "@/Components/FilterUtils";

const WorkInProgressTable = ({ productionsOrders = [] }) => {
    const [selectedFilter, setSelectedFilter] = useState("today");

    // Filter orders based on the selected time range
    const filteredOrders = useMemo(() => {
        return productionsOrders.filter(order => filterByDate(order.created_at, selectedFilter));
    }, [productionsOrders, selectedFilter]);

    // Group orders by `po_id`
    const groupedOrders = useMemo(() => {
        const groups = {};
        filteredOrders.forEach(order => {
            const key = order.po_id;
            if (!groups[key]) {
                groups[key] = {
                    po_id: key,
                    statuses: new Set(),
                    codes: [],
                    expectedDates: new Set(),
                };
            }
            groups[key].statuses.add(order.status);
            groups[key].codes.push(order.item_code);
            if (order.expected_prod_complete_date) {
                groups[key].expectedDates.add(order.expected_prod_complete_date);
            }
        });
        return Object.values(groups).map(group => ({
            po_id: group.po_id,
            statuses: Array.from(group.statuses),
            codes: group.codes,
            expectedDates: Array.from(group.expectedDates),
        }));
    }, [filteredOrders]);

    return (
        <div className="bg-white shadow-md rounded-lg p-6 min-w-[68%] sm:max-w-[68%] overflow-x-auto sm:[overflow-x-scroll]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Work-in-Progress (WIP)</h2>
                <select
                    className="border border-gray-300 rounded pe-6 py-1 text-sm"
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

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-sm">
                        <th className="p-2 border-b font-bold text-red">Order Number</th>
                        <th className="p-2 border-b font-bold text-red">Status</th>
                        <th className="p-2 border-b font-bold text-red">Items in Production</th>
                        <th className="p-2 border-b font-bold text-red">Estimated Completion</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedOrders.length > 0 ? (
                        groupedOrders.map(group => (
                            <tr key={group.po_id} className="text-sm">
                                <td className="p-2 border-b">{group.po_id}</td>
                                <td className="p-2 border-b">
                                    {group.statuses.length === 1 ? (
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(group.statuses[0])}`}
                                        >
                                            {group.statuses[0]}
                                        </span>
                                    ) : (
                                        group.statuses.join(', ')
                                    )}
                                </td>
                                <td className="p-2 border-b">{group.codes.join(', ')}</td>
                                <td className="p-2 border-b text-center">
                                    {group.expectedDates.length > 0 ? group.expectedDates.join(', ') : "N/A"}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="p-4 text-center text-gray-500">
                                No records found for the selected filter.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default WorkInProgressTable;
