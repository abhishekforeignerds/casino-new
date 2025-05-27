// Components/StatusUpdateForm.jsx
import React from 'react';

const StatusUpdateForm = ({
    userRoles,
    purchaseOrder,
    insufficientMaterials,
    data,
    setData,
    errors,
    processing,
    handleSubmit,
    statusOptions,
}) => {
    // Normalize the purchase order status for comparison
    const orderStatus = purchaseOrder.order_status ? purchaseOrder.order_status.trim().toLowerCase() : '';

    // Determine if the form should be rendered
    const shouldRenderForm =
        (userRoles !== 'Production Manager' &&
            orderStatus !== 'initiated' &&
            orderStatus !== 'add_fg' &&
            orderStatus !== 'completed' &&
            orderStatus !== 'dispatched' &&
            orderStatus !== 'add_rm') ||
        (insufficientMaterials.length > 0 && orderStatus !== 'add_rm');
    // console.log('shouldRenderForm')
    // console.log(shouldRenderForm)
    if (!shouldRenderForm) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="styled-form">
            <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* Order Status */}
                <div className="mb-4">
                    <label className="block text-gray-700">Order </label>
                    <select
                        value={data.order_status}
                        onChange={(e) => setData('order_status', e.target.value)}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.order_status && <div className="text-red-600">{errors.order_status}</div>}
                </div>

                {/* Status Reason */}
                <div className="mb-4">
                    <label className="block text-gray-700">Status Reason</label>
                    <input
                        type="text"
                        value={data.status_reason || ''}
                        onChange={(e) => setData('status_reason', e.target.value)}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                        placeholder="Enter Status Reason"
                    />
                    {errors.status_reason && <div className="text-errorRed text-sm">{errors.status_reason}</div>}
                </div>
            </div>

            <div className="">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                >
                    Update Status
                </button>
            </div>

            {/* Hidden input for PUT request */}
            <input type="hidden" name="_method" value="PUT" />
        </form>
    );
};

export default StatusUpdateForm;
