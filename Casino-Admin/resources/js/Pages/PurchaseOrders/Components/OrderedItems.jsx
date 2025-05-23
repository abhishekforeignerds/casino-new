// Components/OrderedItems.jsx
import React from 'react';

import { getStatusText, getStatusClass } from './../../../../utils/statusUtils';

const OrderedItems = ({ orderedItems, groupedFinishedGoods }) => {
    return (
        <div className='bg-lightGrayTheme p-4 mt-6'>
            <h3 className="text-xl font-semibold text-gray-700">Ordered Items</h3>
            {orderedItems && orderedItems.length > 0 ? (
                <table className="min-w-full bg-white mt-4">
                    <thead>
                        <tr>
                            <th className="px-2 py-3 border-b text-red text-left text-sm">Item Code</th>
                            <th className="px-2 py-3 border-b text-red text-left text-sm">HSN/HAC Code</th>
                            <th className="px-2 py-3 border-b text-red text-left text-sm">Description</th>
                            <th className="px-2 py-3 border-b text-red text-left text-sm">Ordered Quantity</th>
                            <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>

                        </tr>
                    </thead>
                    <tbody>
                        {orderedItems.map((item) => {
                            // Get the finished good key based on item.item_code or any other identifier
                            const finishedGoodKey = item.item_code;
                            const group = groupedFinishedGoods[finishedGoodKey];

                            // Calculate the quantity in pieces if a group exists
                            const totalQuantityRequired = group ? group.total_quantity_required : 0;
                            const quantityInPieces =
                                totalQuantityRequired > 0
                                    ? Math.round((item.quantity / totalQuantityRequired) * 1000)
                                    : 0;

                            return (
                                <tr key={item.id}>
                                    <td className="px-2 py-3 border-b text-sm">{item.item_code || 'N/A'}</td>
                                    <td className="px-2 py-3 border-b text-sm">{item.hsn_sac_code || 'N/A'}</td>
                                    <td className="px-2 py-3 border-b text-sm">{item.item_description || 'N/A'}</td>
                                    <td className="px-2 py-3 border-b text-sm">
                                        {item.quantity || 'N/A'} {item.unit || 'N/A'}
                                    </td>
                                    <td className="px-2 py-3 border-b text-sm">
                                        <span className={`bg-statusRed text-red-500 px-2 py-1 rounded-lg text-xs ${getStatusClass(item.status) || 'N/A'}`}>
                                            {getStatusText(item.status) || 'N/A'}
                                        </span>
                                    </td>


                                </tr>
                            );
                        })}
                    </tbody>
                </table >
            ) : (
                <p>No ordered items found.</p>
            )}
        </div >
    );
};

export default OrderedItems;
