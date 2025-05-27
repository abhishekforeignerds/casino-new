import React from "react";

const PurchaseOrderModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Purchase Order Details</h3>
                    <button onClick={onClose} className="text-red text-2xl">
                        &times;
                    </button>
                </div>
                <div>
                    <p>
                        <strong>PO Number:</strong> {order.po_number}
                    </p>
                    <p>
                        <strong>Client ID:</strong> {order.client_id}
                    </p>
                    <p>
                        <strong>Plant ID:</strong> {order.plant_id}
                    </p>
                    <p>
                        <strong>Order Status:</strong> {order.order_status}
                    </p>
                    <p>
                        <strong>PO Date:</strong> {order.po_date}
                    </p>
                    <p>
                        <strong>Expected Delivery Date:</strong>{" "}
                        {order.expected_delivery_date}
                    </p>
                    {order.status_reason && (
                        <p>
                            <strong>Status Reason:</strong> {order.status_reason}
                        </p>
                    )}
                    {/* Add more details as needed */}
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-red text-white px-4 py-2 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderModal;
