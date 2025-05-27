import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import * as XLSX from 'xlsx'; // Import SheetJS library
import { Link, usePage } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { jsPDF } from 'jspdf'; // Import jsPDF for PDF export
import 'jspdf-autotable'; // Import autoTable plugin for jsPDF
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';


// const getStatusText = (order_status) => {
//     if (order_status === 'accepted') return 'Accepted';
//     if (order_status === 'fulfilled') return 'Fulfilled';
//     if (order_status === 'pending') return 'Pending';
//     if (order_status === 'rejected') return 'Rejected';
//     if (order_status === 'on_hold') return 'On Hold';
//     if (order_status === 'initiated') return 'Initiated';
//     if (order_status === 'cancelled') return 'Cancelled';
//     return 'Unknown Status';
// };
// const getStatusClass = (order_status) => {
//     switch (order_status) {
//         case 'accepted':
//             return 'bg-lightShadeGreen text-green-600 text-green';
//         case 'fulfilled':
//             return 'bg-lightShadeGreen text-green-600 text-green';
//         case 'pending':
//             return 'bg-lightYellow text-green-600 text-red';
//         case 'rejected':
//             return 'bg-statusRed text-red-600 text-red';
//         case 'cancelled':
//             return 'bg-gray-200 text-red';
//         default:
//             return 'bg-gray-100 text-gray-600';
//     }
// };

export default function PoReport() {
    const { data, setData, post, processing, errors } = useForm({
        start_date: '',
        end_date: '',
        po_type: '',
        status: '',
    });

    const { auth } = usePage().props;
    const user = usePage().props.auth.user;

    const currentPath = window.location.pathname;

    // Flatten all links from all sections into one array.

    const userRoles = auth?.user?.roles || [];
    const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);

    const exportPDF = () => {
        if (!podata || podata.length === 0) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("PO Report", 14, 22);

        // Define table columns
        const tableColumn = ["PO Number", "Client ID", "Client Name", "PO Date", "Delivery Date", "Order Status"];
        const tableRows = [];

        // Prepare rows using podata
        podata.forEach(po => {
            const rowData = [
                po.po_number,
                po.client_id,
                po.client.name,
                po.po_date,
                po.expected_delivery_date,
                getStatusText(po.order_status)
            ];
            tableRows.push(rowData);
        });

        // Generate the table in the PDF
        doc.autoTable({
            startY: 30,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save("po_report.pdf");
    };

    const [podata, setPoData] = useState([]);
    const [showReport, setShowReport] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('reports.po-report'), {
            preserveState: true,
            onSuccess: (page) => {
                setPoData(page.props.podata);
                setShowReport(true);
            },
            onError: (err) => {
                console.error("Error fetching PO data:", err);
            }
        });
    };

    // Function to export data as an Excel file (.xlsx)
    const exportExcel = () => {
        if (!podata || podata.length === 0) return;

        const wsData = [
            ["PO Number", "Client Name", "Order Status", "PO Date", "Delivery Date"],
            ...podata.map(po => [
                po.po_number,
                po.client.name,
                po.order_status,
                po.po_date,
                po.expected_delivery_date,
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Purchase Orders");
        XLSX.writeFile(wb, "purchase_order_report.xlsx");
    };

    // Function to export data as a CSV file (.csv)
    const exportCSV = () => {
        if (!podata || podata.length === 0) return;

        // Map podata to include a client_name property extracted from the nested client object
        const formattedData = podata.map(po => ({
            po_number: po.po_number,
            client_name: po.client ? po.client.name : '', // flatten nested client name
            po_date: po.po_date,
            expected_delivery_date: po.expected_delivery_date,
            order_status: po.order_status
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData, {
            header: ["po_number", "client_name", "po_date", "expected_delivery_date", "order_status"]
        });

        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "purchase_order_report.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };





    return (
        <AuthenticatedLayout

            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Purchase Order Report</h2>}>
            <Head title="Purchase Order Report" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <p className='flex flex-wrap'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /> <Link> Reports & Analytics</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'> Purchase Order  Reports</span></p>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg my-6">
                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            <h2 className="mb-6 text-2xl font-bold text-gray-800">Generate Purchase Order Report</h2>

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
                                    {userRoles[0] == 'Super Admin' && (
                                        <div className="mb-4">
                                            <label className="block text-gray-700">Vendor / Client*</label>
                                            <select
                                                value={data.po_type}
                                                onChange={(e) => setData('po_type', e.target.value)}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            >
                                                <option value="">Select Vendor/Client</option>
                                                <option value="vendor">Vendor</option>
                                                <option value="client">Client</option>
                                            </select>
                                            {errors.po_type && <div className="text-errorRed text-sm">{errors.po_type}</div>}
                                        </div>
                                    )}
                                    {userRoles[0] != 'Super Admin' && (

                                        <div className="mb-4">
                                            {userRoles[0] != 'Vendor' && (
                                                <label className="block text-gray-700">Vendor*</label>
                                            )}
                                            {userRoles[0] != 'Client' && (
                                                <label className="block text-gray-700">Client*</label>
                                            )}

                                            <select
                                                value={data.po_type}
                                                onChange={(e) => setData('po_type', e.target.value)}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            >
                                                {userRoles[0] != 'Vendor' && (
                                                    <option value="">Select Vendor</option>
                                                )}
                                                {userRoles[0] != 'Client' && (
                                                    <option value="">Select Client</option>
                                                )}

                                                {userRoles[0] != 'Vendor' && (
                                                    <option value="vendor">Vendor</option>
                                                )}
                                                {userRoles[0] != 'Client' && (
                                                    <option value="client">Client</option>
                                                )}


                                            </select>
                                            {errors.po_type && <div className="text-errorRed text-sm">{errors.po_type}</div>}
                                        </div>
                                    )}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Order Status*</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Order Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected or Cancelled</option>
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
                                    {podata.length > 0 && (
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

                            {/* Table to display fetched PO report data */}
                            {showReport && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold">Client Purchase Order</h3>
                                    <table className="w-full p-6 mt-4">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="p-2 font-semibold text-red">PO Number</th>
                                                <th className="p-2 font-semibold text-red">Client Name</th>

                                                <th className="p-2 font-semibold text-red">PO Date</th>
                                                <th className="p-2 font-semibold text-red">Delivery Date</th>
                                                <th className="p-2 font-semibold text-red">Order Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {podata.length > 0 ? (
                                                podata.map((po, index) => (
                                                    <tr key={index}>
                                                        <td className="p-2 border-b font-bold">{po.po_number}</td>
                                                        <td className="p-2 border-b">{po.client.name}</td>
                                                        {/* <td className="p-2 border-b">{po.po_date ? new Date(po.po_date).toLocaleDateString('en-IN') : 'N/A'}</td> */}
                                                        <td className="py-3 border-b">
                                                            {new Date(po.po_date).toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "2-digit",
                                                            }).replace(/\s/g, "-")}
                                                        </td>
                                                        <td className="p-2 border-b">
                                                            {/* {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString('en-IN') : 'N/A'} */}
                                                            {new Date(po.expected_delivery_date).toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "2-digit",
                                                            }).replace(/\s/g, "-")}</td>
                                                        <td className="p-2 border-b">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(po.order_status)}`}
                                                            >
                                                                {getStatusText(po.order_status)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center p-4">No data found for selected values.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>


                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
