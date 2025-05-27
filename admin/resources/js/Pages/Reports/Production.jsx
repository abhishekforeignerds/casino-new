import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { FiChevronRight } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function ProductionReport({ finishedGoods }) {
    const { data, setData, post, processing, errors } = useForm({
        start_date: '',
        end_date: '',
        product_type: '',
        status: '',
    });

    const [productionData, setProductionData] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const [fetchError, setFetchError] = useState(false); // New state for fetch errors

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('reports.production-report'), {
            preserveState: true,
            onSuccess: (page) => {
                setProductionData(page.props.productionData);
                setFetchError(false);
                setShowReport(true);
            },
            onError: (err) => {
                console.error("Error fetching production data:", err);
                // Set fetchError to true so we don't display "No data found" message
                setFetchError(true);
                setProductionData([]);
                setShowReport(true);
            }
        });
    };

    // Helper to calculate completion percentage based on created_at and expected_prod_complete_date
    const calculateProductionPercentage = (createdAt, expectedProdCompleteDate) => {
        const start = new Date(createdAt);
        const end = new Date(expectedProdCompleteDate);
        const now = new Date();

        if (now <= start) return 0;
        if (now >= end) return 100;

        const msPerDay = 1000 * 60 * 60 * 24;
        const totalDays = Math.ceil((end - start) / msPerDay);
        const elapsedDays = Math.floor((now - start) / msPerDay);

        return Math.round((elapsedDays / totalDays) * 100);
    };

    // Export production data as an Excel file
    const exportExcel = () => {
        if (!productionData || productionData.length === 0) return;

        const wsData = [
            ["Order ID", "Product Type", "Completion Percentage", "Order Status"],
            ...productionData.map(prod => [
                prod.po_id,
                prod.product_type,
                calculateProductionPercentage(prod.created_at, prod.expected_prod_complete_date) + '%',
                prod.status,
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Production Orders");
        XLSX.writeFile(wb, "production_report.xlsx");
    };

    // Export production data as a CSV file
    const exportCSV = () => {
        if (!productionData || productionData.length === 0) return;

        const formattedData = productionData.map(prod => ({
            order_id: prod.po_id,
            product_type: prod.product_type,
            completion_percentage: calculateProductionPercentage(prod.created_at, prod.expected_prod_complete_date) + '%',
            status: prod.status,
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData, {
            header: ["order_id", "product_type", "completion_percentage", "status"]
        });
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "production_report.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Export production data as a PDF file
    const exportPDF = () => {
        if (!productionData || productionData.length === 0) return;

        const doc = new jsPDF();

        const columns = [
            "Order ID",
            "Product Type",
            "Completion Percentage",
            "Order Status"
        ];

        const rows = productionData.map(prod => [
            prod.po_id,
            prod.product_type,
            calculateProductionPercentage(prod.created_at, prod.expected_prod_complete_date) + '%',
            prod.status,
        ]);

        doc.setFontSize(14);
        doc.text("Production Report", 14, 15);

        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 20,
            styles: { fontSize: 10 },
        });

        doc.save("production_report.pdf");
    };

    // Helper functions for displaying order status
    const getStatusText = (status) => {
        if (status === 'pending') return 'Pending';
        if (status === 'in_progress') return 'In Progress';
        if (status === 'completed') return 'Completed';
        if (status === 'cancelled') return 'Cancelled';
        return 'Unknown';
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'in_progress':
                return 'bg-lightShadeGreen text-green-600';
            case 'completed':
                return 'bg-lightBlue text-blue-600';
            case 'pending':
                return 'bg-red-200 text-red-600';
            case 'cancelled':
                return 'bg-gray-200 text-red';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Production Report</h2>}
        >
            <Head title="Production Report" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <p className='flex flex-wrap'>
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href="#">Reports & Analytics</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className='text-red'> Production Reports</span>
                    </p>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg my-6">
                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            <h2 className="mb-6 text-2xl font-bold text-gray-800">Generate Production Report</h2>

                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Start Date*</label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.start_date && <div className="text-errorRed text-sm">{errors.start_date}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">End Date*</label>
                                        <input
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.end_date && <div className="text-errorRed text-sm">{errors.end_date}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Product Type*</label>
                                        <select
                                            value={data.product_type}
                                            onChange={(e) => setData('product_type', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Product Type</option>
                                            {finishedGoods.map((fg, index) => (
                                                <option key={index} value={fg.material_name}>{fg.material_name}</option>
                                            ))}
                                        </select>
                                        {errors.product_type && <div className="text-errorRed text-sm">{errors.product_type}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Order Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Order Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        {errors.status && <div className="text-errorRed text-sm">{errors.status}</div>}
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4 border-b pb-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Generate Report
                                    </button>

                                    {/* Export Buttons */}
                                    {productionData.length > 0 && (
                                        <div className="flex gap-4 mt-4">
                                            <button
                                                onClick={exportExcel}
                                                className="px-8 py-2 border border-red text-red rounded hover:bg-zinc-100 transition duration-200 border-btn"
                                            >
                                                Export Excel
                                            </button>
                                            <button
                                                onClick={exportCSV}
                                                className="px-8 py-2 border border-red text-red rounded hover:bg-zinc-100 transition duration-200 border-btn"
                                            >
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

                            {/* Conditional Rendering of Report */}
                            {showReport && (
                                <>
                                    {(!fetchError && productionData.length === 0) ? (
                                        <div className="mt-6 text-center p-4">
                                            No data found for selected values.
                                        </div>
                                    ) : productionData.length > 0 ? (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold">Work-in-Progress</h3>
                                            <table className="w-full p-6 mt-4">
                                                <thead>
                                                    <tr className="text-left border-b">
                                                        <th className="p-2 font-semibold text-red">Order ID</th>
                                                        <th className="p-2 font-semibold text-red">Product Type</th>
                                                        <th className="p-2 font-semibold text-red">Completion Percentage</th>
                                                        <th className="p-2 font-semibold text-red">Order Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productionData.map((prod, index) => (
                                                        <tr key={index}>
                                                            <td className="p-2 border-b font-bold">{prod.po_id}</td>
                                                            <td className="p-2 border-b">{prod.item_description}</td>
                                                            <td className="p-2 border-b">
                                                                {prod.status === "completed"
                                                                    ? "100%"
                                                                    : calculateProductionPercentage(prod.created_at, prod.expected_prod_complete_date) + "%"}
                                                            </td>
                                                            <td className="p-2 border-b">
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(prod.status)}`}>
                                                                    {getStatusText(prod.status)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
