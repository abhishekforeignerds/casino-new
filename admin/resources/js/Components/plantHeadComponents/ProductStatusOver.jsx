import React from "react";
import img1Over from "../../../assets/mat-card-subtitle → Customers (2).png";
import img2Over from "../../../assets/service-icon.png";

const ProductStatusOver = ({ ongoingProds = [] }) => {
    // Group records by PO id and accumulate statuses
    const groupedProds = ongoingProds.reduce((acc, item) => {
        if (!acc[item.po_id]) {
            acc[item.po_id] = { po_id: item.po_id, statuses: [item.status] };
        } else {
            acc[item.po_id].statuses.push(item.status);
        }
        return acc;
    }, {});

    const groupedProdsArray = Object.values(groupedProds);

    // Calculate completion percentage from statuses
    const getCompletionPercentage = (statuses) => {
        const completedCount = statuses.filter(
            (status) => status.toLowerCase() === "completed"
        ).length;
        return Math.round((completedCount / statuses.length) * 100);
    };

    // Define an array of background classes and icons (optional: adjust per your design)
    const backgroundStyles = [
        "bg-lightPurple",
        "bg-LightPink-800",
        "bg-lightGreen",
        "bg-lightBlueSky",
    ];
    const icons = [img1Over, img2Over, img2Over, img1Over];

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-8 flex-1">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-md font-semibold mb-1">
                        Production Status Overview
                    </h2>
                    <p className="text-xs text-gray-600">Work-in-Progress Orders</p>
                </div>
                <select
                    className="border border-gray-300 rounded pe-8 py-1 text-sm"
                    value="Today"
                >
                    <option value="Today">Today</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {groupedProdsArray.map((group, index) => {
                    const percentage = getCompletionPercentage(group.statuses);
                    // Cycle through background styles and icons if more groups exist than available options
                    const bgClass = backgroundStyles[index % backgroundStyles.length];
                    const iconSrc = icons[index % icons.length];

                    return (
                        <div key={group.po_id} className="flex items-center gap-3">
                            <div className={`${bgClass} p-2 rounded-md`}>
                                <img className="max-w-8 w-7" src={iconSrc} alt="" />
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">{group.po_id}</p>
                                <p className="text-xs text-gray-500">
                                    {percentage}% completed
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductStatusOver;
