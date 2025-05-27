import React from 'react';

const PartialAvailability = ({
    availabilityStatus,
    orderedItems,
    purchaseOrder,
    availableItems,
    insufficientItems,
    groupedFinishedGoods,
    plantfgs,
    isAvailable,
    getStatusClass,
    handlepartialisuefgSubmit,
    handlePartialunavailable,
    handleProdPartialSubmit,
    item_ids,
    rm_item_ids,
    data,
    statusOptions,
    errors,
    setData,
    partialinsufficientMaterials,
    processing,
    userRoles,
    insufficientMaterials,
    put,

}) => {
    // console.log('availabilityStatus')
    // console.log(availabilityStatus)
    if (availabilityStatus !== 'partial') {
        return null;
    }

    // Calculate totals for finished goods and raw materials
    const totalFinishedGoods = {};
    const detailedRawMaterials = {};

    orderedItems.forEach((item) => {
        if (isAvailable(item)) return;
        const fgCode = item.item_code;
        const group = groupedFinishedGoods[fgCode];

        if (group) {
            const plantfg = plantfgs.find((p) => p.item_code === item.item_code);
            const plantAvailableQuantity = plantfg ? plantfg.quantity : 0;
            const plantUnit = plantfg ? plantfg.unit : item.unit;

            if (plantAvailableQuantity < item.quantity) {
                if (!totalFinishedGoods[fgCode]) {
                    totalFinishedGoods[fgCode] = {
                        quantity: 0,
                        plantAvailableQuantity,
                        unit: plantUnit,
                    };
                }
                totalFinishedGoods[fgCode].quantity += item.quantity;

                group.raw_materials.forEach((rm) => {
                    if (!detailedRawMaterials[fgCode]) {
                        detailedRawMaterials[fgCode] = {};
                    }
                    detailedRawMaterials[fgCode][rm.raw_material_code] =
                        (detailedRawMaterials[fgCode][rm.raw_material_code] || 0) +
                        (parseFloat(rm.quantity_required) * (item.quantity - plantAvailableQuantity)) / 1000;
                });
            }
        }
    });

    const handleApprove = (e) => {
        e.preventDefault();
        // Build an object mapping material codes to their shortfall quantities:
        const rawMaterials = {};
        partialinsufficientMaterials.forEach(item => {
            rawMaterials[item.code] = item.shortfall;
        });

        // Merge this into the payload if needed:
        const payload = {
            ...data,
            raw_material: rawMaterials,
        };

        // Use the Inertia put/post request to submit:
        put(route('vendor-purchase-orders.update-status-new', purchaseOrder.id), payload, {
            // onSuccess: () => // console.log('Approved successfully'),
            // onError: () => // console.log('Error approving'),
        });
    };
    return (
        <>
            {orderedItems.length > 0 ? (
                <>
                    {(purchaseOrder.order_status === 'pending_for_approval' ||
                        purchaseOrder.order_status === 'initiated' ||
                        purchaseOrder.order_status === 'on_hold' ||
                        purchaseOrder.order_status === 'release_initiated' ||
                        purchaseOrder.order_status === 'insufficient_fg' ||
                        purchaseOrder.order_status === 'add_fg' ||
                        purchaseOrder.order_status === 'added_fg' ||
                        purchaseOrder.order_status === 'add_rm') && (
                            <>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2 mt-4">
                                    Available Items
                                </h3>
                                <form onSubmit={handlepartialisuefgSubmit}>
                                    {availableItems.map((item) => (
                                        <input key={item.id} type="hidden" name="item_ids[]" value={item.id} />
                                    ))}
                                    <table className="min-w-full bg-white mt-4 border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="px-2 py-3 border-b text-sm text-left">Item Code</th>
                                                <th className="px-2 py-3 border-b text-sm text-left">Quantity</th>
                                                <th className="px-2 py-3 border-b text-sm text-left">Description</th>
                                                <th className="px-2 py-3 border-b text-sm text-left">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderedItems
                                                .filter((item) => isAvailable(item))
                                                .map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-2 py-3 border-b text-sm">
                                                            {item.item_code || 'N/A'}
                                                        </td>
                                                        <td className="px-2 py-3 border-b text-sm">
                                                            {item.quantity} {item.unit}
                                                        </td>
                                                        <td className="px-2 py-3 border-b text-sm">
                                                            {item.item_description} pieces
                                                        </td>
                                                        <td className={`px-2 py-3 border-b text-sm ${getStatusClass(item.status)}`}>
                                                            <span>{(item.status)}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                    {/* Hide the button if any available item is "in_progress" */}
                                    {!availableItems.some(item => (item.status === 'in_progress' || item.status === 'account_referred' || item.status === 'ready_dispatched' || item.status === 'dispatched')) && (
                                        <button type="submit" className="block max-w-max px-4 py-2 font-normal uppercase text-sm text-white bg-red rounded hover:bg-red-800">
                                            Issue FG
                                        </button>
                                    )}
                                    {availableItems.some(item => item.status === 'in_progress') && (
                                        <button type="submit" className="block max-w-max px-4 py-2 font-normal uppercase text-sm text-white bg-red rounded hover:bg-red-800">
                                            Refer For Invoice
                                        </button>
                                    )}
                                    {availableItems.some(item => item.status === 'account_referred') && (
                                        <button type="submit" className="block max-w-max px-4 py-2 font-normal uppercase text-sm text-white bg-red rounded hover:bg-red-800">
                                            Ready To Dispatch
                                        </button>
                                    )}
                                    {availableItems.some(item => item.status === 'ready_dispatched') && (
                                        <button type="submit" className="block max-w-max px-4 py-2 font-normal uppercase text-sm text-white bg-red rounded hover:bg-red-800">
                                            Dispatch
                                        </button>
                                    )}
                                </form>

                            </>
                        )}

                    {(purchaseOrder.order_status === 'initiated' ||
                        purchaseOrder.order_status === 'on_hold' ||
                        purchaseOrder.order_status === 'release_initiated' ||
                        purchaseOrder.order_status === 'insufficient_fg' ||
                        purchaseOrder.order_status === 'add_fg' ||
                        purchaseOrder.order_status === 'add_rm') &&
                        insufficientItems.length > 0 && (
                            <div className="bg-lightGrayTheme p-4 mt-6">
                                <h3 className="text-xl font-semibold text-gray-700">
                                    Production Calculation for Insufficient Items
                                </h3>
                                <table className="min-w-full bg-white mt-4 border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-3 border-b text-sm text-left">FG Item Code</th>
                                            <th className="px-2 py-3 border-b text-sm text-left">FG Ordered Quantity</th>
                                            <th className="px-2 py-3 border-b text-sm text-left">FG Required</th>
                                            <th className="px-2 py-3 border-b text-sm text-left">RM Item Code</th>
                                            <th className="px-2 py-3 border-b text-sm text-left">RM Required</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const totalFinishedGoods = {};
                                            const detailedRawMaterials = {};

                                            orderedItems.forEach((item) => {
                                                if (isAvailable(item)) return;
                                                const fgCode = item.item_code;
                                                const group = groupedFinishedGoods[fgCode];

                                                if (group) {
                                                    const plantfg = plantfgs.find((p) => p.item_code === item.item_code);
                                                    const plantAvailableQuantity = plantfg ? plantfg.quantity : 0;
                                                    const plantUnit = plantfg ? plantfg.unit : item.unit;

                                                    if (plantAvailableQuantity < item.quantity) {
                                                        if (!totalFinishedGoods[fgCode]) {
                                                            totalFinishedGoods[fgCode] = {
                                                                quantity: 0,
                                                                plantAvailableQuantity,
                                                                unit: plantUnit,
                                                            };
                                                        }
                                                        totalFinishedGoods[fgCode].quantity += item.quantity;

                                                        group.raw_materials.forEach((rm) => {
                                                            if (!detailedRawMaterials[fgCode]) {
                                                                detailedRawMaterials[fgCode] = {};
                                                            }
                                                            // **FIXED: Properly calculate the total RM required**
                                                            detailedRawMaterials[fgCode][rm.raw_material_code] =
                                                                (detailedRawMaterials[fgCode][rm.raw_material_code] || 0) +
                                                                (parseFloat(rm.quantity_required) * (item.quantity - plantAvailableQuantity)) / 1000;
                                                        });


                                                    }
                                                }
                                            });

                                            return Object.entries(totalFinishedGoods).map(([fgCode, dataObj]) =>
                                                Object.entries(detailedRawMaterials[fgCode] || {}).map(([rmCode, total], index) => (
                                                    <tr key={`${fgCode}-${rmCode}`}>
                                                        {index === 0 && (
                                                            <>
                                                                <td
                                                                    className="px-2 py-3 border-b text-sm"
                                                                    rowSpan={Object.keys(detailedRawMaterials[fgCode]).length}
                                                                >
                                                                    {fgCode}
                                                                </td>
                                                                <td
                                                                    className="px-2 py-3 border-b text-sm"
                                                                    rowSpan={Object.keys(detailedRawMaterials[fgCode]).length}
                                                                >
                                                                    {dataObj.quantity} {dataObj.unit}
                                                                </td>
                                                            </>
                                                        )}
                                                        <td
                                                            className="px-2 py-3 border-b text-sm"
                                                            rowSpan={Object.keys(detailedRawMaterials[fgCode]).length}
                                                        >
                                                            {dataObj.quantity - dataObj.plantAvailableQuantity} {dataObj.unit}
                                                        </td>
                                                        <td className="px-2 py-3 border-b text-sm">{rmCode}</td>
                                                        <td className="px-2 py-3 border-b text-sm">{total.toFixed(2)} Kgs</td>
                                                    </tr>
                                                ))
                                            );
                                        })()}
                                    </tbody>
                                </table>
                                {(
                                    (purchaseOrder.order_status !== 'initiated' &&
                                        purchaseOrder.order_status !== 'add_fg' &&
                                        purchaseOrder.order_status !== 'add_rm' && purchaseOrder.order_status !== 'completed') ||
                                    (partialinsufficientMaterials.length > 0 && purchaseOrder.order_status !== 'add_rm')
                                ) && (
                                        <>
                                            <form onSubmit={handlePartialunavailable}>
                                                {insufficientItems.map((item) => (
                                                    <input key={item.id} type="hidden" name="rm_item_ids[]" value={item.id} />
                                                ))}

                                                <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                                    {/* Order Status */}
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700">Order Status</label>
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
                                                <button type="submit" className="block max-w-max px-4 py-2 font-normal uppercase text-sm text-white bg-red rounded hover:bg-red-800">
                                                    Update Status
                                                </button>
                                            </form>
                                        </>
                                    )}



                                <form onSubmit={handleProdPartialSubmit}>


                                    {/* {Object.entries(totalFinishedGoods).map(([fgCode, dataObj], index) => (
                                        <React.Fragment key={`fg-${fgCode}`}>
                                            <input
                                                type="hidden"
                                                name={`partials_finished_goods[${index}][code]`}
                                                value={fgCode}
                                            />
                                            <input
                                                type="hidden"
                                                name={`partials_finished_goods[${index}][value]`}
                                                value={dataObj.quantity}
                                            />
                                        </React.Fragment>
                                    ))}


                                    {Object.entries(detailedRawMaterials).flatMap(([fgCode, materials], outerIndex) =>
                                        Object.entries(materials).map(([rmCode, total], innerIndex) => (
                                            <React.Fragment key={`rm-${fgCode}-${rmCode}`}>
                                                <input
                                                    type="hidden"
                                                    name={`partials_materials[${outerIndex}-${innerIndex}][code]`}
                                                    value={rmCode}
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`partials_materials[${outerIndex}-${innerIndex}][value]`}
                                                    value={total.toFixed(2)}
                                                />
                                            </React.Fragment>
                                        ))
                                    )} */}

                                    {Array.isArray(data.partial_materials) &&
                                        data.partial_materials.length > 0 &&
                                        data.partial_materials.map(({ code, value }) => (
                                            <input key={code} type="hidden" name={`partial_materials[${code}]`} value={value / 1000} />
                                        ))}

                                    {Array.isArray(data.partial_finished_goods) &&
                                        data.partial_finished_goods.length > 0 &&
                                        data.partial_finished_goods.map(({ code, value }) => (
                                            <input key={code} type="hidden" name={`partial_finished_goods[${code}]`} value={value} />
                                        ))}




                                    {Object.keys(errors).length > 0 && partialinsufficientMaterials.length < 0 && (
                                        <div className="bg-red-100 text-red-600 p-2 rounded mb-4">
                                            <strong>Error:</strong>
                                            <ul className="mt-1">
                                                {Object.entries(errors).map(([field, message]) => (
                                                    <li key={field} className="text-sm">
                                                        {message}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {partialinsufficientMaterials.length > 0 && (
                                        <div className="bg-red-100 mt-2 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                            <strong className="font-bold">Insufficient Materials:</strong>
                                            <ul className="mt-2">
                                                {partialinsufficientMaterials.map((item, index) => (
                                                    <li key={index} className="text-sm">
                                                        <span className="font-semibold">{item.code}</span>: Shortfall in {item.source} {item.shortfall} {item.unit}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {(purchaseOrder.order_status === 'add_rm') &&
                                        (userRoles[0] === 'Store Manager' || userRoles[0] === 'Super Admin') && (
                                            <button
                                                type="submit"
                                                disabled={processing || purchaseOrder.order_status === 'initiated'}
                                                className="mt-4 bg-blue-500 text-white px-4 py-2 bg-red rounded hover:bg-blue-600"
                                            >
                                                {processing
                                                    ? 'Processing...'
                                                    : purchaseOrder.order_status === 'initiated'
                                                        ? 'Production is initiated'
                                                        : 'Check Requirements'}
                                            </button>
                                        )}
                                    {(purchaseOrder.order_status === 'add_fg') &&
                                        (userRoles[0] === 'Production Manager' || userRoles[0] === 'Super Admin') && (
                                            <button
                                                type="submit"
                                                disabled={processing || purchaseOrder.order_status === 'initiated'}
                                                className="mt-4 bg-blue-500 text-white bg-red px-4 py-2 rounded hover:bg-red-700"
                                            >
                                                {processing
                                                    ? 'Processing...'
                                                    : purchaseOrder.order_status === 'initiated'
                                                        ? 'Production is initiated'
                                                        : 'Initiate Production'}
                                            </button>
                                        )}
                                </form>
                            </div>
                        )}

                    {partialinsufficientMaterials.length > 0 && purchaseOrder.order_status === 'add_rm' && (
                        <form onSubmit={handleApprove}>
                            {/* ...other form fields... */}
                            {partialinsufficientMaterials.map(item => (
                                <input
                                    key={item.code}
                                    type="hidden"
                                    name={`raw_material[${item.code}]`}
                                    value={item.shortfall}
                                />
                            ))}
                            <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 bg-red rounded hover:bg-blue-600" >Request RM</button>
                        </form>

                    )}
                </>
            ) : (
                <p>No ordered items found.</p>
            )}
        </>
    );
};

export default PartialAvailability;
