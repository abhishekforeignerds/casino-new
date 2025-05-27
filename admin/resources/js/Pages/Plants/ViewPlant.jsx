import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function Edit({ plant, message, selectedFinishedGoods, selectedRawMaterials }) {
    const { data, setData, put, processing, errors } = useForm({
        plant_name: plant.plant_name || '',
        address: plant.address || '',
        city: plant.city || '',
        zip: plant.zip || '',
        state: plant.state || '',
        country: plant.country || '',
        capacity: plant.capacity || '',
        finished_goods: plant.finished_goods || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('plants.update', plant.id));
    };

    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    View Plant
                </h2>
            }
        >
            <Head title="View Plant" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /><Link href={route('plants.index')}>Plant Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>View Plant</span></p>

                    <Link
                        href={route('plants.index')}  // Use the correct path to navigate to the users page
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg min-h-[80vh]">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-2'>
                                <h2 className='mb-6 text-2xl font-bold text-gray-800'>View Plant: {data.plant_name || 'N/A'}</h2>
                            </div>
                            <div className='bg-lightGrayTheme p-4 grid '>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-black">Plant Name:</p>
                                    <p className="text-gray-600">{data.plant_name || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-black">Capacity:</p>
                                    <p className="text-gray-600">{data.capacity || 'N/A'}%</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-black">Address:</p>
                                    <p className="text-gray-600">{data.address || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-black">City:</p>
                                    <p className="text-gray-600">{data.city || 'N/A'}</p>
                                </div>

                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-black">State/Region:</p>
                                    <p className="text-gray-600 capitalize">{data.state || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-black">Zip Code:</p>
                                    <p className="text-gray-600">{data.zip || 'N/A'}</p>
                                </div>

                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-black">Country:</p>
                                    <p className="text-gray-600">{data.country || 'N/A'}</p>
                                </div>
                            </div>
                            <div className='bg-lightGrayTheme p-4 grid mt-8'>
                                <h3 className="text-lg font-semibold text-black mb-2">Finished Goods Manufactured in this Plant</h3>

                                <div className="mb-2 ">
                                    <p className="text-md font-semibold text-black">Finished Goods:</p>
                                    {selectedFinishedGoods.length > 0 ? (
                                        selectedFinishedGoods.map((good, index) => (
                                            <p key={index} className="block text-gray-600">
                                                {good}
                                            </p>  // Display each item on a new line
                                        ))
                                    ) : (
                                        <p>N/A</p>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-black mb-2">Raw Materials Manufactured in this Plant</h3>

                                <div className="mb-2 ">
                                    <p className="text-md font-semibold text-black">Raw Materials:</p>
                                    {selectedRawMaterials.length > 0 ? (
                                        selectedRawMaterials.map((good, index) => (
                                            <p key={index} className="block text-gray-600">
                                                {good}
                                            </p>  // Display each item on a new line
                                        ))
                                    ) : (
                                        <p>N/A</p>
                                    )}
                                </div>

                            </div>

                            <div>
                                <Link
                                    href={route('plants.index')}  // Use the correct path to navigate to the users page
                                    className=" block max-w-max mt-4 px-8 py-2 font-normal capitalize text-sm text-white bg-red rounded hover:bg-red-800"
                                >
                                    Back to Plant List
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
