import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function StoreFund({ client }) {
    // Pre-fill the user_id based on the client prop and set initial values for amount and reference_number.
    const { data, setData, put, processing, errors } = useForm({
        user_id: client.id, // Use the current client’s id
        amount: '',
        reference_number: '',
        modeOfPayment: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Post the form data to your defined route (adjust the route name as needed)
        put(route('players.storefund', client.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Add Fund
                </h2>
            }
        >
            <Head title="Add Fund" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className="flex flex-wrap">
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('players.index')}>Client Management</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className="text-red">Add Fund</span>
                    </p>
                    <Link
                        href={route('players.index')}
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            <div className="top-search-bar-box flex py-4">
                                <h2 className="font-semibold text-3xl mb-6">Add Fund</h2>
                            </div>
                            <div className="top-search-bar-box flex py-4">
                                <h2 className="font-semibold text-3xl mb-6">Current balance : {client.points}</h2>
                            </div>
                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Amount */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Amount*</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Amount"
                                        />
                                        {errors.amount && <div className="text-red-600">{errors.amount}</div>}
                                    </div>

                                    {/* Reference Number */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Reference Number*</label>
                                        <input
                                            type="text"
                                            value={data.reference_number}
                                            onChange={(e) => setData('reference_number', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Reference Number"
                                        />
                                        {errors.reference_number && <div className="text-red-600">{errors.reference_number}</div>}
                                    </div>

                                    <div className="mb-4">
                                        {/* Reference Number */}
                                        <label className="block text-gray-700">Mode of Payment</label>
                                        <select value={data.modeOfPayment} onChange={(e) => setData('modeOfPayment', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" >
                                            <option value="">Select Mode of Payment</option>
                                            <option value="Cr">Cr</option>
                                            <option value="Dr">Dr</option>
                                        </select>
                                        {errors.modeOfPayment && <div className="text-errorRed text-sm">{errors.modeOfPayment}</div>}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Add Fund
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
