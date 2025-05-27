import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
export default function Edit({ rawMaterial }) {
    const { data, setData, put, errors } = useForm({
        item_code: rawMaterial.item_code || '',
        item_description: rawMaterial.item_description || '',
        hsn_sac_code: rawMaterial.hsn_sac_code || '',
        quantity: rawMaterial.quantity || '',
        unit: rawMaterial.unit || '',
        status: rawMaterial.status || '',
        plant_id: rawMaterial?.plant?.plant_name || '',
        created_at: rawMaterial.created_at || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('raw-materials.update', rawMaterial.id));
    };
    const formattedDate = data.created_at
        ? new Date(data.created_at).toLocaleDateString('en-GB')
        : "N/A";

    return (
        <AuthenticatedLayout


            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">View Raw Material</h2>}
        >
            <Head title="View Raw Material" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /> <Link href={route('plants.index')}>Plant Management</Link><FiChevronRight size={24} color="black" />  <Link
                        href={route('plants.rawMaterialsList')}><span className=''>Raw Material List</span></Link> <FiChevronRight size={24} color="black" /> <span className='text-red'>View Raw Material </span></p>
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
                            <h1 className="mb-6 text-2xl font-bold text-gray-800">View Raw Material #{data.item_code}</h1>
                            <div className="bg-lightGrayTheme p-4 grid md:grid-cols-2 grid-cols-1">
                                <div className="mb-4 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Material Code:</p>
                                    <p className="text-gray-800">{data.item_code || "N/A"}</p>
                                </div>

                                <div className="mb-4 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Material Name:</p>
                                    <p className="text-gray-800">{data.item_description || "N/A"}</p>
                                </div>

                                <div className="mb-4 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">HSN/SAC Code:</p>
                                    <p className="text-gray-800">{data.hsn_sac_code || "N/A"}</p>
                                </div>

                                <div className="mb-4 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Stock Quantity:</p>
                                    <p className="text-gray-800">{data.quantity || "N/A"}</p>
                                </div>

                                <div className="mb-4 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Status :</p>
                                    <p className="text-gray-800">{data.status || "N/A"}</p>
                                </div>
                                <div className="mb-4 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Unit of Measurement:</p>
                                    <p className="text-gray-800">{data.unit || "N/A"}</p>
                                </div>
                                <div className="mb-4 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Plant:</p>
                                    <p className="text-gray-800">{data.plant_id || "N/A"}</p>
                                </div>

                                <div className="mb-4 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Date of Entry:</p>
                                    <p className="text-gray-800">{formattedDate || "N/A"}</p>
                                </div>
                            </div>
                            <div>

                                <Link
                                    href={route('plants.rawMaterialsList')}
                                    className=" block max-w-max mt-4 px-4 py-2 font-normal capitalize text-sm text-white bg-red rounded hover:bg-red-800"
                                >
                                    Back to Raw Materials
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
