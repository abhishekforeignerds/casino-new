import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';
import Select from "react-select";
import { searchFormIcon, uploadFileIcon } from './././../../../utils/svgIconContent';
import { indianStates } from '@/Components/indianStateUtils';

export default function Create({ message, finished_goods, raw_materials, fgrm }) {
    const { data, setData, post, processing, errors } = useForm({
        plant_name: '',
        location: '',
        status: '',
        capacity: '100',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        finished_goods: [],
        raw_materials: [],
    });

    const [step, setStep] = useState(1);
    const [finishedGoodsSearch, setFinishedGoodsSearch] = useState("");
    const [rawMaterialsSearch, setRawMaterialsSearch] = useState("");
    const [finishedGoodsLimit, setFinishedGoodsLimit] = useState(10);
    const [rawMaterialsLimit, setRawMaterialsLimit] = useState(10);
    // Modified handleSubmit to switch to the correct step based on error keys
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('plants.store'), {
            onError: (errors) => {
                const errorKeys = Object.keys(errors);
                // Check for errors in basic plant fields (Step 1)
                if (errorKeys.some(key => ['plant_name', 'status', 'address', 'city', 'state', 'zip', 'country'].includes(key))) {
                    setStep(1);
                }
                // Check for errors related to finished goods (Step 2)
                else if (errorKeys.some(key => key.startsWith('finished_goods'))) {
                    setStep(2);
                }
                // Check for errors related to raw materials (Step 3)
                else if (errorKeys.some(key => key.startsWith('raw_materials'))) {
                    setStep(3);
                }
            }
        });
    };

    const handleCheckboxChange = (id, material_code) => {
        const idStr = id.toString();
        let updatedGoods;

        // Toggle selection for finished_goods
        if (data.finished_goods.some(item => item.id === idStr)) {
            updatedGoods = data.finished_goods.filter(item => item.id !== idStr);
        } else {
            updatedGoods = [
                ...data.finished_goods,
                { id: idStr, quantity: '', material_code: material_code }
            ];
        }

        setData('finished_goods', updatedGoods);

        // Get all checked material codes
        const totalCheckedMaterialCodes = updatedGoods.map(item => item.material_code);
        // Identify missing codes (checked codes not present in fgrm fg_code)
        const missingCodes = totalCheckedMaterialCodes.filter(code =>
            !fgrm.some(item => item.fg_code === code)
        );
        // Filter fgrm for entries that are NOT missing (i.e., their fg_code is in totalCheckedMaterialCodes)
        const availableFgrm = fgrm.filter(item =>
            totalCheckedMaterialCodes.includes(item.fg_code)
        );
    };

    const handleRMCheckboxChange = (id) => {
        const idStr = id.toString();
        // Toggle raw_materials checkbox selection
        if (data.raw_materials.some(item => item.id === idStr)) {
            setData('raw_materials', data.raw_materials.filter(item => item.id !== idStr));
        } else {
            setData('raw_materials', [...data.raw_materials, { id: idStr, quantity: '' }]);
        }
    };

    // Filtering and display logic for Finished Goods
    const filteredFinishedGoods = finished_goods.filter(good =>
        good.material_name.toLowerCase().includes(finishedGoodsSearch.toLowerCase()) ||
        good.material_code.toLowerCase().includes(finishedGoodsSearch.toLowerCase())
    );
    const displayedFinishedGoods = finishedGoodsSearch ? filteredFinishedGoods : finished_goods;

    // Filtering and display logic for Raw Materials
    const filteredRawMaterials = raw_materials.filter(material =>
        material.material_name.toLowerCase().includes(rawMaterialsSearch.toLowerCase()) ||
        material.material_code.toLowerCase().includes(rawMaterialsSearch.toLowerCase())
    );
    const displayedRawMaterials = rawMaterialsSearch ? filteredRawMaterials : raw_materials;
    const goodsSource = finishedGoodsSearch ? filteredFinishedGoods : finished_goods;
    const goodsToDisplay = goodsSource.slice(0, finishedGoodsLimit);

    const materialsSource = rawMaterialsSearch ? filteredRawMaterials : raw_materials;
    const materialsToDisplay = materialsSource.slice(0, rawMaterialsLimit);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800"></h2>
            }
        >
            <Head title="Create Plant" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'>
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('plants.index')}>Plant Management</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className='text-red'>Add New Plant</span>
                    </p>
                    <Link href={route('plants.index')} className="border border-red py-1 px-14 text-red rounded max-w-max">
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className=" bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'></div>
                            {message && <div className="mb-4 text-green-600">{message}</div>}
                            <form onSubmit={handleSubmit} className='styled-form'>
                                {step === 1 && (
                                    <>
                                        {/* Step 1: Basic Inputs */}
                                        <h2 className='font-semibold text-3xl mb-6'>Add a New Plant</h2>
                                        <div className='theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Plant Name*</label>
                                                <input
                                                    type="text"
                                                    value={data.plant_name}
                                                    onChange={(e) => setData('plant_name', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder='Enter Plant Name'
                                                />
                                                {errors.plant_name && <div className="text-errorRed text-sm">{errors.plant_name}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Status*</label>
                                                <select
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="active">Active</option>
                                                    <option value="maintenance">Maintenance</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                                {errors.status && <div className="text-errorRed text-sm">{errors.status}</div>}
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-gray-700">Address*</label>
                                                <input
                                                    type="text"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder='Enter Address'
                                                />
                                                {errors.address && <div className="text-errorRed text-sm">{errors.address}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">City*</label>
                                                <input
                                                    type="text"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder='Enter City'
                                                />
                                                {errors.city && <div className="text-errorRed text-sm">{errors.city}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">State/Region*</label>
                                                <Select
                                                    options={indianStates}
                                                    value={indianStates.find((state) => state.value === data.state)}
                                                    onChange={(selectedOption) => setData('state', selectedOption.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm text-gray-700"
                                                    classNamePrefix="react-select"
                                                    placeholder="Search or Select State"
                                                    isSearchable
                                                />
                                                {errors.state && <div className="text-errorRed text-sm">{errors.state}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">ZIP*</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={data.zip}
                                                    onChange={(e) => setData('zip', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder='Enter ZIP Code'
                                                />
                                                {errors.zip && <div className="text-errorRed text-sm">{errors.zip}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Country*</label>
                                                <select
                                                    value={data.country}
                                                    onChange={(e) => setData('country', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm bg-white "

                                                >
                                                    <option value="">Select Country</option>
                                                    <option value="India">India</option>
                                                </select>
                                                {errors.country && <div className="text-errorRed text-sm">{errors.country}</div>}
                                            </div>

                                        </div>
                                        {/* Next Button */}
                                        <div className="flex justify-start mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="px-8 py-2 font-bold text-white bg-red rounded hover:bg-red-800 max-w-max max-h-[40px]"
                                            >
                                                Next: Finish Goods
                                            </button>
                                        </div>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        {/* Step 2: Finished Goods Selection */}
                                        <div>
                                            <h2 className="font-semibold text-2xl mb-6">
                                                Select Finish Goods Manufactured in this Plant
                                            </h2>
                                            {/* Finished Goods Search */}
                                            <div className='flex gap-2'>
                                                <Link className='text-right bg-red px-4 py-2 rounded-md text-white block max-w-max ml-auto mb-4'
                                                    href={route('plants.createfg')}>Add Item</Link>
                                                <Link className='text-right bg-transparent px-4 py-2 rounded-md text-red max-w-max mb-4 border border-red flex gap-2'
                                                    href={route('plants.importfg')}>Upload File{uploadFileIcon}</Link>
                                            </div>
                                            <div className="relative w-full">
                                                <input
                                                    type="text"
                                                    placeholder="Search Finish Goods..."
                                                    value={finishedGoodsSearch}
                                                    onChange={(e) => {
                                                        setFinishedGoodsSearch(e.target.value);
                                                        // Optionally reset the limit when searching
                                                        setFinishedGoodsLimit(10);
                                                    }}
                                                    className="mb-4 w-full p-2 border pe-8 border-gray-300 rounded-md"
                                                />
                                                <div className="absolute inset-y-0 end-2 flex items-center ps-3 pointer-events-none max-h-10">
                                                    {searchFormIcon}
                                                </div>
                                            </div>
                                            <div className="grid gap-1 bg-white border border-slate-200 product-check-input">
                                                {goodsToDisplay.map((good) => (
                                                    <div
                                                        key={good.id}
                                                        className="flex items-center justify-between space-x-4 bg-white p-1 min-h-12 border border-slate-200"
                                                    >
                                                        <label className="inline-flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                value={good.id}
                                                                checked={data.finished_goods.some(item => item.id === good.id.toString())}
                                                                onChange={() => handleCheckboxChange(good.id, good.material_code)}
                                                                className="mr-2 rounded border-gray-300"
                                                            />
                                                            {good.material_code} -- {good.material_name}
                                                        </label>
                                                        {data.finished_goods.some(item => item.id === good.id.toString()) && (
                                                            <label className="inline-flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={data.finished_goods.find(item => item.id === good.id.toString())?.quantity || 0}
                                                                    min={0}
                                                                    onChange={(e) => {
                                                                        const updatedFinishedGoods = data.finished_goods.map(item =>
                                                                            item.id === good.id.toString() ? { ...item, quantity: Math.max(0, Number(e.target.value)) } : item
                                                                        );
                                                                        setData('finished_goods', updatedFinishedGoods);
                                                                    }}
                                                                    className="w-24 border-red rounded-md shadow-sm"
                                                                    placeholder='Pieces'
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Pagination Buttons */}
                                            <div className="flex gap-2">
                                                {finishedGoodsLimit > 10 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFinishedGoodsLimit(Math.max(10, finishedGoodsLimit - 10))}
                                                        className="px-4 py-2 border rounded text-white transition duration-200"
                                                    >
                                                        Show Less
                                                    </button>
                                                )}
                                                {goodsSource.length > finishedGoodsLimit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFinishedGoodsLimit(finishedGoodsLimit + 10)}
                                                        className="px-4 py-2 border rounded transition duration-200 text-white"
                                                    >
                                                        Load More
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-start gap-2 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="px-8 py-2 border border-red text-red rounded hover:bg-red-100 transition duration-200 border-btn"
                                            >
                                                Back to Previous
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStep(3)}
                                                className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                            >
                                                Next: Raw Materials
                                            </button>
                                        </div>
                                    </>
                                )}
                                {step === 3 && (
                                    <>
                                        {/* Step 3: Raw Materials Selection */}
                                        <div>
                                            <h2 className="font-semibold text-2xl mb-6">
                                                Select Raw Materials required for this Plant
                                            </h2>
                                            {/* Raw Materials Search */}
                                            <div className='flex items-end'></div>
                                            <Link className='ml-auto text-right bg-transparent px-4 py-2 rounded-md text-red max-w-max mb-4 border border-red flex gap-2'
                                                href={route('plants.importrm')}>Upload File{uploadFileIcon}</Link>
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
                                                    {searchFormIcon}
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
                                                                value={material.id}
                                                                checked={data.raw_materials.some(item => item.id === material.id.toString())}
                                                                onChange={() => handleRMCheckboxChange(material.id)}
                                                                className="mr-2 rounded border-gray-300"
                                                            />
                                                            {material.material_code} -- {material.material_name}
                                                        </label>
                                                        {data.raw_materials.some(item => item.id === material.id.toString()) && (
                                                            <label className="inline-flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={data.raw_materials.find(item => item.id === material.id.toString())?.quantity || 0}
                                                                    min={0}
                                                                    onChange={(e) => {
                                                                        const updatedRawMaterials = data.raw_materials.map(item =>
                                                                            item.id === material.id.toString() ? { ...item, quantity: Math.max(0, Number(e.target.value)) } : item
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
                                            <div className="flex gap-2">
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
                                        <div className="flex justify-start gap-2 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="px-8 py-2 border border-red text-red rounded hover:bg-red-100 transition duration-200 border-btn"
                                            >
                                                Back to Previous
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStep(4)}
                                                className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                            >
                                                Next: RM & FG Validation
                                            </button>
                                        </div>
                                    </>
                                )}
                                {step === 4 && (
                                    <>
                                        {/* Determine and display missing FG RM codes */}
                                        <div className="">
                                            <h3 className="font-semibold text-2xl mb-2">Missing FG RM Setting</h3>
                                            <div className='flex gap-2'>
                                                <Link target="_blank" className='text-right bg-red px-8 py-2 rounded-md text-white block max-w-max mb-4'
                                                    href={route('inventory.create')}>Add New</Link>
                                                <Link className='text-right bg-transparent px-4 py-2 rounded-md text-red max-w-max mb-4 border border-red flex gap-2'
                                                    href={route('inventory.import')}>Upload File{uploadFileIcon}</Link>
                                            </div>
                                            {data.finished_goods.length > 0 ? (
                                                (() => {
                                                    const totalCheckedCodes = data.finished_goods.map(
                                                        (item) => item.material_code
                                                    );
                                                    const missingCodes = totalCheckedCodes.filter(
                                                        (code) => !fgrm.some((item) => item.fg_code === code)
                                                    );
                                                    return missingCodes.length > 0 ? (
                                                        <ul className="list-disc pl-5">
                                                            {missingCodes.map((code) => (
                                                                <li key={code}>{code}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>None. All selected FG & RM relations are available</p>
                                                    );
                                                })()
                                            ) : (
                                                <p>No finished goods selected.</p>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-2xl mb-4 mt-6">Available FG RM Settings</h2>
                                            <table className="min-w-full border-collapse text-sm text-center">
                                                <thead>
                                                    <tr>
                                                        <th className="border px-4 py-2 text-red">FG Code</th>
                                                        <th className="border px-4 py-2 text-red">RM Code</th>
                                                        <th className="border px-4 py-2 text-red">Fg Gross wt.</th>
                                                        <th className="border px-4 py-2 text-red">FG Net wt.</th>
                                                        <th className="border px-4 py-2 text-red">Scrap Net wt.</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fgrm
                                                        .filter((item) =>
                                                            // Only include items whose fg_code is among the checked finished goods
                                                            data.finished_goods
                                                                .map((fg) => fg.material_code)
                                                                .includes(item.fg_code)
                                                        )
                                                        .map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="border px-4 py-2">{item.fg_code}</td>
                                                                <td className="border px-4 py-2">{item.rm_code}</td>
                                                                <td className="border px-4 py-2">{item.fg_gross_wt}</td>
                                                                <td className="border px-4 py-2">{item.fg_net_wt}</td>
                                                                <td className="border px-4 py-2">{item.scrap_net_wt}</td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Navigation Buttons */}
                                        <div className="flex justify-start gap-2 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setStep(3)}
                                                className="px-8 py-2 border border-red text-red rounded hover:bg-red-100 transition duration-200 border-btn"
                                            >
                                                Back to Previous
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-8 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700 transition duration-200"
                                            >
                                                Create Plant
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
