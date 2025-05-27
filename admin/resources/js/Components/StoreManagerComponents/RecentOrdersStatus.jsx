import React, { useState } from "react";
import img1Over from "../../../assets/mat-card-subtitle → Customers (2).png";
import img2Over from "../../../assets/service-icon.png";
import PurchaseOrderModal from "./PurchaseOrderModal";
import { filterByDate, filterOptions } from "@/Components/FilterUtils";

const RecentOrdersStatus = ({ purchaseorderstable = [] }) => {
    // Array for dynamic styling
    const backgroundStyles = [
        "bg-lightPurple",
        "bg-LightPink-800",
        "bg-lightGreen",
        "bg-lightBlueSky",
    ];
    const icons = [img1Over, img2Over, img2Over, img1Over];

    // Modal state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("today"); // Default: All Time

    const openModal = (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setModalOpen(false);
    };

    // Apply filter to purchase orders
    const filteredOrders = purchaseorderstable.filter(order =>
        filterByDate(order.created_at, selectedFilter)
    );

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-8 flex-1">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-md font-semibold mb-1">Recent Purchase Orders</h2>
                    <p className="text-xs text-gray-600">
                        View Recent PO with their Status
                    </p>
                </div>
                <select
                    className="border border-gray-300 rounded pe-8 py-1 text-sm"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                >
                    {filterOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {filteredOrders.map((order, index) => {
                    // Dynamically assign background and icon based on index
                    const bgClass = backgroundStyles[index % backgroundStyles.length];
                    const iconSrc = icons[index % icons.length];
                    return (
                        <div
                            key={order.id}
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => openModal(order)}
                        >
                            <div className={`${bgClass} p-2 rounded-md`}>
                                <img className="max-w-8 w-7" src={iconSrc} alt="" />
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">#{order.po_number}</p>
                                <p className="text-xs text-gray-500">
                                    Status: {order.order_status}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {modalOpen && (
                <PurchaseOrderModal order={selectedOrder} onClose={closeModal} />
            )}
        </div>
    );
};

export default RecentOrdersStatus;
