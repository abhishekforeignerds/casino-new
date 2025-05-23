import React from "react";

const RequestStockModal = ({ material, onClose }) => {
    if (!material) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        Request Stock for {material.item_description}
                    </h3>
                    <button onClick={onClose} className="text-red text-2xl">
                        &times;
                    </button>
                </div>
                <div>
                    <p>
                        <strong>Material Code:</strong> {material.item_code}
                    </p>
                    <p>
                        <strong>Type:</strong> {material.type}
                    </p>
                    <p>
                        <strong>Current Stock:</strong> {material.quantity} {material.unit}
                    </p>
                    <p>
                        <strong>Minimum Threshold:</strong> {material.minimum_threshold}{" "}
                        {material.unit}
                    </p>
                    {/* Additional information as needed */}
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-red text-white px-4 py-2 rounded mr-2"
                    >
                        Cancel
                    </button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded">
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestStockModal;
