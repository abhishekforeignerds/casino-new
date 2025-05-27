// Components/UnavailableMRP.jsx
import React from 'react';
import { Link, usePage } from '@inertiajs/react';

const UnavailableMRP = ({
    availabilityStatus,
    orderedItems,
    handleProdSubmit,
    groupedFinishedGoods,
    plantfgs,
    data,
    errors,
    insufficientMaterials,
    purchaseOrder,
    userRoles,
    processing,
    isAvailable,
    put,
    handleRequestPr,
}) => {
    // Define a new handler for the raw material request form
    const handleApprove = (e) => {
        e.preventDefault();
        // Build an object mapping material codes to their shortfall quantities:
        const rawMaterials = {};
        insufficientMaterials.forEach(item => {
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
            <form onSubmit={handleProdSubmit}>
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
                                            // Calculate the total RM required
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

                {Array.isArray(data.materials) &&
                    data.materials.length > 0 &&
                    data.materials.map(({ code, value }) => (
                        <input key={code} type="hidden" name={`materials[${code}]`} value={value / 1000} />
                    ))}

                {Array.isArray(data.finished_goods) &&
                    data.finished_goods.length > 0 &&
                    data.finished_goods.map(({ code, value }) => (
                        <input key={code} type="hidden" name={`finished_goods[${code}]`} value={value} />
                    ))}

                {Object.keys(errors).length > 0 && insufficientMaterials.length < 0 && (
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

                {insufficientMaterials.length > 0 && (
                    <div className="bg-red-100 mt-2 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Insufficient Materials:</strong>
                        <ul className="mt-2">
                            {insufficientMaterials.map((item, index) => (
                                <li key={index} className="text-sm">
                                    <span className="font-semibold">{item.code}</span>: Shortfall in {item.source} {item.shortfall} {item.unit}
                                </li>
                            ))}
                        </ul>
                    </div>
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
            </form>

            {/* New form for sending raw_material inputs with key as item.code and value as item.shortfall */}
            {insufficientMaterials.length > 0 && purchaseOrder.order_status === 'add_rm' && (
                <form onSubmit={handleApprove}>
                    {/* ...other form fields... */}
                    {insufficientMaterials.map(item => (
                        <input
                            key={item.code}
                            type="hidden"
                            name={`raw_material[${item.code}]`}
                            value={item.shortfall}
                        />
                    ))}
                    <button className="mt-4 bg-blue-500 text-white px-4 py-2 bg-red rounded hover:bg-blue-600" type="submit">Request RM</button>
                </form>

            )}
        </>
    );
};

export default UnavailableMRP;
