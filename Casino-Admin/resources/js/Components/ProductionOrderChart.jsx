import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Oct 07 - Oct 14", current: 125, previous: 63 },
  { name: "Last Week", current: 42, previous: 42 },
];

const ProductionOrderChart = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-1 flex-col min-w-[18rem]">
      {/* Title */}
      <div className="flex justify-between items-center">
        <strong className="text-base font-semibold">Production Orders</strong>
        <span className="text-sm text-green-500 font-medium">+26.5%</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">Last 7 days</p>

      {/* Chart */}
      <div className="w-full mt-3 flex-1 text-xs">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              style={{ fontSize: "12px", fill: "#9a9a9a" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#a43434"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#FFE6E6"
              strokeWidth={2}
              dot={{ r: 4 }}
              // strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legends */}
      <div className="flex justify-between items-center mt-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red rounded-full"></span>
          <span>Oct 07 - Oct 14</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-LightPink-800 rounded-full"></span>
          <span>Last Week</span>
        </div>
      </div>
    </div>
  );
};

export default ProductionOrderChart;
