import React from "react";
import img1 from "../../assets/mat-card-subtitle → Customers (2).png";
import img2 from '../../assets/service-icon.png'

const MonthlyProductionSummary = () => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-md font-semibold mb-1">Monthly Production Summary</h2>
                    <p className="text-xs text-gray-600">Last Update on 18 October</p>
                </div>
                <button className="border text-gray-600 text-sm py-1 rounded-md px-1">
                    This Month
                </button>
            </div>
            <div className="flex gap-4">

                <div className="flex flex-col gap-3 min-w-[60%]">
                    <div className="flex items-center gap-3">
                        <div className="bg-lightPurple p-2 rounded-md">
                            <img className="max-w-6" src={img1} alt="" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">1200 units</p>
                            <p className="text-xs text-gray-500">Total Units Produced</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-LightPink-800 text-blue-600 p-2 rounded-md">
                            <img src={img2} alt="" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">1500 units</p>
                            <p className="text-xs text-gray-500">Units Increased from Last Month</p>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="relative w-24 h-24">

                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6366F1" />
                                    <stop offset="50%" stopColor="#A855F7" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                            </defs>
                            <circle
                                className="text-gray-200"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                r="16"
                                cx="18"
                                cy="18"
                            />
                            <circle
                                stroke="url(#gradient)"
                                strokeWidth="3"
                                strokeDasharray="75, 100"
                                fill="transparent"
                                r="16"
                                cx="18"
                                cy="18"
                            />
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                            +200
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                        Units Increased from Last Month: +200 units
                    </p>
                </div>
            </div>
            <p className="text-sm text-black-200">
                <span className="font-bold">Summary:</span> This month, production is
                on track, with 1200 units completed out of the 1500 unit target.
            </p>
        </div>
    );
};

export default MonthlyProductionSummary;
