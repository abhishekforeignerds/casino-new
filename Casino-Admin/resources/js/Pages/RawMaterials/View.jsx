import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import React, { useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { totalFGandRMInventoryIcon, lowStockRawMaterialsIcon, uploadFileIcon, searchFormIcon } from './../../../utils/svgIconContent';
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';
import { filterOptions, filterByDate } from '@/Components/FilterUtils';
import Pagination from '@/Components/Pagination';

export default function View({ rawMaterials, statusCounts }) {
    const [search, setSearch] = useState('');
    const { flash = {} } = usePage().props;
    const showFlash = useAutoHideFlash(flash.success);
    const showerrorFlash = (flash.error);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDropdown, setOpenDropdown] = useState(null);

    const [selectedFilter, setSelectedFilter] = useState('all'); // Default: All Time

    // Filter materials based on search term and selected date filter
    const filteredMaterials = rawMaterials.filter(material => {
        const matchesSearch =
            material.material_name.toLowerCase().includes(search.toLowerCase()) ||
            material.material_code.toLowerCase().includes(search.toLowerCase());
        const matchesDate = filterByDate(material.created_at, selectedFilter);
        return matchesSearch && matchesDate;
    });

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
    };
    const handleRowsPerPageChange = (rows) => {
        setRowsPerPage(rows);
        setCurrentPage(1); // Reset to page 1 when rows change
    };
    const validMaterials = filteredMaterials.filter(material => material.status !== "deleted");

    // Pagination calculations
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentMaterials = validMaterials.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(validMaterials.length / rowsPerPage);

    const lowStockMaterials = currentMaterials.filter(
        material => material.status === 'unavailable' || material.status === 'low_stock'
    );

    // Initialize form data with the array of material codes.
    const { data, setData, get, processing, errors } = useForm({
        material_codes: lowStockMaterials.map(material => material.material_code),
    });

    // Submit handler
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Raw Materials Inventory</h2>}
        >
            <Head title="View Raw Materials" />
            <div className="main-content-container sm:ml-52">

                <div className="mx-auto py-6">
                    <div className=''>
                        <p className='flex flex-wrap'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />  <Link href={route('raw-materials.index')}>Inventory Management</Link><FiChevronRight size={24} color="black" /> <span className='text-red'>Raw Materials List</span></p>
                        {/* Status Cards */}
                        <div className="flex my-6 flex-col gap-6 md:flex-row">
                            {/* total raw */}
                            <div className="bg-lightPink text-gray-800 p-4 rounded-lg shadow w-full text-center lg:max-w-[25%]">
                                <div className="svg-box bg-red w-12 h-12 flex justify-center items-center rounded-md ml-auto mr-auto mb-4">
                                    {totalFGandRMInventoryIcon}
                                </div>
                                <h3 className="text-md font-medium">Total Raw Materials</h3>
                                <p className="text-2xl">{statusCounts.allRawMaterials}</p>
                            </div>
                            {/* Active raw */}
                            {
                                lowStockMaterials.length > 0 ? (

                                    <Link href={route('raw-materials.lowStockAlert')} className="bg-lightGreen text-gray-800 p-4 rounded-lg shadow w-full text-center lg:max-w-[25%]">
                                        <div className="">
                                            <div className="svg-box bg-green w-12 h-12 flex justify-center items-center rounded-md ml-auto mr-auto mb-4">
                                                {lowStockRawMaterialsIcon}
                                            </div>
                                            <h3 className="text-md font-medium">Low Stock Alerts</h3>
                                            <p className="text-2xl">{statusCounts.lowStockRawMaterials}</p>
                                        </div>
                                    </Link>

                                ) : (
                                    <div className="bg-lightGreen text-gray-800 p-4 rounded-lg shadow w-full text-center lg:max-w-[25%]">
                                        <div className="svg-box bg-green w-12 h-12 flex justify-center items-center rounded-md ml-auto mr-auto mb-4">
                                            {lowStockRawMaterialsIcon}
                                        </div>
                                        <h3 className="text-md font-medium">Low Stock Alerts</h3>
                                        <p className="text-2xl">{statusCounts.lowStockRawMaterials}</p>
                                    </div>
                                )
                            }
                        </div>
                        <div className='flex gap-2 justify-end'>
                            <Link className='text-right bg-red px-4 py-2 rounded-md text-white block max-w-max ml-auto mb-4'
                                href={route('raw-materials.create')}>Add Material</Link>
                            <Link className='text-right bg-transparent px-4 py-2 rounded-md text-red max-w-max mb-4 border border-red flex gap-2'
                                href={route('raw-materials.import')}>Upload File{uploadFileIcon}</Link>
                        </div>
                    </div>
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    {showerrorFlash && flash.error && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.error}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4 gap-2'>
                                <h2 className='font-bold text-2xl'>Raw Material Inventory</h2>
                                <div className='flex items-center justify-end flex-1 gap-2'>
                                    <form className="flex items-center max-w-sm">
                                        <label for="simple-search" className="sr-only">Search by Name or Email</label>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                id="material-search"
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-10 p-2.5"
                                                placeholder="Search by Material Name or Code"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)} // Set search state
                                            />
                                            <div className="absolute inset-y-0 end-4 flex items-center ps-3 pointer-events-none">
                                                {searchFormIcon}
                                            </div>
                                        </div>
                                    </form>
                                    <div className="">
                                        <select
                                            className="border border-gray-300 rounded-md px-8 py-2.5 text-sm"
                                            value={selectedFilter}
                                            onChange={(e) => setSelectedFilter(e.target.value)}
                                        >
                                            {filterOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className='table-container md:overflow-x-visible overflow-x-auto'>
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Item Code</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Material Name</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Available</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Minimum Threshold</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentMaterials.map(material => (
                                            <tr key={material.id}>
                                                <td className="px-2 py-3 border-b text-sm">{material.material_code}</td>
                                                <td className="px-2 py-3 border-b text-sm">{material.material_name}</td>
                                                {/* <td className="px-2 py-3 border-b text-sm">{material.hsn_sac_code}</td> */}
                                                <td className="px-2 py-3 border-b text-sm">
                                                    {material.initial_stock_quantity} {material.unit_of_measurement}
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(material.status)}`}
                                                    >
                                                        {getStatusText(material.status)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    {material.minimum_threshold} {material.unit_of_measurement}
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm relative">
                                                    <button
                                                        type="button"
                                                        className="flex justify-center items-center size-9 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                                        onClick={() => toggleDropdown(material.id)}
                                                        aria-haspopup="menu"
                                                        aria-expanded={openDropdown === material.id ? "true" : "false"}
                                                        aria-label="Dropdown"
                                                    >
                                                        <FiMoreVertical className="size-4 text-gray-600" />
                                                    </button>

                                                    {openDropdown === material.id && (
                                                        <div
                                                            className="absolute right-0 mt-2 min-w-40 bg-slate-200 shadow-md rounded-lg transition-opacity duration-200 z-10"
                                                            role="menu"
                                                            aria-orientation="vertical"
                                                            onMouseLeave={closeDropdown}
                                                        >
                                                            <div className="space-y-0.5 flex flex-col p-2 gap-1">
                                                                <Link href={route('raw-materials.edit', material.id)} className="text-blue-500 hover:underline">
                                                                    Edit
                                                                </Link>
                                                                <Link href={route('raw-materials.view', material.id)} className="text-blue-500 hover:underline">
                                                                    View
                                                                </Link>
                                                                <Link href={route('raw-materials.suspend', material.id)} className="text-blue-500 hover:underline">
                                                                    Delete
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Pagination Controls */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    rowsPerPage={rowsPerPage}
                                    setRowsPerPage={handleRowsPerPageChange}
                                    setCurrentPage={setCurrentPage}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
