import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function Create({ message }) {
    const { data, setData, post, processing, errors } = useForm({
        material_code: '',
        material_name: '',
        hsn_sac_code: '',
        initial_stock_quantity: '',
        unit_of_measurement: '',
        date_of_entry: '',
        status: '',
        minimum_threshold: '',
        buffer_stock: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('raw-materials.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800"></h2>}
        >
            <Head title="Create Raw Material" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />  <Link href={route('raw-materials.index')}>Inventory Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Create Raw Material</span></p>
                    <Link
                        href={route('raw-materials.index')}  // Use the correct path to navigate to the users page
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>

                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='font-semibold text-3xl mb-6'>Add New Material</h2>
                                <div className='flex items-center justify-end flex-1 gap-2'>


                                </div>
                            </div>
                            {message && <div className="mb-4 text-green-600">{message}</div>}
                            <form onSubmit={handleSubmit} className='styled-form'>
                                <div className='theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Material Code*</label>
                                        <input
                                            type="text"
                                            value={data.material_code}
                                            onChange={(e) => setData('material_code', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Material Code'
                                        />
                                        {errors.material_code && <div className="text-errorRed text-sm">{errors.material_code}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Material Name*</label>
                                        <input
                                            type="text"
                                            value={data.material_name}
                                            onChange={(e) => setData('material_name', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Material Name'
                                        />
                                        {errors.material_name && <div className="text-errorRed text-sm">{errors.material_name}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Stock Quantity*</label>
                                        <input
                                            type="number" min={0}
                                            value={data.initial_stock_quantity}
                                            onChange={(e) => setData('initial_stock_quantity', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Stock Quantity'
                                        />
                                        {errors.initial_stock_quantity && <div className="text-errorRed text-sm">{errors.initial_stock_quantity}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Unit of Measurement*</label>
                                        <select
                                            value={data.unit_of_measurement}
                                            onChange={(e) => setData('unit_of_measurement', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Unit</option>

                                            <option value="Kgs">Kgs</option>

                                        </select>
                                        {errors.unit_of_measurement && <div className="text-errorRed text-sm">{errors.unit_of_measurement}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Status*</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Status</option>
                                            <option value="available">Available</option>
                                            <option value="unavailable">Unavailable</option>

                                        </select>
                                        {errors.status && <div className="text-errorRed text-sm">{errors.status}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Minimum Threshold*</label>
                                        <input
                                            type="text"
                                            value={data.minimum_threshold}
                                            onChange={(e) => setData('minimum_threshold', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Minimum Threshold'
                                        />
                                        {errors.minimum_threshold && <div className="text-errorRed text-sm">{errors.minimum_threshold}</div>}
                                    </div>

                                    {/* <div className="mb-4">
                                        <label className="block text-gray-700">Buffer Stock*</label>
                                        <input
                                            type="text"
                                            value={data.buffer_stock}
                                            onChange={(e) => setData('buffer_stock', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Buffer Stock'
                                        />
                                        {errors.buffer_stock && <div className="text-errorRed text-sm">{errors.buffer_stock}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Date of Entry*</label>
                                        <input
                                            type="date"
                                            value={data.date_of_entry}
                                            onChange={(e) => setData('date_of_entry', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.date_of_entry && <div className="text-errorRed text-sm">{errors.date_of_entry}</div>}
                                    </div> */}

                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Create Material
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
