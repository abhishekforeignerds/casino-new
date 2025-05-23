import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';
import Pagination from '@/Components/Pagination';
import { Inertia } from '@inertiajs/inertia';
import { getStatusText, getStatusClass } from '../../../utils/statusUtils';

export default function View({ claims }) {
    const { flash = {} } = usePage().props;
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(''); // 'accept' or 'reject'
    const [selectedClaim, setSelectedClaim] = useState(null);

    // Pagination logic
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentClaims = claims.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(claims.length / rowsPerPage);

    // Handlers to open modal
    const openModal = (id, action) => {
        setSelectedClaim(id);
        setModalAction(action);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setSelectedClaim(null);
        setModalAction('');
    };

    // Confirm action
    const confirmAction = () => {
        if (modalAction === 'accept') {
            Inertia.post(route('claims.accept', selectedClaim));
        } else if (modalAction === 'reject') {
            Inertia.post(route('claims.reject', selectedClaim));
        }
        closeModal();
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl">My Claims</h2>}>
            <Head title="My Claims" />

            <div className="px-6 py-4">
                <p className="flex items-center gap-1 text-sm text-gray-600">
                    <Link href={route('dashboard')}>Dashboard</Link>
                    <FiChevronRight />
                    <span>My Claims</span>
                </p>

                {flash.success && (
                    <div className="my-4 p-4 bg-green-100 text-green-800 rounded">
                        {flash.success}
                    </div>
                )}

                <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Transaction ID</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentClaims.map((c) => (
                                <tr key={c.id} className="border-b">
                                    <td className="px-4 py-3">#{c.reference_number}</td>
                                    <td className="px-4 py-3">Withdraw</td>
                                    <td className="px-4 py-3">
                                        {new Date(c.created_at).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                        })}
                                    </td>
                                    <td className="px-4 py-3">₹{c.amount.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <small className={`px-2 py-1 rounded text-xs ${getStatusClass(c.status)}`}>
                                            {getStatusText(c.status)}
                                        </small>
                                    </td>
                                    {c.status == 'claimed' ? (
                                        <td className="px-4 py-3">
                                            <small className={`px-2 py-1 rounded text-xs ${getStatusClass(c.status)}`}>
                                                {getStatusText('claim-accepted')}
                                            </small>
                                        </td>
                                    ) : (
                                        <td className="px-4 py-3 space-x-2">
                                            {c.user_points < c.amount ? (
                                                <button
                                                    onClick={() => openModal(c.id, 'reject')}
                                                    className="px-3 py-1 text-xs rounded bg-red-500 text-white"
                                                >
                                                    Reject
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => openModal(c.id, 'accept')}
                                                        className="px-3 py-1 text-xs rounded bg-green-500 text-white"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(c.id, 'reject')}
                                                        className="px-3 py-1 text-xs rounded bg-red-500 text-white"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {currentClaims.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-6 text-center text-gray-500">
                                        No claims found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-end">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        setCurrentPage={setCurrentPage}
                    />
                </div>

                {/* Custom Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                            <h3 className="text-lg font-semibold mb-4">
                                {modalAction === 'accept' ? 'Accept Claim' : 'Reject Claim'}
                            </h3>
                            <p className="mb-6">
                                Are you sure you want to {modalAction} this claim?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    className={`px-4 py-2 rounded text-white ${modalAction === 'accept' ? 'bg-green-600' : 'bg-red-600'
                                        }`}
                                >
                                    {modalAction === 'accept' ? 'Accept' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
