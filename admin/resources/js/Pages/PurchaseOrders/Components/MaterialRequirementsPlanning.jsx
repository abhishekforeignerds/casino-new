// Components/MaterialRequirementsPlanning.jsx
import React from 'react';
import UnavailableMRP from './UnavailableMRP';
import PartialAvailability from './PartialAvailability';

const MaterialRequirementsPlanning = ({
    orderedItems,
    purchaseOrder,
    plantfgs,
    groupedFinishedGoods,
    getStatusText,
    getStatusClass,
    handleProdSubmit,
    handlepartialisuefgSubmit,
    handlePartialunavailable,
    handleProdPartialSubmit,
    data,
    errors,
    insufficientMaterials,
    partialinsufficientMaterials,
    processing,
    userRoles,
    availabilityStatus,
    availableItems,
    isAvailable,
    insufficientItems,
    item_ids,
    rm_item_ids,
    statusOptions,
    setData,
    put,
    handleRequestPr
}) => {
    if (!orderedItems || orderedItems.length === 0) {
        return <p>No ordered items found.</p>;
    }

    // Determine if the purchase order is in a status that needs stock comparisons.
    const isPendingStatus =
        purchaseOrder.order_status === 'pending_for_approval' ||
        purchaseOrder.order_status === 'initiated' ||
        purchaseOrder.order_status === 'on_hold' ||
        purchaseOrder.order_status === 'release_initiated' ||
        purchaseOrder.order_status === 'insufficient_fg' ||
        purchaseOrder.order_status === 'add_fg' ||
        purchaseOrder.order_status === 'added_fg' ||
        purchaseOrder.order_status === 'add_rm';

    // Check if any ordered item is unavailable.
    const hasUnavailable =
        (purchaseOrder.order_status === 'initiated' ||
            purchaseOrder.order_status === 'on_hold' ||
            purchaseOrder.order_status === 'release_initiated' ||
            purchaseOrder.order_status === 'insufficient_fg' ||
            purchaseOrder.order_status === 'add_fg' ||
            purchaseOrder.order_status === 'add_rm') &&
        orderedItems.some((item) => {
            const plantfg = plantfgs.find((p) => p.item_code === item.item_code);
            const plantAvailableQuantity = plantfg ? plantfg.quantity : 0;
            const plantAvailableQuantityUnit = plantfg ? plantfg.unit : '';

            const finishedGood = groupedFinishedGoods[item.item_code];
            const gramsPerPiece = finishedGood ? finishedGood.total_quantity_required : 1;

            const orderedQuantityInPieces =
                item.unit === 'kg'
                    ? Math.round((item.quantity * 1000) / gramsPerPiece)
                    : Math.round(item.quantity);

            const plantAvailableQuantityInPieces =
                plantAvailableQuantityUnit === 'kg'
                    ? Math.round((plantAvailableQuantity * 1000) / gramsPerPiece)
                    : Math.round(plantAvailableQuantity);

            return plantAvailableQuantityInPieces < orderedQuantityInPieces;
        });

    return (
        <>
            {isPendingStatus && orderedItems.length > 0 ? (
                <>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2 mt-4">Material Resource Planning</h3>
                    <table className="min-w-full bg-white mt-4">
                        <thead>
                            <tr>
                                <th className="px-2 py-3 border-b text-red text-left text-sm">FG Item Code</th>
                                <th className="px-2 py-3 border-b text-red text-left text-sm">FG Item Description</th>
                                <th className="px-2 py-3 border-b text-red text-left text-sm">Curr. FG Stock</th>
                                <th className="px-2 py-3 border-b text-red text-left text-sm">More FG Required </th>
                                <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody>


                            {orderedItems
                                .filter(item => item.status !== 'in_progress')
                                .map((item) => {
                                    const plantfg = plantfgs.find((p) => p.item_code === item.item_code);
                                    const plantAvailableQuantity = plantfg ? plantfg.quantity : 0;
                                    const plantAvailableQuantityUnit = plantfg ? plantfg.unit : '';
                                    const finishedGood = groupedFinishedGoods[item.item_code];
                                    const gramsPerPiece = finishedGood ? finishedGood.total_quantity_required : 1;

                                    const orderedQuantity = Math.round(item.quantity);
                                    const remainingQuantity = Math.max(orderedQuantity - plantAvailableQuantity, 0);

                                    // Format the remaining quantity in the Indian number format
                                    const formattedRemainingQuantity = remainingQuantity.toLocaleString('en-IN');

                                    const status = plantAvailableQuantity >= orderedQuantity ? 'Available' : 'Unavailable';
                                    const statusClass = getStatusClass(status);


                                    return (
                                        <tr key={item.id}>
                                            <td className="px-2 py-3 border-b text-sm">
                                                {item.item_code || 'N/A'}
                                            </td>
                                            <td className="px-2 py-3 border-b text-sm">
                                                {item.item_description || 'N/A'}
                                            </td>
                                            <td className="px-2 py-3 border-b text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 ${statusClass}`}
                                                >
                                                    {plantAvailableQuantity} {item.unit}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 border-b text-sm">
                                                {formattedRemainingQuantity || 'N/A'} {item.unit}
                                            </td>
                                            <td className="px-2 py-3 border-b text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass}`}>
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}

                        </tbody>
                    </table>
                </>
            ) : (
                <div className="mt-4 text-green-600 font-semibold text-center"></div>
            )}

            {hasUnavailable && (
                <div className="bg-lightGrayTheme p-4 mt-6">

                    {availabilityStatus == 'all_unavailable' && (
                        <>


                            <UnavailableMRP
                                availabilityStatus={availabilityStatus}
                                orderedItems={orderedItems}
                                handleProdSubmit={handleProdSubmit}
                                groupedFinishedGoods={groupedFinishedGoods}
                                plantfgs={plantfgs}
                                data={data}
                                errors={errors}
                                insufficientMaterials={insufficientMaterials}
                                purchaseOrder={purchaseOrder}
                                userRoles={userRoles}
                                processing={processing}
                                isAvailable={isAvailable}
                                put={put}
                                handleRequestPr={handleRequestPr}
                            />
                        </>
                    )}
                    {availabilityStatus == 'partial' && (
                        <PartialAvailability
                            availabilityStatus={availabilityStatus}
                            orderedItems={orderedItems}
                            handleProdSubmit={handleProdSubmit}
                            handlepartialisuefgSubmit={handlepartialisuefgSubmit}
                            handlePartialunavailable={handlePartialunavailable}
                            handleProdPartialSubmit={handleProdPartialSubmit}
                            groupedFinishedGoods={groupedFinishedGoods}
                            plantfgs={plantfgs}
                            data={data}
                            errors={errors}
                            insufficientMaterials={insufficientMaterials}
                            partialinsufficientMaterials={partialinsufficientMaterials}
                            purchaseOrder={purchaseOrder}
                            userRoles={userRoles}
                            processing={processing}
                            availableItems={availableItems}
                            isAvailable={isAvailable}
                            getStatusClass={getStatusClass}
                            insufficientItems={insufficientItems}
                            item_ids={item_ids}
                            rm_item_ids={rm_item_ids}
                            statusOptions={statusOptions}
                            setData={setData}
                            put={put}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default MaterialRequirementsPlanning;
