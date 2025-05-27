import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
export default function Edit({ finishedGood, plants }) {
    const { data, setData, put, errors, processing } = useForm({
        item_code: finishedGood.item_code || '',
        item_description: finishedGood.item_description || '',
        hsn_sac_code: finishedGood.hsn_sac_code || '',
        quantity: finishedGood.quantity || '',
        unit: finishedGood.unit || '',
        created_at: finishedGood.created_at || '',
        status: finishedGood.status || '',
        plant_id: finishedGood.plant ? finishedGood.plant.id : '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();



        // Submit the form if validation passes
        put(route('plants.updateFgList', finishedGood.id));
    };

    return (
        <AuthenticatedLayout

            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Finish Good</h2>}>
            <Head title="Edit Finished Good" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                <p className='flex flex-wrap'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />   <Link href={route('plants.index')}>Plant Management</Link>  <FiChevronRight size={24} color="black" />  <Link
                        href={route('plants.finishedGoodsList')}><span className=''>Finish Goods List</span></Link> <FiChevronRight size={24} color="black" /> <span className='text-red'>Edit Finish Goods</span></p>
                    <Link
                        href={route('plants.finishedGoodsList')}   // Use the correct path to navigate to the users page
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-6 text-2xl font-bold text-gray-800">Edit Finish Good</h1>

                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Material Code */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Item Code*</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Material Code"
                                            value={data.item_code}
                                            onChange={(e) => setData('item_code', e.target.value)}
                                            disabled />
                                        {errors.item_code && <div className="text-errorRed text-sm">{errors.item_code}</div>}
                                    </div>

                                    {/* Material Name */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Item Name*</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Material Name"
                                            value={data.item_description}
                                            onChange={(e) => setData('item_description', e.target.value)}
                                        />
                                        {errors.item_description && <div className="text-errorRed text-sm">{errors.item_description}</div>}
                                    </div>

                                    {/* HSN/SAC Code */}
                                    {/* <div className="mb-4">
                                        <label className="block text-gray-700">HSN/SAC Code</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="HSN/SAC Code"
                                            value={data.hsn_sac_code}
                                            onChange={(e) => setData('hsn_sac_code', e.target.value)}
                                        />
                                    </div> */}
                                    {/* status */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select status</option>
                                            <option value="available">Available</option>
                                            <option value="unavailable">Unavailable</option>
                                        </select>
                                        {errors.status && <div className="text-errorRed text-sm">{errors.status}</div>}
                                    </div>
                                    {/* Unit of Measurement */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Unit*</label>
                                        <select
                                            value={data.unit}
                                            onChange={(e) => setData('unit', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Unit</option>

                                            <option value="pieces">Pieces</option>
                                        </select>
                                        {errors.unit && <div className="text-errorRed text-sm">{errors.unit}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Plant*</label>
                                        <select disabled
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
                                    </div>
                                    {/* Stock Quantity */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Stock Quantity*</label>
                                        <input
                                            type="number" min={0}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Stock Quantity"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                        />
                                        {errors.quantity && <div className="text-errorRed text-sm">{errors.quantity}</div>}
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-red rounded hover:bg-red/85"
                                    >
                                        Update Finish Good
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
