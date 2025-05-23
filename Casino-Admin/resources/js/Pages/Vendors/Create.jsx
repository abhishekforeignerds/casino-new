import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { uploadFileIcon } from './../../../utils/svgIconContent';

export default function Create({ roles, plants, raw_materials }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        status: '',
        mobile_number: '',
        role: 'Vendor',
        company_name: '',
        gstin_number: '',
        pan_card: '',
        state_code: '',
        company_address: '',
        plant_id: '',
        raw_materials: [] // Initialize raw_materials here
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('vendors.store'));
    };
    const [rawMaterialsSearch, setRawMaterialsSearch] = useState("");
    const [rawMaterialsLimit, setRawMaterialsLimit] = useState(10);

    const filteredRawMaterials = raw_materials.filter(material =>
        material.material_name.toLowerCase().includes(rawMaterialsSearch.toLowerCase()) ||
        material.material_code.toLowerCase().includes(rawMaterialsSearch.toLowerCase())
    );
    const displayedRawMaterials = rawMaterialsSearch ? filteredRawMaterials : raw_materials;

    const materialsSource = rawMaterialsSearch ? filteredRawMaterials : raw_materials;
    const materialsToDisplay = materialsSource.slice(0, rawMaterialsLimit);
    const handleRMCheckboxChange = (material) => {
        const code = material.material_code;
        // Toggle raw_materials selection using material_code
        if (data.raw_materials.some(item => item.id === code)) {
            setData('raw_materials', data.raw_materials.filter(item => item.id !== code));
        } else {
            setData('raw_materials', [...data.raw_materials, { id: code, quantity: '' }]);
        }
    };
    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Vendor
                </h2>
            }
        >
            <Head title="Create Vendor" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /><Link href={route('vendors.index')}> Vendors Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Create Vendor</span></p>
                    <Link
                        href={route('vendors.index')}
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='font-semibold text-3xl mb-6'>Create New Vendor</h2>
                            </div>
                            <form onSubmit={handleSubmit} className='styled-form'>
                                <div className='theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Full Name*</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Full Name'
                                        />
                                        {errors.name && <div className="text-errorRed text-sm">{errors.name}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Company Name*</label>
                                        <input
                                            type="text"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Company Name'
                                        />
                                        {errors.company_name && <div className="text-errorRed text-sm">{errors.company_name}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Select Plant*</label>
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
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">GSTIN Number*</label>
                                        <input
                                            type="text"
                                            value={data.gstin_number}
                                            onChange={(e) => setData('gstin_number', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter GSTIN Number'
                                        />
                                        {errors.gstin_number && <div className="text-errorRed text-sm">{errors.gstin_number}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Status*</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="pending_approval">Pending</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        {errors.status && <div className="text-errorRed text-sm">{errors.status}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Email Address*</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Email Address'
                                        />
                                        {errors.email && <div className="text-errorRed text-sm">{errors.email}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Password*</label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Create Password'
                                        />
                                        {errors.password && <div className="text-errorRed text-sm">{errors.password}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Mobile Number*</label>
                                        <input
                                            type="text"
                                            value={data.mobile_number}
                                            onChange={(e) => setData('mobile_number', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Mobile Number'
                                        />
                                        {errors.mobile_number && <div className="text-errorRed text-sm">{errors.mobile_number}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">PAN Card No*</label>
                                        <input
                                            type="text"
                                            value={data.pan_card}
                                            onChange={(e) => setData('pan_card', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter PAN Card'
                                        />
                                        {errors.pan_card && <div className="text-errorRed text-sm">{errors.pan_card}</div>}
                                    </div>

                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                    <div className="mb-4 sm:col-span-1">
                                        <label className="block text-black">State Code*</label>
                                        <input
                                            type="number" min={0}
                                            value={data.state_code}
                                            onChange={(e) => setData('state_code', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter State Code'
                                        />
                                        {errors.state_code && <div className="text-errorRed text-sm">{errors.state_code}</div>}
                                    </div>
                                    <div className="mb-4 sm:col-span-2">
                                        <label className="block text-black">Company Address*</label>
                                        <textarea
                                            value={data.company_address}
                                            onChange={(e) => setData('company_address', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Company Address'
                                        ></textarea>
                                        {errors.company_address && <div className="text-errorRed text-sm">{errors.company_address}</div>}
                                    </div>
                                </div>

                                <div className='bg-slate-100 p-4 rounded-md mt-6'>
                                    <h2 className="font-semibold text-2xl mb-6">
                                        Select Raw Material for this Vendor
                                    </h2>
                                    {/* Raw Materials Search */}

                                    <Link className=' bg-transparent px-4 py-2 rounded-md text-red max-w-max mb-4 border border-red flex gap-2'
                                        href={route('plants.importrm')}>Upload File{uploadFileIcon}</Link>
                                    <p className='mb-4'>Upload or search RM</p>

                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            placeholder="Search Raw Materials..."
                                            value={rawMaterialsSearch}
                                            onChange={(e) => {
                                                setRawMaterialsSearch(e.target.value);
                                                // Optionally reset the limit when searching
                                                setRawMaterialsLimit(10);
                                            }}
                                            className="mb-4 w-full p-2 border border-gray-300 pe-8 rounded-md"
                                        />
                                        <div className="absolute inset-y-0 end-2 flex items-center ps-3 pointer-events-none max-h-10">
                                            <svg
                                                className="w-4 h-4"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="grid gap-1 bg-white border border-slate-200 product-check-input">
                                        {materialsToDisplay.map((material) => (
                                            <div
                                                key={material.id}
                                                className="flex items-center justify-between space-x-4 bg-white p-1 min-h-12 border border-slate-200"
                                            >
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        value={material.material_code}
                                                        checked={data.raw_materials.some(item => item.id === material.material_code)}
                                                        onChange={() => handleRMCheckboxChange(material)}
                                                        className="mr-2 rounded border-gray-300"
                                                    />
                                                    {material.material_code} -- {material.material_name}
                                                </label>
                                                {data.raw_materials.some(item => item.id === material.material_code) && (
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={data.raw_materials.find(item => item.id === material.material_code)?.quantity || 0}
                                                            min={0}
                                                            onChange={(e) => {
                                                                const updatedRawMaterials = data.raw_materials.map(item =>
                                                                    item.id === material.material_code
                                                                        ? { ...item, quantity: Math.max(0, Number(e.target.value)) }
                                                                        : item
                                                                );
                                                                setData('raw_materials', updatedRawMaterials);
                                                            }}
                                                            className="w-24 border-red rounded-md shadow-sm"
                                                            placeholder='Kgs'
                                                        />
                                                    </label>
                                                )}

                                            </div>
                                        ))}
                                    </div>
                                    {/* Pagination Buttons */}
                                    <div className="flex mt-4 gap-2">
                                        {rawMaterialsLimit > 10 && (
                                            <button
                                                type="button"
                                                onClick={() => setRawMaterialsLimit(Math.max(10, rawMaterialsLimit - 10))}
                                                className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300 text-white transition duration-200"
                                            >
                                                Show Less
                                            </button>
                                        )}
                                        {materialsSource.length > rawMaterialsLimit && (
                                            <button
                                                type="button"
                                                onClick={() => setRawMaterialsLimit(rawMaterialsLimit + 10)}
                                                className="px-4 py-2 border rounded text-white transition duration-200"
                                            >
                                                Load More
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Create Vendor
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
