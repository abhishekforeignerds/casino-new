import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { FiMoreVertical } from "react-icons/fi";
import OptionsDropdown from '../../Components/styledComponents/optionsToggle';
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import { ItemInfoBlueCard } from '@/Components/ItemInfoBlueCard';
import { totalPlantsIcon, activePlantsIcon, maintenanceIcon, totalCapicityIcon, searchFormIcon } from './../../../utils/svgIconContent'
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';
import { filterOptions, filterByDate } from '@/Components/FilterUtils';
import Pagination from '@/Components/Pagination';

export default function View({ plants, statusCounts }) {
    const [search, setSearch] = useState('');
    const { flash = {} } = usePage().props;
    const showFlash = useAutoHideFlash(flash.success);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDropdown, setOpenDropdown] = useState(null);
    // Extract unique months from the `created_at` field
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Filter plants based on search term and selected daterange
    const filteredPlants = plants.filter(plant => {
        const matchesSearch =
            search === '' ||
            plant.plant_name.toLowerCase().includes(search.toLowerCase()) ||
            plant.city.toLowerCase().includes(search.toLowerCase());
        const matchesDate =
            selectedFilter === 'all' ? true : filterByDate(plant.created_at, selectedFilter);
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

    // Pagination calculations
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentPlants = filteredPlants.slice(indexOfFirstRow, indexOfFirstRow + rowsPerPage);
    const totalPages = Math.ceil(filteredPlants.length / rowsPerPage);

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Plants
                </h3>
            }
        >
            <Head title="Plants" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div className=''>
                        <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /><Link href={route('plants.index')}>Plant Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Plant List</span></p>
                        {/* Status Cards */}
                        <div className="flex my-6 flex-col gap-6 md:flex-row">
                            <ItemInfoRedCard svgIcon={totalPlantsIcon} cardHeading='Total Plants' description={statusCounts.allPlants} />
                            {/* Active plants */}
                            <ItemInfoGreeCard svgIcon={activePlantsIcon} cardHeading='Active Plants' description={statusCounts.availablePlants} />
                            {/* Pending Approval */}
                            <ItemInfoBlueCard svgIcon={maintenanceIcon} cardHeading='Maintenance' description={statusCounts.maintenancePlants} />
                        </div>
                        <Link className='text-right bg-red px-4 py-2 rounded-md text-white block max-w-max ml-auto mb-4'
                            href={route('plants.create')}>Create Plants</Link>

                    </div>
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className='flex items-center justify-between flex-1 gap-2'>
                                <h2 className='font-bold text-2xl'>Plant List</h2>
                                <div className='flex gap-2'>
                                    <form className="flex items-center max-w-sm">
                                        <label htmlFor="simple-search" className="sr-only">Search by Plant Name or Location</label>
                                        <div className="relative w-full">

                                            <input
                                                type="text"
                                                id="simple-search"
                                                className="bg-white border border-gray-300 text-gray-900 text-sm placeholder:text-black rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-8 p-2.5"
                                                placeholder="Search by Plant Name or Location"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                            <div className="absolute inset-y-0 end-2 flex items-center ps-3 pointer-events-none">
                                                {searchFormIcon}
                                            </div>
                                        </div>
                                    </form>
                                    <div className="select-box">
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
                            <div className='table-container mt-4'>
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Plant Name</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Location</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Capacity (%)</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPlants.map(plant => (
                                            <tr key={plant.id}>
                                                <td className="px-2 py-3 border-b text-sm font-semibold">{plant.plant_name}</td>
                                                <td className="px-2 py-3 border-b text-sm">{plant.city}</td>
                                                <td className="px-2 py-3 border-b text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(plant.status)}`}>
                                                        {getStatusText(plant.status)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 border-b text-sm">{plant.capacity || 'N/A'}%</td>
                                                <td className="px-2 py-3 border-b text-sm relative">
                                                    <button
                                                        type="button"
                                                        className="flex justify-center items-center size-9 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                                        onClick={() => toggleDropdown(plant.id)}
                                                        aria-haspopup="menu"
                                                        aria-expanded={openDropdown === plant.id ? "true" : "false"}
                                                        aria-label="Dropdown"
                                                    >
                                                        <FiMoreVertical className="size-4 text-gray-600" />
                                                    </button>
                                                    {openDropdown === plant.id && (
                                                        <div
                                                            className="absolute right-0 mt-2 min-w-40 bg-slate-200 shadow-md rounded-lg transition-opacity duration-200 z-10"
                                                            role="menu"
                                                            aria-orientation="vertical"
                                                            onMouseLeave={closeDropdown}
                                                        >
                                                            <div className="space-y-0.5 flex flex-col p-2 gap-1">
                                                                <Link href={route('plants.edit', plant.id)} className="text-blue-500 hover:underline">
                                                                    Edit
                                                                </Link>
                                                                <Link href={route('plants.view', plant.id)} className="text-blue-500 hover:underline">
                                                                    View
                                                                </Link>
                                                            </div>
                                                        </div>)}
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
