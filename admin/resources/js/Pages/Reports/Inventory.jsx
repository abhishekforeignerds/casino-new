import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import * as XLSX from 'xlsx'; // Import SheetJS for Excel and CSV export
import { jsPDF } from 'jspdf'; // Import jsPDF for PDF export
import 'jspdf-autotable'; // Import autoTable plugin for jsPDF

export default function InventoryReport() {
    const { data, setData, post, processing, errors } = useForm({
        start_date: '',
        end_date: '',
        item_category: '',
        stock_type: '',
        status: '',
    });

    const [reportData, setReportData] = useState([]);
    const [showReport, setShowReport] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('reports.inventory-report'), {
            onSuccess: (response) => {
                setReportData(response.props.inventoryData);
                setShowReport(true);
            },
            onError: (err) => {
                console.error("Error fetching inventory data:", err);
            }
        });
    };

    // Function to export data as an Excel file (.xlsx)
    const exportExcel = () => {
        if (!reportData || reportData.length === 0) return;

        const wsData = [
            ["Material Name", "Stock Quantity", "Unit of Measurement"],
            ...reportData.map(item => [
                item.material_name,
                item.initial_stock_quantity,
                item.unit_of_measurement
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory Report");
        XLSX.writeFile(wb, "inventory_report.xlsx");
    };

    // Function to export data as a CSV file (.csv)
    const exportCSV = () => {
        if (!reportData || reportData.length === 0) return;

        const ws = XLSX.utils.json_to_sheet(reportData, {
            header: ["material_name", "initial_stock_quantity", "unit_of_measurement"]
        });

        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventory_report.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const exportPDF = () => {
        if (!reportData || reportData.length === 0) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Inventory Report", 14, 22);

        const tableColumn = ["Material Name", "Stock Quantity", "Unit of Measurement"];
        const tableRows = [];

        reportData.forEach(item => {
            const rowData = [
                item.material_name,
                item.initial_stock_quantity,
                item.unit_of_measurement
            ];
            tableRows.push(rowData);
        });

        // Add the autoTable to generate the table in the PDF
        doc.autoTable({
            startY: 30,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save("inventory_report.pdf");
    };


    return (
        <AuthenticatedLayout

            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Inventory Report</h2>}>
            <Head title="Inventory Report" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <p className='flex flex-wrap'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /> <Link> Reports & Analytics</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Inventory Reports</span></p>
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg my-6">
                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            <h2 className="mb-6 text-2xl font-bold text-gray-800">Generate Inventory Report</h2>
                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Start Date*</label>
                                        <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                                        {errors.start_date && <div className="text-errorRed text-sm">{errors.start_date}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">End Date*</label>
                                        <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                                        {errors.end_date && <div className="text-errorRed text-sm">{errors.end_date}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Item Category*</label>
                                        <input type="text" value={data.item_category} onChange={(e) => setData('item_category', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder="Select Item Category" />
                                        {errors.item_category && <div className="text-errorRed text-sm">{errors.item_category}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Stock Type</label>
                                        <select value={data.stock_type} onChange={(e) => setData('stock_type', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                                            <option value="">Select Stock Type</option>
                                            <option value="finished_good">Finished Good</option>
                                            <option value="raw_material">Raw Material</option>
                                        </select>
                                        {errors.stock_type && <div className="text-errorRed text-sm">{errors.stock_type}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Stock Status</label>
                                        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                                            <option value="">Select Stock Status</option>
                                            <option value="available">Available</option>
                                            <option value="allocated">Allocated</option>
                                            <option value="low_stock">Low Stock</option>
                                        </select>
                                        {errors.status && <div className="text-errorRed text-sm">{errors.status}</div>}
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4 border-b pb-6">
                                    <button type="submit" disabled={processing} className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800">
                                        Generate Report
                                    </button>
                                    {reportData.length > 0 && (
                                        <div className="flex gap-4 mt-4">
                                            <button onClick={exportExcel} className="px-8 py-2 border border-red text-red rounded hover:bg-zinc-100 transition duration-200 border-btn">
                                                Export Excel
                                            </button>
                                            <button onClick={exportCSV} className="px-8 py-2 border border-red text-red rounded hover:bg-zinc-100 transition duration-200 border-btn">
                                                Export CSV
                                            </button>
                                            <button
                                                onClick={exportPDF}
                                                className="px-8 py-2 border border-red text-red rounded hover:bg-zinc-100 transition duration-200 border-btn"
                                            >
                                                Export PDF
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>

                            {/* Table to display fetched report data */}

                            {showReport && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold">Raw Materials Stock</h3>
                                    <table className="w-full p-6 mt-4">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="p-2 font-semibold text-red">Material Type</th>
                                                <th className="p-2 font-semibold text-red">Available Stock</th>
                                                <th className="p-2 font-semibold text-red">Allocated</th>
                                                <th className="p-2 font-semibold text-red">Unit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.length > 0 ? (
                                                reportData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="p-2 font-bold border-b">{item.material_name}</td>
                                                        <td className="p-2 border-b">{item.initial_stock_quantity} {item.unit_of_measurement}</td>
                                                        <td className="p-2 border-b">{item.initial_stock_quantity - item.plant_allocated_quantity} {item.unit_of_measurement}</td>
                                                        <td className="p-2 border-b">{item.unit_of_measurement}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center p-4">No data found for selected values.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Export Buttons */}

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}