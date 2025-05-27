import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function UploadInvoiceModal({ isOpen, onClose, purchaseOrderId, purchaseOrder }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        invoice_file: '',
    });

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('invoice_file', data.invoice_file);

        post(route('vendor-purchase-orders.invoice-po', purchaseOrderId), {
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
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Invoice</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Upload File</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.type !== 'application/pdf') {
                                    alert('Only PDF files are allowed.');
                                    return;
                                }
                                setData('invoice_file', file);
                            }}
                            className="w-full mt-1 border p-1 border-gray-300 rounded-md shadow-sm"
                        />
                        {purchaseOrder?.invoice_file && (
                            <p className="text-sm text-gray-600 mt-1">
                                Current Invoice:{" "}
                                <a
                                    href={purchaseOrder.invoice_file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    View
                                </a>
                            </p>
                        )}
                        {errors.invoice_file && (
                            <div className="text-red-500 text-sm">{errors.invoice_file}</div>
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
