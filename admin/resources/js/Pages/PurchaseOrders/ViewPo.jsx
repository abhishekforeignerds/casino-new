import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function View({ purchaseOrder, orderedItems, plantDetails, messages, clients }) {
    const { data, setData, post, processing, errors } = useForm({
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('contact.store', purchaseOrder.id), {
            onSuccess: () => setData('message', ''),
        });
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
                        <Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />
                        <Link href={route('client-purchase-orders.index')}>Client Purchase Orders</Link>  <FiChevronRight size={24} color="black" />
                        <span className='text-red'>View Purchase Order</span>
                    </p>

                    <Link
                        href={route('client-purchase-orders.index')}
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>

                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg min-h-[80vh]">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='mb-4 text-2xl font-bold text-gray-800'>Client Purchase Order: #{purchaseOrder.po_number}</h2>
                            </div>

                            {/* Purchase Order Details Section */}
                            <div className='bg-lightGrayTheme p-4'>
                                <h3 className="font-semibold text-lg mb-4 text-black">PO Details</h3>
                                <div className='grid grid-cols-2 gap-1'>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">PO Number:</p>
                                        <p className="text-gray-600">{purchaseOrder.po_number || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Expected Delivery Date :</p>
                                        <p className="text-gray-600">
                                            {purchaseOrder.expected_delivery_date
                                                ? new Date(purchaseOrder.expected_delivery_date)
                                                    .toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "2-digit",
                                                    })
                                                    .replace(/\s/g, "-")
                                                : "N/A"}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">PO Date:</p>
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
                                    <div className="mb-1 flex items-center gap-1">
                                        <p><strong className='text-md font-semibold text-gray-700'>Preview File :</strong>
                                            <a target="_blank" href={purchaseOrder.file_url} className="text-red font-bold">  View</a>
                                        </p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">PO Status:</p>
                                        <p className="text-yellow-400">{purchaseOrder.order_status
                                            ? purchaseOrder.order_status.charAt(0).toUpperCase() + purchaseOrder.order_status.slice(1)
                                            : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Reason (if {purchaseOrder.order_status
                                            ? purchaseOrder.order_status.charAt(0).toUpperCase() + purchaseOrder.order_status.slice(1)
                                            : 'N/A'}
                                            ): </p>
                                        <p className="text-yellow-400">{purchaseOrder.status_reason || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ordered Items Section */}
                            <div className='bg-lightGrayTheme p-6 mb-4 grid grid-cols-2 gap-4 mt-4'>
                                <div className='flex-col flex gap-2 align-top'>
                                    <h3 className="font-semibold text-lg mb-1 text-black">Plant Details</h3>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Plant Name:</p>
                                        <p className="text-gray-600">{plantDetails?.plant_name || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Address:</p>
                                        <p className="text-gray-600">{plantDetails?.address || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">City:</p>
                                        <p className="text-gray-600">{plantDetails?.city || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">State/Region:</p>
                                        <p className="text-gray-600">{plantDetails?.state || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Zip Code:</p>
                                        <p className="text-gray-600">{plantDetails?.zip || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Country:</p>
                                        <p className="text-gray-600">{plantDetails?.country || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className='grid gap-2'>
                                    <h3 className='font-semibold text-lg mb-1 text-black'>Client Details</h3>
                                    <p><strong>Name :</strong>    {players.length > 0 && purchaseOrder.client_id
                                        ? players.find(client => String(client.id) === String(purchaseOrder.client_id))?.company_name || 'N/A'
                                        : 'N/A'}</p>
                                    <p><strong>GSTIN Number :</strong>  {players.length > 0 && purchaseOrder.client_id
                                        ? players.find(client => String(client.id) === String(purchaseOrder.client_id))?.gstin_number || 'N/A'
                                        : 'N/A'}</p>
                                    <p><strong>Mobile No :  </strong>  {players.length > 0 && purchaseOrder.client_id
                                        ? players.find(client => String(client.id) === String(purchaseOrder.client_id))?.mobile_number || 'N/A'
                                        : 'N/A'}</p>
                                    <p><strong>Pan No :  </strong>  {players.length > 0 && purchaseOrder.client_id
                                        ? players.find(client => String(client.id) === String(purchaseOrder.client_id))?.pan_card || 'N/A'
                                        : 'N/A'}</p>
                                    <p><strong>Address : </strong> {players.length > 0 && purchaseOrder.client_id
                                        ? players.find(client => String(client.id) === String(purchaseOrder.client_id))?.company_name || 'N/A'
                                        : 'N/A'}<br /> {players.length > 0 && purchaseOrder.client_id
                                            ? players.find(client => String(client.id) === String(purchaseOrder.client_id))?.company_address || 'N/A'
                                            : 'N/A'}</p>
                                </div>
                            </div>

                            {/* Items Details Section */}
                            <div className='bg-lightGrayTheme p-6 mb-4 gap-4 '>
                                <h3 className='font-semibold text-lg mb-4 text-black'>Items Details</h3>
                                <div>
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="p-2 font-semibold text-red">Item Code</th>
                                                <th className="p-2 font-semibold text-red">HSN/SAC CODE</th>
                                                <th className="p-2 font-semibold text-red">Quantity</th>
                                                <th className="p-2 font-semibold text-red">Item Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderedItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-2 font-bold">{item.item_code}</td>
                                                    <td className="p-2">{item.hsn_sac_code}</td>
                                                    <td className="p-2">{item.quantity} {item.unit}</td>
                                                    <td className="p-2">{item.item_description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Chat Box Section */}
                            <div className="chat-box bg-lightGrayTheme p-4 mt-6">
                                <div className="messages max-h-60 overflow-y-auto">
                                    {messages?.length > 0 ? (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className="message p-2 my-2 rounded bg-amber-50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">
                                                        {msg.seller ? msg.seller.name : msg.client ? msg.client.name : 'Unknown'}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        (
                                                        {msg.seller
                                                            ? (msg.seller.roles?.[0]?.name || 'User')
                                                            : (msg.client?.roles?.[0]?.name || 'User')}
                                                        )
                                                    </span>
                                                </div>
                                                <p className="mt-1">{msg.message}</p>
                                                <small className="text-gray-500 block mt-1">
                                                    {new Date(msg.created_at).toLocaleTimeString()}
                                                </small>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='bg-amber-50 p-1 mb-4'>
                                            <p className="text-black">No messages yet.</p>
                                        </div>
                                    )}
                                </div>
                                {purchaseOrder.order_status !== 'completed' && (
                                    <form onSubmit={handleSubmit} className="styled-form">
                                        <div className="mb-4">
                                            <label className="block text-gray-700">
                                                Message <span className="text-red">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                placeholder="Enter message"
                                            />
                                            {errors.message && <div className="text-errorRed text-sm">{errors.message}</div>}
                                        </div>
                                        <div>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Back Button Section */}
                            <div className="mt-4 flex gap-2">
                                <Link
                                    href={route('client-purchase-orders.index')}
                                    className="block max-w-max px-4 py-2 font-normal capitalize text-sm text-white bg-red rounded hover:bg-red-800"
                                >
                                    Back to Purchase Orders
                                </Link>
                                <a
                                    href={route('client-purchase-orders.download', purchaseOrder.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block max-w-max px-4 py-2 font-normal captalize text-sm text-white bg-red rounded hover:bg-red-700"
                                >
                                    Download PDF
                                </a>
                                <a
                                    href={route('client-purchase-orders.downloadInvoice', purchaseOrder.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block max-w-max px-4 py-2 font-normal captalize text-sm text-white bg-red rounded hover:bg-red-700"
                                >
                                    Download Invoice
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
