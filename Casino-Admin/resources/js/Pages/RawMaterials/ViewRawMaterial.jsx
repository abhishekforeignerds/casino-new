import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
export default function Edit({ rawMaterial }) {
    const { data, setData, put, errors } = useForm({
        material_code: rawMaterial.material_code || '',
        material_name: rawMaterial.material_name || '',
        hsn_sac_code: rawMaterial.hsn_sac_code || '',
        initial_stock_quantity: rawMaterial.initial_stock_quantity || '',
        unit_of_measurement: rawMaterial.unit_of_measurement || '',
        date_of_entry: rawMaterial.date_of_entry || '',
        buffer_stock: rawMaterial.buffer_stock || '',
        minimum_threshold: rawMaterial.minimum_threshold || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('raw-materials.update', rawMaterial.id));
    };

    return (
        <AuthenticatedLayout


            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">View Raw Material</h2>}
        >
            <Head title="View Raw Material" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />  <Link href={route('raw-materials.index')}>Inventory Management</Link>   <FiChevronRight size={24} color="black" /> <span className='text-red'>Veiw Raw Material</span></p>
                    <Link
                        href={route('raw-materials.index')}  // Use the correct path to navigate to the users page
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back To RM List
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-6 text-2xl font-bold text-gray-800">View Raw Material #{data.material_code}</h1>
                            <div className="bg-lightGrayTheme p-4">
                                <h3 className='text-xl font-semibold mb-4'>Item Information</h3>
                                <div className='grid md:grid-cols-2 grid-cols-1'>
                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Item Code:</p>
                                        <p className="text-gray-800">{data.material_code || "N/A"}</p>
                                    </div>
                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Item Type:</p>
                                        <p className="text-gray-800">{"N/A"}</p>
                                    </div>
                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Item Description:</p>
                                        <p className="text-gray-800">{"N/A"}</p>
                                    </div>
                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Material Name:</p>
                                        <p className="text-gray-800">{data.material_name || "N/A"}</p>
                                    </div>

                                    {/* <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">HSN/SAC Code:</p>
                                        <p className="text-gray-800">{data.hsn_sac_code || "N/A"}</p>
                                    </div> */}

                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Stock Quantity:</p>
                                        <p className="text-gray-800">{data.initial_stock_quantity || "N/A"}</p>
                                    </div>

                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Unit of Measurement:</p>
                                        <p className="text-gray-800">{data.unit_of_measurement || "N/A"}</p>
                                    </div>

                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Date of Entry:</p>
                                        <p className="text-gray-800">
                                            {data.date_of_entry
                                                ? new Date(data.date_of_entry)
                                                    .toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "2-digit",
                                                    })
                                                    .replace(/\s/g, "-")
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-lightGrayTheme p-4 mt-4">
                                <h3 className='text-xl font-semibold mb-4'>Stock Information</h3>
                                <div className='grid md:grid-cols-2 grid-cols-1'>
                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Quantity Available:</p>
                                        <p className="text-gray-800">{data.initial_stock_quantity || "N/A"} {data.unit_of_measurement || "N/A"}</p>
                                    </div>

                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Stock Unit:</p>
                                        <p className="text-gray-800">{data.unit_of_measurement || "N/A"}</p>
                                    </div>
                                    <div className="mb-2 flex items-center gap-1">
                                        <p className="text-md font-semibold text-gray-700">Level Threshold:</p>
                                        <p className="text-gray-800">{data.minimum_threshold || "N/A"} {data.unit_of_measurement || "N/A"}</p>
                                    </div>


                                </div>
                            </div>
                            <div>

                                <Link
                                    href={route('raw-materials.index')}
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
