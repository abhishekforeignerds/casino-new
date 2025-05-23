import React from "react";
import POIconVendor from "../../../assets/mat-card-subtitle → Customers (3).png";
import POIconClient from "../../../assets/mat-card-subtitle → Customers (1).png";
import totalRMIcon from "../../../assets/FG in Stock.png";
import totalFGIcon from '../../../assets/Total Finished Goods.png';

const PoUpdatesState = () => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-8 flex-1">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-md font-semibold mb-1">Running POs and Material</h2>
                    <p className="text-xs text-gray-600">Real Production insights</p>
                </div>
            </div>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-lightPurple p-2 rounded-md">
                            <img className="max-w-8 w-7" src={POIconClient} alt="" />
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Client PO</p>
                            <p className="text-xs text-gray-500">70</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-LightPink-800 text-blue-600 p-2 rounded-md">
                            <img src={POIconVendor} alt="" className="max-w-8 w-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Vendor PO</p>
                            <p className="text-xs text-gray-500">5</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-lightGreen text-blue-600 p-2 rounded-md">
                            <img src={totalRMIcon} alt="" className="max-w-8 w-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Total RM</p>
                            <p className="text-xs text-gray-500">500</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-lightBlueSky text-blue-600 p-2 rounded-md">
                            <img src={totalFGIcon} alt="" className="max-w-8 w-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Total FG</p>
                            <p className="text-xs text-gray-500">400</p>
                        </div>
                    </div>
                </div>


        </div>
    );
};

export default PoUpdatesState;
