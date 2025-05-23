import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function UploadShippingDetailsModal({ isOpen, onClose, purchaseOrderId, trackiingdetails }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        po_id: purchaseOrderId,
        tracking_number: trackiingdetails ? trackiingdetails.tracking_number : '',
        file_url: '', // File inputs cannot be prefilled
        expected_delivery_date: trackiingdetails ? trackiingdetails.expected_delivery_date : '',
    });

    // Update form data when the modal is opened or when shipping details change.
    useEffect(() => {
        if (isOpen) {
            setData('tracking_number', trackiingdetails?.tracking_number || '');
            setData('expected_delivery_date', trackiingdetails?.expected_delivery_date || '');
            // file_url remains empty because you cannot set a file input programmatically.
        } else {
            reset();
        }
    }, [isOpen, trackiingdetails]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('tracking_number', data.tracking_number);
        formData.append('file_url', data.file_url);
        formData.append('expected_delivery_date', data.expected_delivery_date);

        post(route('vendor-shipping-details.store', purchaseOrderId), {
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onSuccess: () => onClose(), // Close modal on success
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Shipping Details</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Tracking Number</label>
                        <input
                            type="text"
                            value={data.tracking_number}
                            onChange={(e) => setData('tracking_number', e.target.value)}
                            className="w-full mt-1 border p-1 border-gray-300 rounded-md shadow-sm"
                        />
                        {errors.tracking_number && (
                            <div className="text-red-500 text-sm">{errors.tracking_number}</div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Upload File (PDF only)</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.type !== 'application/pdf') {
                                    alert('Only PDF files are allowed.');
                                    return;
                                }
                                setData('file_url', file);
                            }}
                            className="w-full mt-1 border p-1 border-gray-300 rounded-md shadow-sm"
                        />
                        {trackiingdetails?.file_url && (
                            <p className="text-sm text-gray-600 mt-1">
                                Current PDF:{" "}
                                <a
                                    href={trackiingdetails.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    View
                                </a>
                            </p>
                        )}
                        {errors.file_url && (
                            <div className="text-red-500 text-sm">{errors.file_url}</div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Expected Delivery Date</label>
                        <input
                            type="date"
                            value={data.expected_delivery_date}
                            onChange={(e) => setData('expected_delivery_date', e.target.value)}
                            className="w-full mt-1 border p-1 border-gray-300 rounded-md shadow-sm"
                        />
                        {errors.expected_delivery_date && (
                            <div className="text-red-500 text-sm">{errors.expected_delivery_date}</div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="block max-w-max px-4 py-2 font-normal captalize text-sm text-white bg-red rounded hover:bg-red-700
">
                            Upload
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
