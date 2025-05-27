import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function View({ purchaseOrder, orderedItems, plantDetails, plantfgs, groupedFinishedGoods }) {
    const getStatusClass = (status) => {
        switch (status) {
            case 'Available':
                return 'bg-lightShadeGreen text-green-600 text-green';
            case 'Unavailable':
                return 'bg-lightYellow text-green-600 text-statusYellow';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };
    const { data, setData, put, processing, errors } = useForm({
        order_status: purchaseOrder.order_status,
        status_reason: purchaseOrder.status_reason,
    });
    const orderStatusOptions = ['pending', 'completed', 'initiated', 'cancelled', 'on_hold', 'rejected'];
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('vendor-purchase-orders.update-status', purchaseOrder.id));
    };
    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    View Purchase Order
                </h2>
            }
        >
            <Head title="View Purchase Order" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'>
                        <Link href={route('dashboard')}>Dashboard</Link> <FiChevronRight size={24} color="black" /><Link href={route('vendor-purchase-orders.index')}>Vendor Purchase Orders</Link>  <FiChevronRight size={24} color="black" />
                        <span className='text-red'>View Purchase Order</span>
                    </p>

                    <Link
                        href={route('vendor-purchase-orders.index')}  // Adjust path as needed
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>

                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg min-h-[80vh]">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='mb-6 text-2xl font-bold text-gray-800'>Purchase Order Details</h2>
                            </div>

                            {/* Purchase Order Details Section */}
                            <div className='bg-lightGrayTheme p-4'>
                                <h3 className="text-xl font-semibold text-gray-700">Purchase Order Information</h3>
                                <div className="mb-2 flex items-center gap-1">
                                    <h3 className="text-lg font-semibold text-gray-700">PO Number:</h3>
                                    <p className="text-gray-600">{purchaseOrder.po_number || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <h3 className="text-lg font-semibold text-gray-700">Client:</h3>
                                    <p className="text-gray-600">{purchaseOrder.client.name || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <h3 className="text-lg font-semibold text-gray-700">PO Date:</h3>
                                    <p className="text-gray-600">
                                        {purchaseOrder.po_date
                                            ? new Date(purchaseOrder.po_date)
                                                .toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "2-digit",
                                                })
                                                .replace(/\s/g, "-")
                                            : "N/A"}
                                    </p>

                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <h3 className="text-lg font-semibold text-gray-700">Status:</h3>
                                    <p className="text-gray-600">{purchaseOrder.order_status || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Ordered Items Section */}
                            <div className='bg-lightGrayTheme p-4 mt-6'>
                                <h3 className="text-xl font-semibold text-gray-700">Ordered Items</h3>
                                {orderedItems.length > 0 ? (
                                    <table className="min-w-full bg-white mt-4">
                                        <thead>
                                            <tr>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Item Code</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Description</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Quantity in Kgs</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Quantity in pieces</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderedItems.map((item) => {
                                                // Get the finished good key based on item.item_code or any other identifier
                                                const finishedGoodKey = item.item_code;  // You might need to adapt this based on your data structure
                                                const group = groupedFinishedGoods[finishedGoodKey];

                                                // If the group exists, calculate the quantity in pieces and then convert it to grams
                                                const totalQuantityRequired = group ? group.total_quantity_required : 0;
                                                const quantityInPieces = totalQuantityRequired > 0
                                                    ? Math.round((item.quantity / totalQuantityRequired) * 1000)  // Convert to pieces and round to the nearest integer
                                                    : 0;

                                                return (
                                                    <tr key={item.id}>
                                                        <td className="px-2 py-3 border-b text-sm">{item.item_code || 'N/A'}</td>
                                                        <td className="px-2 py-3 border-b text-sm">{item.item_description || 'N/A'}</td>
                                                        <td className="px-2 py-3 border-b text-sm">{item.quantity || 'N/A'} {item.unit || 'N/A'}</td>
                                                        <td className="px-2 py-3 border-b text-sm">{quantityInPieces} pieces</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No ordered items found.</p>
                                )}

                            </div>


                            {/* Plant Details Section */}

                            <div className='bg-lightGrayTheme p-4 mt-6'>
                                <h3 className="text-xl font-semibold text-gray-700">Plant Details</h3>
                                <h3 className="text-xl font-semibold text-gray-700">Address : {plantDetails?.city || 'N/A'} {plantDetails?.state || 'N/A'} {plantDetails?.address || 'N/A'} - {plantDetails?.zip || 'N/A'} {plantDetails?.country || 'N/A'} </h3>
                                {plantfgs.length > 0 ? (
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Plant ID</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Item Code</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Item Description</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">HSN/SAC Code</th>
                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Available Quantity (Kgs)</th>

                                                <th className="px-2 py-3 border-b text-red text-left text-sm">Available Quantity (pieces)</th> {/* New column */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {plantfgs.map((plantfg) => {
                                                // Assuming you have access to the grouped finished goods data
                                                const finishedGoodKey = plantfg.item_code;  // You might need to use the correct key here
                                                const group = groupedFinishedGoods[finishedGoodKey];

                                                const totalQuantityRequired = group ? group.total_quantity_required : 0;
                                                const quantityInPieces = totalQuantityRequired > 0
                                                    ? Math.round((plantfg.quantity / totalQuantityRequired) * 1000)  // Convert to pieces and round to integer
                                                    : 0;

                                                return (
                                                    <tr key={plantfg.plant_id}>
                                                        <td className="px-2 py-3 border-b text-sm">{plantDetails?.plant_name || 'N/A'}</td>
                                                        <td className="px-2 py-3 border-b text-sm">{plantfg.item_code}</td>
                                                        <td className="px-2 py-3 border-b text-sm">{plantfg.item_description}</td>
                                                        <td className="px-2 py-3 border-b text-sm">{plantfg.hsn_sac_code}</td>
                                                        <td className="px-2 py-3 border-b text-sm">{plantfg.quantity}{plantfg.unit}</td>

                                                        <td className="px-2 py-3 border-b text-sm">{quantityInPieces} pieces</td> {/* Display Quantity in Pieces */}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No Finished Good items found.</p>
                                )}

                            </div>

                            {orderedItems.length > 0 ? (
                                <table className="min-w-full bg-white mt-4">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Item Code</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Plant Available Quantity</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Ordered Quantity</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderedItems.map((item) => {
                                            // Find corresponding plant available quantity
                                            const plantfg = plantfgs.find((plantfg) => plantfg.item_code === item.item_code);
                                            const plantAvailableQuantity = plantfg ? plantfg.quantity : 0;
                                            const plantAvailableQuantityunit = plantfg ? plantfg.unit : '';

                                            // Determine if the item is available or unavailable
                                            const status = plantAvailableQuantity >= item.quantity ? 'Available' : 'Unavailable';

                                            // Get the status class
                                            const statusClass = getStatusClass(status);

                                            return (
                                                <tr key={item.id}>
                                                    <td className={`px-2 py-3 border-b text-sm `}>{item.item_code || 'N/A'}</td>
                                                    <td className={`px-2 py-3 border-b text-sm ${statusClass}`}>{plantAvailableQuantity || 'N/A'}{plantAvailableQuantityunit}</td>
                                                    <td className={`px-2 py-3 border-b text-sm `}>{item.quantity || 'N/A'}{item.unit || 'N/A'}</td>
                                                    <td className={`px-2 py-3 border-b text-sm ${statusClass}`}>{status}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No ordered items found.</p>
                            )}


                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Order Status</label>
                                        <select
                                            value={data.order_status}
                                            onChange={(e) => setData('order_status', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Order Status</option>
                                            {orderStatusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Status Reason</label>
                                        <input
                                            type="text"
                                            value={data.status_reason}
                                            onChange={(e) => setData('status_reason', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="preview-section mt-8 p-4 bg-gray-100 rounded">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="ml-4 px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Update Purchase Order
                                    </button>
                                </div>

                                {/* Add _method for PUT request */}
                                <input type="hidden" name="_method" value="PUT" />
                            </form>

                            {/* Back Button */}
                            <div className="mt-4">
                                <Link
                                    href={route('vendor-purchase-orders.index')} // Adjust path as needed
                                    className="block max-w-max px-4 py-2 font-normal uppercase text-sm text-white bg-red rounded hover:bg-red-800"
                                >
                                    Back to Purchase Orders
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
