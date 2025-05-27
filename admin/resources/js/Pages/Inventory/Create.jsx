import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';

function SearchableSelect({ options, value, onChange, className, placeholder, valueField, displayField, filterField }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const containerRef = useRef(null);

    const filteredOptions = options.filter(option =>
        option[filterField]?.toLowerCase().includes(filter.toLowerCase())
    );

    const selectedOption = options.find(option => option[valueField] === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`${className} cursor-pointer flex justify-between items-center border border-gray-300 rounded px-3 py-2 bg-white`}
            >
                <span>{selectedOption ? selectedOption[displayField] : placeholder}</span>
                <FiChevronRight className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow-lg">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full p-2 border-b border-gray-300 focus:outline-none"
                    />
                    <ul className="max-h-60 overflow-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <li
                                    key={option[valueField]}
                                    onClick={() => {
                                        onChange(option[valueField]);
                                        setIsOpen(false);
                                        setFilter('');
                                    }}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {option[displayField]}
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-gray-500">No options found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function Create({ rawMaterials, finishedGoods, unvalidated_fg_codes }) {

    const { data, setData, post, processing, errors } = useForm({
        fg_code: '',

        rm_code: '',

        fg_gross_wt: '',
        fg_net_wt: '',
        scrap_net_wt: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inventory.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create RM Setting for FG</h2>}
        >
            <Head title="Create RM Setting" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto pt-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className="flex">
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('inventory.index')}>RM Settings</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className="text-red">Create RM Setting</span>
                    </p>
                    <Link href={route('inventory.index')} className="border border-red py-1 px-14 text-red rounded">
                        Back
                    </Link>
                </div>

                <div className="mx-auto py-6">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            {unvalidated_fg_codes.length > 0 && (<h4 className="font-semibold text-xl mb-6">Unvalidated FGs : {unvalidated_fg_codes.join('  - ')}</h4>)}
                            <h2 className="font-semibold text-3xl mb-6">Create New RM Setting</h2>
                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Finished Good Selection */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Finished Good*</label>
                                        <SearchableSelect
                                            options={finishedGoods}
                                            value={data.fg_code}
                                            onChange={(val) => setData('fg_code', val)}
                                            className="w-full mt-1 text-sm text-gray-500 tracking-wider"
                                            placeholder="Select Finished Good"
                                            valueField="material_code"
                                            displayField="material_code"
                                            filterField="material_code"
                                        />
                                        {errors.fg_code && <div className="text-errorRed text-sm">{errors.fg_code}</div>}
                                    </div>

                                    {/* Raw Material Selection */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Raw Material*</label>
                                        <SearchableSelect
                                            options={rawMaterials}
                                            value={data.rm_code}
                                            onChange={(val) => setData('rm_code', val)}
                                            className="w-full mt-1 text-sm text-gray-500 tracking-wider"
                                            placeholder="Select Raw Material"
                                            valueField="material_code"
                                            displayField="material_code"
                                            filterField="material_code"
                                        />
                                        {errors.rm_code && <div className="text-errorRed text-sm">{errors.rm_code}</div>}
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
                                            min="0"
                                            step="any"
                                        />
                                        {errors.fg_gross_wt && <div className="text-errorRed text-sm">{errors.fg_gross_wt}</div>}
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
                                            min="0"
                                            step="any"
                                        />
                                        {errors.fg_net_wt && <div className="text-errorRed text-sm">{errors.fg_net_wt}</div>}
                                    </div>

                                    {/* Scrap Net Weight */}
                                    {/* <div className="mb-4">
                                        <label className="block text-gray-700">Scrap Net Weight*</label>
                                        <input
                                            type="number"
                                            value={data.scrap_net_wt}
                                            onChange={(e) => setData('scrap_net_wt', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Scrap Net Weight"
                                            min="0"
                                            step="any"
                                        />
                                        {errors.scrap_net_wt && <div className="text-red-500 text-sm">{errors.scrap_net_wt}</div>}
                                    </div> */}
                                </div>

                                <button type="submit" disabled={processing} className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-red-800">
                                    Create RM Setting
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
