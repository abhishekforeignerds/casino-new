import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function Edit({ finishedGood }) {
    const { data, setData, put, errors } = useForm({
        item_code: finishedGood.item_code || '',
        item_description: finishedGood.item_description || '',
        hsn_sac_code: finishedGood.hsn_sac_code || '',
        quantity: finishedGood.quantity || '',
        unit: finishedGood.unit || '',
        created_at: finishedGood.created_at || '',
        status: finishedGood.status || '',
        plant_id: finishedGood?.plant?.plant_name || '',

    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('raw-materials.update', finishedGood.id));
    };
    const formattedDate = data.created_at
        ? new Date(data.created_at).toLocaleDateString('en-GB')
        : "N/A";
    return (
        <AuthenticatedLayout


            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">View Finished Good</h2>}
        >
            <Head title="View Finish Goods" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex flex-wrap'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />   <Link href={route('plants.index')}>Plant Management</Link>  <FiChevronRight size={24} color="black" />  <Link
                        href={route('plants.finishedGoodsList')}><span className=''>Finish Goods List</span></Link> <FiChevronRight size={24} color="black" /> <span className='text-red'>View Finish Good </span></p>

                    <Link
                        href={route('plants.finishedGoodsList')}   // Use the correct path to navigate to the users page
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg min-h-[80vh]">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-6 text-2xl font-bold text-gray-800">View Finish Goods #{data.item_code}</h1>
                            <div className='bg-lightGrayTheme p-4 '>  <h3 className='text-2xl font-semibold mb-4'>Item Information</h3>

                                <div className="grid md:grid-cols-2 grid-cols-1">

                                    <div className="mb-4 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Item Code:</p>
                                        <p className="text-gray-800">{data.item_code || "N/A"}</p>
                                    </div>
                                    <div className="mb-4 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">HSN/SAC Code:</p>
                                        <p className="text-gray-800">{data.hsn_sac_code || "N/A"}</p>
                                    </div>
                                    <div className="mb-4 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Status</p>
                                        <p className="text-gray-800">{data.status || "N/A"}</p>
                                    </div>
                                    <div className="mb-4 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Unit:</p>
                                        <p className="text-gray-800">{data.unit || "N/A"}</p>
                                    </div>
                                    <div className="mb-4 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Plant:</p>
                                        <p className="text-gray-800">{data.plant_id || "N/A"}</p>
                                    </div>
                                    <div className="mb-4 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Item Description:</p>
                                        <p className="text-gray-800">{data.item_description || "N/A"}</p>
                                    </div>



                                    <div className="mb-4 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Stock Quantity:</p>
                                        <p className="text-gray-800">{data.quantity || "N/A"}</p>
                                    </div>



                                    <div className="mb-4 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Date of Entry:</p>
                                        <p className="text-gray-800">{formattedDate || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                            <div>

                            </div>
                            <Link
                                href={route('plants.finishedGoodsList')}
                                className=" block max-w-max mt-4 px-4 py-2 font-normal capitalize text-sm text-white bg-red rounded hover:bg-red-800"
                            >
                                Back to FG List
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
