import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { getStatusText, getStatusClass, getInvoiceClass } from "./../../../utils/statusUtils";

const RecentVendorOrdersSummery = ({ orders }) => {
  const plantIds = Object.keys(orders);
  const [selectedPlant, setSelectedPlant] = useState(
    plantIds.length ? plantIds[0] : null
  );
  const [selectedYear, setSelectedYear] = useState("");
  const uniqueYears = [
    ...new Set(
      Object.values(orders)
        .flat()
        .map((order) => new Date(order.created_at).getFullYear())
    ),
  ];
  const selectedOrders = selectedPlant
    ? orders[selectedPlant].filter((order) => {
        const orderYear = new Date(order.created_at).getFullYear();
        return selectedYear === "" || orderYear.toString() === selectedYear;
      })
    : [];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 min-w-[68%] sm:max-w-[70%] overflow-x-auto">
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <h2 className="text-lg font-semibold">Recent Purchase Orders</h2>
        <select
          className="border border-gray-300 rounded pe-8 py-1 text-sm"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Filter by Year</option>
          {uniqueYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-sm text-red">
            <th className="p-2 border-b">PO Number</th>
            <th className="p-2 border-b">PO Date</th>
            <th className="p-2 border-b">Status</th>
            {/* <th className="p-2 border-b">Amount</th> */}
            <th className="p-2 border-b">Delivery Date</th>
            <th className="p-2 border-b">Invoice Status</th>
            <th className="p-2 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {selectedOrders.map((order) => (
            <tr key={order.id} className="text-sm">
              <td className="p-2 border-b font-semibold text-black">
                {order.po_number}
              </td>
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
              <td className="p-2 border-b">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(
                    order.order_status
                  )}`}
                >
                  {order.order_status}
                </span>
              </td>
              {/* <td className="p-2 border-b">Rs {order.amount.toLocaleString()}</td> */}
              <td className="p-2 border-b">
                {order.expected_delivery_date
                  ? new Date(order.expected_delivery_date)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })
                      .replace(/\s/g, "-")
                  : "--------"}
              </td>
              <td className="p-2 border-b">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getInvoiceClass(
                    order.invoice_status
                  )}`}
                >
                  {order.invoice_status || "Not Uploaded"}
                </span>
              </td>
              <td className="p-2 border-b text-gray-600 cursor-pointer">
                <Link
                  href={route("client-purchase-orders.view", order.id)}
                  className="text-black hover:underline"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentVendorOrdersSummery;
