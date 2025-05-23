import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from '@inertiajs/react';
export default function Edit({ rawMaterial }) {
    const { data, setData, put, processing, errors } = useForm({
        material_code: rawMaterial.material_code || '',
        material_name: rawMaterial.material_name || '',
        hsn_sac_code: rawMaterial.hsn_sac_code || '',
        initial_stock_quantity: rawMaterial.initial_stock_quantity || '',
        unit_of_measurement: rawMaterial.unit_of_measurement || '',
        date_of_entry: rawMaterial.date_of_entry || '',
        status: rawMaterial.status || '',
        minimum_threshold: rawMaterial.minimum_threshold || '',
        buffer_stock: rawMaterial.buffer_stock || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('raw-materials.update', rawMaterial.id));
    };

    return (
        <AuthenticatedLayout


            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Raw Material</h2>}
        >
            <Head title="Edit Raw Material" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />  <Link href={route('raw-materials.index')}>Inventory Management</Link>   <FiChevronRight size={24} color="black" /> <span className='text-red'>Update Material</span></p>
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
                            <h1 className="mb-6 text-2xl font-bold text-gray-800">Update Material</h1>


                            <form onSubmit={handleSubmit} className='styled-form'>
                                <div className='theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Material Code*</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Material Code"
                                            value={data.material_code}
                                            onChange={(e) => setData('material_code', e.target.value)}
                                        />
                                        {errors.material_code && <div className="text-errorRed text-sm">{errors.material_code}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Material Name*</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Material Name"
                                            value={data.material_name}
                                            onChange={(e) => setData('material_name', e.target.value)}
                                        />
                                        {errors.material_name && <div className="text-errorRed text-sm">{errors.material_name}</div>}
                                    </div>

                                    {/* <div className="mb-4">
                                        <label className="block text-gray-700">HSN/SAC Code*</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="HSN/SAC Code"
                                            value={data.hsn_sac_code}
                                            onChange={(e) => setData('hsn_sac_code', e.target.value)}
                                        />
                                        {errors.hsn_sac_code && <div className="text-errorRed text-sm">{errors.hsn_sac_code}</div>}
                                    </div> */}

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Stock Quantity*</label>
                                        <input
                                            type="number" min={0}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Stock Quantity"
                                            value={data.initial_stock_quantity}
                                            onChange={(e) => setData('initial_stock_quantity', e.target.value)}
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
                                            {/* <option value="tons">Tons</option> */}
                                            <option value="Kgs">Kgs</option>
                                            {/* <option value="rolls">Rolls</option> */}
                                        </select>
                                        {errors.unit_of_measurement && <div className="text-errorRed text-sm">{errors.unit_of_measurement}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Status</label>
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
                                        <label className="block text-gray-700">Minimum Threshold</label>
                                        <input
                                            type="text"
                                            value={data.minimum_threshold}
                                            onChange={(e) => setData('minimum_threshold', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.minimum_threshold && <div className="text-errorRed text-sm">{errors.minimum_threshold}</div>}
                                    </div>

                                    {/* <div className="mb-4">
                                        <label className="block text-gray-700">Buffer Stock</label>
                                        <input
                                            type="text"
                                            value={data.buffer_stock}
                                            onChange={(e) => setData('buffer_stock', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.buffer_stock && <div className="text-errorRed text-sm">{errors.buffer_stock}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Date of Entry</label>
                                        <input
                                            type="date"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Date of Entry"
                                            value={data.date_of_entry}
                                            onChange={(e) => setData('date_of_entry', e.target.value)}
                                        />
                                        {errors.date_of_entry && <div className="text-errorRed text-sm">{errors.date_of_entry}</div>}
                                    </div> */}
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-red rounded hover:bg-red/85"
                                    >
                                        Update Raw Material
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
