import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { useState, useMemo } from 'react';
import Select from "react-select";
import { searchFormIcon, uploadFileIcon } from './././../../../utils/svgIconContent';
import {indianStates} from '@/Components/indianStateUtils';

export default function Edit({
    plant,
    message,
    finishedGoods,
    selectedFinishedGoods,
    rawMaterials,
    selectedRawMaterials,
}) {
    // Precompute initial quantities for finished goods using useMemo
    const initialFinishedQuantities = useMemo(() => {
        return (selectedFinishedGoods || []).reduce((acc, item) => {
            acc[item.id.toString()] = parseInt(item.quantity) || 0;
            return acc;
        }, {});
    }, [selectedFinishedGoods]);

    // Precompute initial quantities for raw materials using useMemo
    const initialRawQuantities = useMemo(() => {
        return (selectedRawMaterials || []).reduce((acc, item) => {
            acc[item.id.toString()] = parseInt(item.quantity) || 0;
            return acc;
        }, {});
    }, [selectedRawMaterials]);

    const { data, setData, put, processing, errors } = useForm({
        plant_name: plant.plant_name || '',
        location: plant.location || '',
        status: plant.status || '',
        capacity: plant.capacity || '100',
        address: plant.address || '',
        city: plant.city || '',
        state: plant.state || '',
        zip: plant.zip || '',
        country: plant.country || '',
        finished_goods: selectedFinishedGoods || [],
        raw_materials: selectedRawMaterials || [],
    });



    const [step, setStep] = useState(1);
    const [finishedGoodsSearch, setFinishedGoodsSearch] = useState("");
    const [rawMaterialsSearch, setRawMaterialsSearch] = useState("");
    const [finishedGoodsLimit, setFinishedGoodsLimit] = useState(10);
    const [rawMaterialsLimit, setRawMaterialsLimit] = useState(10);
    // Filtering and limiting view for Finished Goods
    const filteredFinishedGoods = finishedGoods.filter((good) =>
        good.material_name.toLowerCase().includes(finishedGoodsSearch.toLowerCase()) ||
        good.material_code.toLowerCase().includes(finishedGoodsSearch.toLowerCase())
    );
    const displayedFinishedGoods = finishedGoodsSearch ? filteredFinishedGoods : finishedGoods;

    const goodsSource = finishedGoodsSearch ? filteredFinishedGoods : finishedGoods;
    const goodsToDisplay = goodsSource.slice(0, finishedGoodsLimit);
    // Filtering and limiting view for Raw Materials
    const filteredRawMaterials = rawMaterials.filter((material) =>
        material.material_name.toLowerCase().includes(rawMaterialsSearch.toLowerCase()) ||
        material.material_code.toLowerCase().includes(rawMaterialsSearch.toLowerCase())
    );
    const displayedRawMaterials = rawMaterialsSearch ? filteredRawMaterials : rawMaterials;
    const materialsSource = rawMaterialsSearch ? filteredRawMaterials : rawMaterials;
    const materialsToDisplay = materialsSource.slice(0, rawMaterialsLimit);

    // Finished Goods handler: toggles selection and adds an object with quantity.
    const handleFinishedCheckboxChange = (id) => {
        id = id.toString();
        const exists = data.finished_goods.some((item) => item.id === id);
        if (exists) {
            setData('finished_goods', data.finished_goods.filter((item) => item.id !== id));
        } else {
            setData('finished_goods', [
                ...data.finished_goods,
                { id, quantity: '' },
            ]);
        }
    };

    // Raw Materials handler: toggles selection and adds an object with quantity.
    const handleRawMaterialCheckboxChange = (id) => {
        id = id.toString();
        const exists = data.raw_materials.some((item) => item.id === id);
        if (exists) {
            setData('raw_materials', data.raw_materials.filter((item) => item.id !== id));
        } else {
            setData('raw_materials', [
                ...data.raw_materials,
                { id, quantity: '' },
            ]);
        }
    };

    // Modified handleSubmit with error-based step switching.
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('plants.update', plant.id), {
            onError: (errors) => {
                const errorKeys = Object.keys(errors);
                if (errorKeys.some(key => ['plant_name', 'status', 'address', 'city', 'state', 'zip', 'country'].includes(key))) {
                    setStep(1);
                } else if (errorKeys.some(key => key.startsWith('finished_goods'))) {
                    setStep(2);
                } else if (errorKeys.some(key => key.startsWith('raw_materials'))) {
                    setStep(3);
                }
            }
        });
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Plant
                </h2>
            }
        >
            <Head title="Edit Plant" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className="flex">
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('plants.index')}>Plant Management</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className="text-red">Edit Plant</span>
                    </p>
                    <Link
                        href={route('plants.index')}
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {message && (
                                <div className="mb-4 text-green-600">{message}</div>
                            )}
                            <form onSubmit={handleSubmit} className="styled-form">
                                {step === 1 && (
                                    <>
                                        <h2 className="font-semibold text-3xl mb-6">Edit Plant</h2>
                                        <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Plant Name*</label>
                                                <input
                                                    type="text"
                                                    value={data.plant_name}
                                                    onChange={(e) => setData('plant_name', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder="Enter Plant Name"
                                                />
                                                {errors.plant_name && (
                                                    <div className="text-errorRed text-sm">{errors.plant_name}</div>
                                                )}
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
                                                    {/* <option value="maintenance">Maintenance</option>
                          <option value="inactive">Inactive</option> */}
                                                </select>
                                                {errors.status && (
                                                    <div className="text-errorRed text-sm">{errors.status}</div>
                                                )}
                                            </div>
                                            {/* <div className="mb-4">
                                                <label className="block text-gray-700">Capacity(%)</label>
                                                <input
                                                    type="number"
                                                    value={data.capacity}
                                                    onChange={(e) => setData('capacity', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder="Enter Capacity"
                                                />
                                                {errors.capacity && (
                                                    <div className="text-errorRed text-sm">{errors.capacity}</div>
                                                )}
                                            </div> */}
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Address*</label>
                                                <input
                                                    type="text"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder="Enter Address"
                                                />
                                                {errors.address && (
                                                    <div className="text-errorRed text-sm">{errors.address}</div>
                                                )}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">City*</label>
                                                <input
                                                    type="text"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder="Enter City"
                                                />
                                                {errors.city && (
                                                    <div className="text-errorRed text-sm">{errors.city}</div>
                                                )}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">State/Region*</label>
                                                <Select
                                                    options={indianStates}
                                                    value={indianStates.find((state) => state.value === data.state)}
                                                    onChange={(selectedOption) => setData('state', selectedOption.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm text-gray-700 focus:red"
                                                    classNamePrefix="react-select"
                                                    placeholder="Search or Select State"
                                                    isSearchable
                                                />
                                                {errors.state && <div className="text-errorRed text-sm">{errors.state}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Zip Code*</label>
                                                <input
                                                    type="text"
                                                    value={data.zip}
                                                    onChange={(e) => setData('zip', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder="Enter ZIP Code"
                                                />
                                                {errors.zip && (
                                                    <div className="text-errorRed text-sm">{errors.zip}</div>
                                                )}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Country*</label>
                                                <select
                                                    value={data.country}
                                                    onChange={(e) => setData('country', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm bg-white cursor-not-allowed"
                                                    disabled
                                                >
                                                    <option value="India">India</option>
                                                </select>
                                                {errors.country && <div className="text-errorRed text-sm">{errors.country}</div>}
                                            </div>
                                        </div>
                                        <div className="flex justify-start mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="px-8 py-2 font-bold text-white bg-red rounded hover:bg-red-800"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <h2 className="font-semibold text-2xl mb-6">
                                            Select Finish Goods Manufactured in this Plant
                                        </h2>
                                        <div>
                                            <h3 className="font-semibold text-md mb-4 text-red">Finish Goods</h3>
                                            {/* Search input for Finished Goods */}
                                            <div className="relative w-full">
                                                <input
                                                    type="text"
                                                    placeholder="Search Finish Goods..."
                                                    value={finishedGoodsSearch}
                                                    onChange={(e) => {
                                                        setFinishedGoodsSearch(e.target.value);
                                                        setFinishedGoodsLimit(10); // Reset limit on search change
                                                    }}
                                                    className="mb-4 w-full p-2 border pe-8 border-gray-300 rounded-md"
                                                />
                                                <div className="absolute inset-y-0 end-2 flex items-center ps-3 pointer-events-none max-h-10">
                                                    {searchFormIcon}
                                                </div>
                                            </div>
                                            <div className="grid gap-1 bg-white border border-slate-200">
                                                {errors.finished_goods && (
                                                    <div className="text-errorRed text-sm">{errors.finished_goods}</div>
                                                )}
                                                {goodsToDisplay.map((good) => {
                                                    const computedMax = good.plant_allocated_quantity + (initialFinishedQuantities[good.id.toString()] || 0);
                                                    const currentValue = data.finished_goods.find(
                                                        (item) => item.id === good.id.toString()
                                                    )?.quantity || '';
                                                    return (
                                                        <div
                                                            key={good.id}
                                                            className="flex items-center justify-between space-x-4 bg-white p-1 min-h-12 border border-slate-200"
                                                        >
                                                            <label className="inline-flex items-center">
                                                                <input
                                                                    min={0}
                                                                    type="checkbox"
                                                                    value={good.id}
                                                                    checked={data.finished_goods.some(
                                                                        (item) => item.id === good.id.toString()
                                                                    )}
                                                                    onChange={() => handleFinishedCheckboxChange(good.id)}
                                                                    className="mr-2 rounded border-gray-300"
                                                                />
                                                                {good.material_code} -- {good.material_name}
                                                            </label>
                                                            {data.finished_goods.some(
                                                                (item) => item.id === good.id.toString()
                                                            ) && (
                                                                    <div>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            value={currentValue < 0 ? 0 : currentValue}
                                                                            onChange={(e) => {
                                                                                const newValue = Math.max(0, Number(e.target.value));
                                                                                const updatedFinishedGoods = data.finished_goods.map((item) =>
                                                                                    item.id === good.id.toString() ? { ...item, quantity: newValue } : item
                                                                                );
                                                                                setData('finished_goods', updatedFinishedGoods);
                                                                            }}
                                                                            className="w-24 border-red rounded-md shadow-sm"
                                                                        />
                                                                    </div>
                                                                )}
                                                        </div>
                                                    );
                                                })}
                                                {errors.finished_goods && (
                                                    <div className="text-errorRed text-sm">{errors.finished_goods}</div>
                                                )}
                                            </div>
                                            {/* Pagination Buttons for Finished Goods */}
                                            <div className="flex mt-4 gap-2">
                                                {finishedGoodsLimit > 10 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFinishedGoodsLimit(Math.max(10, finishedGoodsLimit - 10))}
                                                        className="text-white px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300 transition duration-200"
                                                    >
                                                        Show Less
                                                    </button>
                                                )}
                                                {goodsSource.length > finishedGoodsLimit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFinishedGoodsLimit(finishedGoodsLimit + 10)}
                                                        className="px-4 text-white py-2 border rounded bg-gray-200 hover:bg-gray-300 transition duration-200"
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
                                        <h2 className="font-semibold text-2xl mb-6">
                                            Select Raw Materials for this Plant
                                        </h2>
                                        <div>
                                            <h3 className="font-semibold text-md mb-4 text-red">Raw Materials</h3>
                                            {/* Search input for Raw Materials */}
                                            <div className="relative w-full">
                                                <input
                                                    type="text"
                                                    placeholder="Search Raw Materials..."
                                                    value={rawMaterialsSearch}
                                                    onChange={(e) => {
                                                        setRawMaterialsSearch(e.target.value);
                                                        setRawMaterialsLimit(10); // Reset limit on search change
                                                    }}
                                                    className="mb-4 w-full p-2 border border-gray-300 pe-8 rounded-md"
                                                />
                                                <div className="absolute inset-y-0 end-2 flex items-center ps-3 pointer-events-none max-h-10">
                                                    {searchFormIcon}
                                                </div>
                                            </div>
                                            <div className="grid gap-1 bg-white border border-slate-200">
                                                {errors.raw_materials && (
                                                    <div className="text-errorRed text-sm">{errors.raw_materials}</div>
                                                )}
                                                {materialsToDisplay.map((material) => {
                                                    const computedMax = material.plant_allocated_quantity + (initialRawQuantities[material.id.toString()] || 0);
                                                    const currentValue = data.raw_materials.find(
                                                        (item) => item.id === material.id.toString()
                                                    )?.quantity || '';
                                                    return (
                                                        <div
                                                            key={material.id}
                                                            className="flex items-center justify-between space-x-4 bg-white p-1 min-h-12 border border-slate-200"
                                                        >
                                                            <label className="inline-flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    value={material.id}
                                                                    checked={data.raw_materials.some(
                                                                        (item) => item.id === material.id.toString()
                                                                    )}
                                                                    onChange={() => handleRawMaterialCheckboxChange(material.id)}
                                                                    className="mr-2 rounded border-gray-300"
                                                                />
                                                                {material.material_code} -- {material.material_name}
                                                            </label>
                                                            {data.raw_materials.some(
                                                                (item) => item.id === material.id.toString()
                                                            ) && (
                                                                    <div>
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            value={currentValue < 0 ? 0 : currentValue}
                                                                            onChange={(e) => {
                                                                                const newValue = Math.max(0, Number(e.target.value));
                                                                                const updatedRawMaterials = data.raw_materials.map((item) =>
                                                                                    item.id === material.id.toString() ? { ...item, quantity: newValue } : item
                                                                                );
                                                                                setData('raw_materials', updatedRawMaterials);
                                                                            }}
                                                                            className="w-24 border-red rounded-md shadow-sm"
                                                                        />
                                                                    </div>
                                                                )}
                                                        </div>
                                                    );
                                                })}
                                                {errors.raw_materials && (
                                                    <div className="text-errorRed text-sm">{errors.raw_materials}</div>
                                                )}
                                            </div>
                                            {/* Pagination Buttons for Raw Materials */}
                                            <div className="flex mt-4 gap-2">
                                                {rawMaterialsLimit > 10 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRawMaterialsLimit(Math.max(10, rawMaterialsLimit - 10))}
                                                        className="px-4 py-2 border text-white rounded bg-gray-200 hover:bg-gray-300 transition duration-200"
                                                    >
                                                        Show Less
                                                    </button>
                                                )}
                                                {materialsSource.length > rawMaterialsLimit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRawMaterialsLimit(rawMaterialsLimit + 10)}
                                                        className="px-4 py-2 border text-white rounded bg-gray-200 hover:bg-gray-300 transition duration-200"
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
                                                Back to Finish Goods
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                            >
                                                Update Plant
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
