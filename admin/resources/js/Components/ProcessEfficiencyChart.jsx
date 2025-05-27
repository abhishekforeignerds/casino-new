import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
  } from "recharts";
  
  const data = [
    { name: "Nov 1", time: 1.2 },
    { name: "Nov 2", time: 1.0 },
    { name: "Nov 3", time: 1.5 },
    { name: "Nov 4", time: 1.0 },
    { name: "Nov 5", time: 1.2 },
    { name: "Nov 6", time: 2.0 },
    { name: "Nov 7", time: 2.5 },
  ];
const ProcessEfficiencyChart  = () => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-1 flex-col min-w-[20rem]">
        <strong>Process Efficiency Metrics</strong>
        <div className='flex'>
        <div className="pt-6 max-w-[40%] mr-4">
          <p className="text-xs mb-1">Average Time from PO</p>
          <h4 className="text-sm font-semibold mb-2">2.5 Days</h4>
          <p className="text-xs mb-1 mt-4">Average Time for Material Dispatch</p>
          <h4 className="text-sm font-semibold mb-4">1.2 Days</h4>
        </div>
        <div className="w-full mt-3 flex-1 text-xs">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <Tooltip />
              <Line type="monotone" dataKey="time" stroke="#A43434" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </div>
      </div>
    )
}
export default ProcessEfficiencyChart;