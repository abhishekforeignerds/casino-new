import React from "react";

const MaterialAllocationSummary = ({ allocatedRmtable }) => {
    // Group records by rm_code: Sum allocated_quantity and get the lowest reaining_quantity.
    const groupedData = allocatedRmtable.reduce((acc, item) => {
        const key = item.rm_code;
        if (!acc[key]) {
            acc[key] = {
                rm_code: item.rm_code,
                allocated_quantity: item.allocated_quantity,
                reaining_quantity: item.reaining_quantity,
            };
        } else {
            acc[key].allocated_quantity += item.allocated_quantity;
            acc[key].reaining_quantity = Math.min(
                acc[key].reaining_quantity,
                item.reaining_quantity
            );
        }
        return acc;
    }, {});

    const groupedArray = Object.values(groupedData);

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-4 flex-1 pb-9">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-md font-semibold mb-1">Material Allocation Summary</h2>
                </div>
                <select className="border border-gray-300 rounded pe-8 py-1 text-sm" value="Today">
                    <option value="">Today</option>
                </select>
            </div>

            <div>
                <table className="w-full p-6 mt-1">
                    <thead>
                        <tr className="text-left border-b text-sm">
                            <th className="p-2 font-semibold text-red">Item Code</th>
                            <th className="p-2 font-semibold text-red">Allocated to Production</th>
                            <th className="p-2 font-semibold text-red">Available Stock</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {groupedArray.map((group) => (
                            <tr key={group.rm_code}>
                                <td className="p-2 font-bold border-b">{group.rm_code}</td>
                                <td className="p-2 border-b text-center">{group.allocated_quantity} kg</td>
                                <td className="p-2 border-b text-center">{group.reaining_quantity} kg</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaterialAllocationSummary;
