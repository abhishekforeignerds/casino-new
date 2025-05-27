import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import UploadInvoiceModal from './UploadInvoiceModal';
import UploadShippingDetailsModal from './UploadShippingDetailsModal';
import React, { useState } from 'react';

export default function View({ purchaseOrder, orderedItems, plantDetails, clients, trackiingdetails }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

    const client = players.find(client => String(client.id) === String(purchaseOrder.client_id));

    const { auth } = usePage().props;
    const user = usePage().props.auth.user;
    const userRoles = auth?.user?.roles || [];
    const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);
    const { flash = {} } = usePage().props;
    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    View Vendor Order
                </h2>
            }
        >
            <Head title="View Purchase Order" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'>
                        <Link href={route('dashboard')}>Dashboard</Link> <FiChevronRight size={24} color="black" /><Link href={route('vendor-purchase-orders.index')}>Vendor Purchase Orders</Link>  <FiChevronRight size={24} color="black" />
                        <span className='text-red'>View Vendor Order</span>
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
                                <h2 className='mb-4 text-2xl font-bold text-gray-800'>Vendor Purchase Order</h2>
                            </div>

                            {/* Purchase Order Details Section */}
                            <div className='bg-lightGrayTheme p-4'>
                                <h3 className="font-semibold text-lg mb-4 text-gray-600">PO Details</h3>
                                <div className='grid grid-cols-2 gap-1'>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">PO Number:</p>
                                        <p className="text-gray-600">{purchaseOrder.po_number || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Expected Delivery Date :</p>
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
                                        <p className="text-lg font-semibold text-gray-700">PO Date:</p>
                                        <p className="text-gray-600">
                                            {purchaseOrder.expected_delivery_date
                                                ? new Date(purchaseOrder.expected_delivery_date)
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
                                        <p className="text-md font-semibold text-gray-700">Tracking Number:</p>
                                        <p className="text-gray-600">{trackiingdetails?.tracking_number || 'N/A'}</p>
                                    </div>

                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Tracking PDF:</p>
                                        {trackiingdetails?.file_url ? (
                                            <a target="_blank" href={trackiingdetails.file_url} className="text-red font-bold">View</a>
                                        ) : (
                                            <span className="text-gray-500">Not Uploaded Yet</span>
                                        )}
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p><strong className='text-md font-semibold text-gray-700'>Preview File :</strong><a target="_blank" href={purchaseOrder.file_url} className="text-red font-bold">  View</a></p> </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Tracking Delivery Date:</p>
                                        {trackiingdetails?.expected_delivery_date ? (
                                            <span>{trackiingdetails.expected_delivery_date}</span>
                                        ) : (
                                            <span className="text-gray-500">Not Added Yet</span>
                                        )}
                                    </div>


                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">PO Status: </p>
                                        <p className="text-yellow-400">{purchaseOrder.status}</p>
                                    </div>

                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Invoice File:</p>
                                        {purchaseOrder.invoice_file ? (
                                            <a href={purchaseOrder.invoice_file} className="text-red font-bold">
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">Not Uploaded Yet</span>
                                        )}
                                    </div>



                                </div>
                            </div>
                            <div className='bg-lightGrayTheme p-6 mb-4 grid grid-cols-2 gap-4 mt-4'>
                                <div className='flex-col flex gap-2 align-top'>
                                    <h3 className="font-semibold text-lg mb-1 text-gray-600">Plant Details</h3>
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
                                    <h3 className='font-semibold text-lg mb-1 text-gray-600'>Vendor Details</h3>
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
                                        : 'N/A'}<br></br> {players.length > 0 && purchaseOrder.client_id
                                            ? players.find(client => String(client.id) === String(purchaseOrder.client_id))?.company_address || 'N/A'
                                            : 'N/A'}</p>
                                </div>
                            </div>

                            {/* Plant Details Section */}
                            <div className='bg-lightGrayTheme p-6 mb-4 gap-4 '>
                                <h3 className='font-semibold text-lg mb-4 text-gray-600'>Items Details</h3>
                                <div>  <table className="w-full border-collapse">
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
                                            <tr key={index} className="">
                                                <td className="p-2 font-bold">{item.item_code}</td>
                                                <td className="p-2">{item.hsn_sac_code}</td>
                                                <td className="p-2">{item.quantity} {item.unit}</td>
                                                <td className="p-2">{item.item_description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table></div>
                            </div>
                            {/* Back Button */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link
                                    href={route('vendor-purchase-orders.index')}
                                    className="block max-w-max px-4 py-2 text-sm text-white bg-red rounded hover:bg-red-800"
                                >
                                    Back to Purchase Orders
                                </Link>

                                {/* Show Accept and Reject buttons only when PO is pending */}
                                {purchaseOrder.status === 'pending' && (
                                    <>
                                        {userPermissions.includes("accept-po vendor-purchase-orders") && (<Link
                                            href={route('vendor-purchase-orders.accept-po', purchaseOrder.id)}
                                            className="block max-w-max px-4 py-2 text-sm text-white bg-red rounded hover:bg-red-800"
                                        >
                                            Accept PO
                                        </Link>
                                        )}
                                        {userPermissions.includes("reject-po vendor-purchase-orders") && (
                                            <Link
                                                href={route('vendor-purchase-orders.reject-po', purchaseOrder.id)}
                                                className="block max-w-max px-4 py-2 text-sm text-white bg-red rounded hover:bg-red-800"
                                            >
                                                Reject PO
                                            </Link>
                                        )}
                                    </>
                                )}

                                {/* When PO is accepted, require document uploads before allowing fulfillment */}
                                {purchaseOrder.status === 'accepted' && (
                                    <>
                                        {userPermissions.includes("dispatch-po vendor-purchase-orders") && (<Link
                                            href={route('vendor-purchase-orders.dispatch-po', purchaseOrder.id)}
                                            onClick={(e) => {
                                                if (
                                                    !purchaseOrder.invoice_uploaded ||
                                                    !purchaseOrder.shipping_details_uploaded
                                                ) {
                                                    e.preventDefault();
                                                    alert(
                                                        "Please upload both the invoice and shipping details before fulfilling the PO."
                                                    );
                                                }
                                            }}
                                            className="block max-w-max px-4 py-2 text-sm text-white bg-red rounded hover:bg-red-800"
                                        >
                                            Dispatch RM PO
                                        </Link>
                                        )}
                                        <>
                                            {userPermissions.includes("shipping-po vendor-purchase-orders") && (
                                                <button
                                                    onClick={() => setIsShippingModalOpen(true)}
                                                    className="block max-w-max px-4 py-2 font-normal captalize text-sm text-white bg-red rounded hover:bg-red-800"
                                                >
                                                    {trackiingdetails?.file_url ? "Replace Shipping PDF" : "Upload Shipping Details"}
                                                </button>
                                            )}
                                            <UploadShippingDetailsModal isOpen={isShippingModalOpen} onClose={() => setIsShippingModalOpen(false)} purchaseOrderId={purchaseOrder.id} trackiingdetails={trackiingdetails} />
                                            {userPermissions.includes("invoice-po vendor-purchase-orders") && (
                                                <button
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="block max-w-max px-4 py-2 font-normal captalize text-sm text-white bg-red rounded hover:bg-red-800"
                                                >
                                                    {purchaseOrder?.invoice_file ? "Replace Invoice" : "Upload Invoice"}
                                                </button>
                                            )}
                                            <UploadInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} purchaseOrderId={purchaseOrder.id} purchaseOrder={purchaseOrder} />
                                        </>
                                    </>
                                )}
                                {userPermissions.includes("received-po vendor-purchase-orders") && purchaseOrder.status === 'dispatched' && (
                                    <>
                                        <Link
                                            href={route('vendor-purchase-orders.received-po', purchaseOrder.id)}
                                            onClick={(e) => {
                                                if (
                                                    !purchaseOrder.invoice_uploaded ||
                                                    !purchaseOrder.shipping_details_uploaded
                                                ) {
                                                    e.preventDefault();
                                                    alert(
                                                        "Please upload both the invoice and shipping details before fulfilling the PO."
                                                    );
                                                }
                                            }}
                                            className="block max-w-max px-4 py-2 text-sm text-white bg-red rounded hover:bg-red-800"
                                        >
                                            Received RM PO
                                        </Link>

                                    </>
                                )}
                                {userPermissions.includes("fulfill-po vendor-purchase-orders") && purchaseOrder.status === 'received' && (
                                    <>
                                        <Link
                                            href={route('vendor-purchase-orders.fulfill-po', purchaseOrder.id)}
                                            onClick={(e) => {
                                                if (
                                                    !purchaseOrder.invoice_uploaded ||
                                                    !purchaseOrder.shipping_details_uploaded
                                                ) {
                                                    e.preventDefault();
                                                    alert(
                                                        "Please upload both the invoice and shipping details before fulfilling the PO."
                                                    );
                                                }
                                            }}
                                            className="block max-w-max px-4 py-2 text-sm text-white bg-red rounded hover:bg-red-800"
                                        >
                                            Fulfill PO
                                        </Link>

                                    </>
                                )}

                                <a
                                    href={route('vendor-purchase-orders.download-po', purchaseOrder.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block max-w-max px-4 py-2 text-sm text-white bg-red rounded hover:bg-red-800"
                                >
                                    Download PO
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
