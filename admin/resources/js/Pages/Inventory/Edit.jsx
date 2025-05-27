import Select from "react-select";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function Edit({ finishedGoodRawMaterial, rawMaterials, finishedGoods }) {
    // Initialize the form with the IDs rather than the material codes.
    // Ensure your backend receives finished_good_id and raw_material_id as fg_code and rm_code respectively.
    const { data, setData, put, processing, errors } = useForm({
        fg_code: finishedGoodRawMaterial.fg_code, // Use the finished good ID
        rm_code: finishedGoodRawMaterial.rm_code,   // Use the raw material ID
        fg_gross_wt: finishedGoodRawMaterial.fg_gross_wt,
        fg_net_wt: finishedGoodRawMaterial.fg_net_wt,
        scrap_net_wt: finishedGoodRawMaterial.scrap_net_wt,
    });

    // Find the selected finished good to display its material code in a read-only field.
    const selectedFinishedGood = finishedGoods.find(
        (item) => item.material_code === data.fg_code
    );

    // Find the selected raw material option for react‑select.
    const selectedRawMaterial = rawMaterials.find(
        (option) => option.id === data.rm_code
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('inventory.update', finishedGoodRawMaterial.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit RM Setting for FG
                </h2>
            }
        >
            <Head title="Edit RM Setting" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className="flex">
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('inventory.index')}>RM Settings</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className="text-red">Edit RM Setting</span>
                    </p>
                    <Link
                        href={route('inventory.index')}
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>

                <div className="mx-auto py-6">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            <div className="top-search-bar-box flex py-4">
                                <h2 className="font-semibold text-3xl mb-6">Edit RM Setting</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="styled-form ">
                                <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Finished Good Field (read-only) */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Finished Good</label>
                                        <input
                                            type="text"
                                            value={selectedFinishedGood ? selectedFinishedGood.material_code : ''}
                                            readOnly
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Raw Material Dropdown using react‑select */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 pb-1">Select Raw Material*</label>
                                        <Select
                                            options={rawMaterials}
                                            value={selectedRawMaterial || null}
                                            onChange={(option) => setData('rm_code', option.id)}
                                            placeholder="Select Raw Material"
                                            getOptionLabel={(option) => option.material_code}
                                            getOptionValue={(option) => option.id.toString()}
                                        />
                                        {errors.rm_code && (
                                            <div className="text-errorRed text-sm">{errors.rm_code}</div>
                                        )}
                                    </div>

                                    {/* FG Gross Weight */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">FG Gross Weight*</label>
                                        <input
                                            type="number"
                                            value={data.fg_gross_wt}
                                            onChange={(e) => setData('fg_gross_wt', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter FG Gross Weight"
                                        />
                                        {errors.fg_gross_wt && (
                                            <div className="text-errorRed text-sm">{errors.fg_gross_wt}</div>
                                        )}
                                    </div>

                                    {/* FG Net Weight */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">FG Net Weight*</label>
                                        <input
                                            type="number"
                                            value={data.fg_net_wt}
                                            onChange={(e) => setData('fg_net_wt', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter FG Net Weight"
                                        />
                                        {errors.fg_net_wt && (
                                            <div className="text-errorRed text-sm">{errors.fg_net_wt}</div>
                                        )}
                                    </div>

                                    {/* Scrap Net Weight */}

                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Update RM Setting
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
