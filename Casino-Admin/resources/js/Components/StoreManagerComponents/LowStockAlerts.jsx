// import React, { useState } from "react";
// import { getStatusText, getStatusClass } from "./../../../utils/statusUtils";
// import RequestStockModal from "./RequestStockModal";

// const LowStockAlerts = ({ lowStockRawMaterialstable = [], lowStockFinishGoodtable = [] }) => {
//     // Combine both low stock arrays adding a "type" property to distinguish them.
//     const combinedLowStock = [
//         ...lowStockRawMaterialstable.map(material => ({
//             ...material,
//             type: "Raw Material"
//         })),
//         ...lowStockFinishGoodtable.map(material => ({
//             ...material,
//             type: "Finished Good"
//         }))
//     ];

//     const [selectedMaterial, setSelectedMaterial] = useState(null);
//     const [modalOpen, setModalOpen] = useState(false);

//     const handleRequestStock = (material) => {
//         setSelectedMaterial(material);
//         setModalOpen(true);
//     };

//     const closeModal = () => {
//         setModalOpen(false);
//         setSelectedMaterial(null);
//     };

//     return (
//         <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-4 flex-1 pb-9 min-w-[60%]">
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-md font-semibold mb-1">Low Stock Alerts</h2>
//                 </div>
//                 <select
//                     className="border border-gray-300 rounded pe-8 py-1 text-sm"
//                     defaultValue="Today"
//                 >
//                     <option value="Today">Today</option>
//                 </select>
//             </div>

//             <div>
//                 <table className="w-full p-6 mt-1">
//                     <thead>
//                         <tr className="text-center border-b text-sm">
//                             <th className="p-2 font-semibold text-red">Material Code</th>
//                             <th className="p-2 font-semibold text-red">Type</th>
//                             <th className="p-2 font-semibold text-red">Stock Level</th>
//                             <th className="p-2 font-semibold text-red">Status</th>
//                             <th className="p-2 font-semibold text-red">Action</th>
//                         </tr>
//                     </thead>
//                     <tbody className="text-sm">
//                         {combinedLowStock.map((material) => (
//                             <tr key={material.id}>
//                                 <td className="p-2 font-bold border-b">
//                                     {material.item_code}
//                                 </td>
//                                 <td className="p-2 border-b text-center">{material.type}</td>
//                                 <td className="p-2 border-b text-center">
//                                     {material.quantity} {material.unit}
//                                 </td>
//                                 <td className="p-2 border-b text-center">
//                                     <p
//                                         className={`px-1 py-1 rounded text-xs font-medium ${getStatusClass(
//                                             material.status
//                                         )} min-w-16`}
//                                     >
//                                         {getStatusText(material.status)}
//                                     </p>
//                                 </td>
//                                 <td className="p-2 border-b text-center">
//                                     <button
//                                         onClick={() => handleRequestStock(material)}
//                                         className="text-blue-500 hover:underline"
//                                     >
//                                         Request Stock
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {modalOpen && (
//                 <RequestStockModal material={selectedMaterial} onClose={closeModal} />
//             )}
//         </div>
//     );
// };

// export default LowStockAlerts;
import React, { useState } from "react";
import { getStatusText, getStatusClass } from "./../../../utils/statusUtils";
import RequestStockModal from "./RequestStockModal";
import { filterByDate, filterOptions } from "@/Components/FilterUtils";



const LowStockAlerts = ({ lowStockRawMaterialstable = [], lowStockFinishGoodtable = [] }) => {
    // Combine both low stock arrays adding a "type" property to distinguish them.
    const combinedLowStock = [
        ...lowStockRawMaterialstable.map(material => ({
            ...material,
            type: "Raw Material"
        })),
        ...lowStockFinishGoodtable.map(material => ({
            ...material,
            type: "Finished Good"
        }))
    ];

    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("today"); // Default: All Time

    const handleRequestStock = (material) => {
        setSelectedMaterial(material);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedMaterial(null);
    };

    // Apply date filter based on selected option
    const filteredStock = combinedLowStock.filter(material =>
        filterByDate(material.created_at, selectedFilter)
    );

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-4 flex-1 pb-9 min-w-[60%]">
            <div className="flex justify-between items-center">
                <h2 className="text-md font-semibold mb-1">Low Stock Alerts</h2>
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

            <div>
                <table className="w-full p-6 mt-1">
                    <thead>
                        <tr className="text-center border-b text-sm">
                            <th className="p-2 font-semibold text-red text-left">Material Code</th>
                            <th className="p-2 font-semibold text-red">Type</th>
                            <th className="p-2 font-semibold text-red">Stock Level</th>
                            <th className="p-2 font-semibold text-red">Status</th>
                            <th className="p-2 font-semibold text-red">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredStock.map((material) => (
                            <tr key={material.id}>
                                <td className="p-2 font-bold border-b">
                                    {material.item_code}
                                </td>
                                <td className="p-2 border-b text-center">{material.type}</td>
                                <td className="p-2 border-b text-center">
                                    {material.quantity} {material.unit}
                                </td>
                                <td className="p-2 border-b text-center">
                                    <p
                                        className={`px-1 py-1 rounded text-xs font-medium ${getStatusClass(
                                            material.status
                                        )} min-w-16`}
                                    >
                                        {getStatusText(material.status)}
                                    </p>
                                </td>
                                <td className="p-2 border-b text-center">
                                    <button
                                        onClick={() => handleRequestStock(material)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Request Stock
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <RequestStockModal material={selectedMaterial} onClose={closeModal} />
            )}
        </div>
    );
};

export default LowStockAlerts;
