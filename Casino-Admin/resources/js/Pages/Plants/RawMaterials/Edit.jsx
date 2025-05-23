import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from '@inertiajs/react';
export default function Edit({ rawMaterial, plants }) {
    const { data, setData, put, processing, errors } = useForm({
        item_code: rawMaterial.item_code || '',
        item_description: rawMaterial.item_description || '',
        hsn_sac_code: rawMaterial.hsn_sac_code || '',
        quantity: rawMaterial.quantity || '',
        unit: rawMaterial.unit || '',
        created_at: rawMaterial.created_at || '',
        status: rawMaterial.status || '',
        plant_id: rawMaterial.plant ? rawMaterial.plant.id : '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('plants.updateRmList', rawMaterial.id));
    };

    return (
        <AuthenticatedLayout


            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Raw Material</h2>}
        >
            <Head title="Edit Raw Material" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /> <Link href={route('plants.index')}>Plant Management</Link><FiChevronRight size={24} color="black" />  <Link
                        href={route('plants.rawMaterialsList')}><span className=''>Raw Material List</span></Link> <FiChevronRight size={24} color="black" /> <span className='text-red'>Update Material</span></p>
                    <Link
                        href={route('plants.rawMaterialsList')}  // Use the correct path to navigate to the users page
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
                                        <label className="block text-gray-700">Material Code</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Material Code"
                                            value={data.item_code}
                                            onChange={(e) => setData('item_code', e.target.value)}
                                            disabled />
                                        {errors.item_code && <div className="text-red-600">{errors.item_code}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Material Name</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Material Name"
                                            value={data.item_description}
                                            onChange={(e) => setData('item_description', e.target.value)}
                                        />
                                        {errors.item_description && <div className="text-red-600">{errors.item_description}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">HSN/SAC Code</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="HSN/SAC Code"
                                            value={data.hsn_sac_code}
                                            onChange={(e) => setData('hsn_sac_code', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Stock Quantity</label>
                                        <input
                                            type="number" min={0}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Stock Quantity"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                        />
                                        {errors.quantity && <div className="text-red-600">{errors.quantity}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Unit of Measurement</label>
                                        <select
                                            value={data.unit}
                                            onChange={(e) => setData('unit', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Unit</option>
                                            <option value="tons">Tons</option>
                                            <option value="Kgs">Kgs</option>
                                            <option value="rolls">Rolls</option>
                                        </select>
                                        {errors.unit && <div className="text-red-600">{errors.unit}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Status</option>
                                            <option value="active">Available</option>
                                            <option value="inactive">Unavailable</option>

                                        </select>
                                        {errors.status && <div className="text-red-600">{errors.status}</div>}
                                    </div>

                                    {/* <div className="mb-4">
                                        <label className="block text-gray-700">Assign Plant</label>
                                        <select
                                            value={data.plant_id}
                                            onChange={(e) => setData('plant_id', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Plant</option>
                                            {plants.map((plant) => (
                                                <option key={plant.id} value={plant.id}>{plant.plant_name}</option>
                                            ))}
                                        </select>
                                        {errors.plant_id && <div className="text-errorRed text-sm">{errors.plant_id}</div>}
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
