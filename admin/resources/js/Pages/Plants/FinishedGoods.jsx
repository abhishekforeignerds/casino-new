import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import { useState } from 'react';
import { totalFinishGoodListIcon, activeFinishGoodsIcon, lowStockRawMaterialsIcon, uploadFileIcon, searchFormIcon } from "./../../../utils/svgIconContent";
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import ItemInfoSkyBlueCard from '@/Components/ItemInfoSkyBlueCard';
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';
import { filterOptions, filterByDate } from '@/Components/FilterUtils';
import Pagination from '@/Components/Pagination';

export default function View({ finishedGoods, statusCounts }) {
    const [search, setSearch] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all'); // Default: All Time
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDropdown, setOpenDropdown] = useState(null);

    const { auth } = usePage().props;
    const user = usePage().props.auth.user;
    const userRoles = auth?.user?.roles || [];
    const userPlantId = user.plant_id;

    // Default sorting for plant is ascending ('asc')
    const [plantSort, setPlantSort] = useState('asc');

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
    };

    // Toggle plant sort order between ascending and descending.
    const togglePlantSort = () => {
        setPlantSort(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    // Debug: Log user information
    // console.log("User roles:", userRoles);
    // console.log("User Plant ID:", userPlantId);

    let filteredMaterials = [];

    if (userRoles[0] !== "Super Admin") {
        // For non–Super Admin users, filter only by plant id.
        filteredMaterials = finishedGoods.filter((item) => {
            // Convert both to numbers before comparing.
            const plantMatch = Number(item.plant_id) === Number(userPlantId);
            // console.log(
            //     `Checking item ${item.id} with plant_id ${item.plant_id} (type: ${typeof item.plant_id}) against userPlantId ${userPlantId} (type: ${typeof userPlantId}):`,
            //     plantMatch
            // );
            return plantMatch;
        });
        // console.log("Non–Super Admin filtered materials:", filteredMaterials);
    } else {
        // For Super Admin, apply search and date filters and ensure status is not "deleted".
        filteredMaterials = finishedGoods.filter((item) => {
            const matchesSearch =
                item.item_description.toLowerCase().includes(search.toLowerCase()) ||
                item.item_code.toLowerCase().includes(search.toLowerCase());
            const matchesDate = filterByDate(item.created_at, selectedFilter);
            const includeItem = matchesSearch && matchesDate && item.status !== "deleted";
            // console.log(
            // `Super Admin - Checking item ${item.id}: search(${matchesSearch}), date(${matchesDate}), status(${item.status}) -> Include:`,
            //     includeItem
            // );
            return includeItem;
        });
        // console.log("Super Admin filtered materials:", filteredMaterials);
    }

    // Calculate counts for the cards.
    // For Super Admin, use the counts coming from the server.
    // For non–Super Admin users, count based on the filteredMaterials.
    let totalCount, availableCount, lowStockCount;
    if (userRoles[0] !== "Super Admin") {
        totalCount = filteredMaterials.length;
        availableCount = filteredMaterials.filter(item => item.status === 'available').length;
        lowStockCount = filteredMaterials.filter(item => item.status === 'low_stock').length;
    } else {
        totalCount = statusCounts.allFinishedGoods;
        availableCount = statusCounts.availableFinishedGoods;
        lowStockCount = statusCounts.lowStockFinishedGoods;
    }

    // If the user is a Super Admin, sort by the plant name based on the plantSort order.
    let sortedMaterials = filteredMaterials;
    if (userRoles[0] === "Super Admin" && plantSort) {
        sortedMaterials = [...filteredMaterials].sort((a, b) => {
            const nameA = a.plant.plant_name.toUpperCase();
            const nameB = b.plant.plant_name.toUpperCase();
            if (nameA < nameB) return plantSort === 'asc' ? -1 : 1;
            if (nameA > nameB) return plantSort === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const currentPath = window.location.pathname;

    const handleRowsPerPageChange = (rows) => {
        setRowsPerPage(rows);
        setCurrentPage(1); // Reset to page 1 when rows change
    };

    // Pagination calculations
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentMaterials = sortedMaterials.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(sortedMaterials.length / rowsPerPage);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">
                Finished Goods {userRoles[0] === "Super Admin" ? "List" : "Inventory"}
            </h2>}>
            <Head title={`Finished Goods ${userRoles[0] === "Super Admin" ? "List" : "Inventory"}`} />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div className=''>
                        <p className='flex flex-wrap'>
                            <Link href={route('dashboard')}>Dashboard</Link>
                            <FiChevronRight size={24} color="black" />
                            <Link href={route('plants.index')}>{userRoles[0] === "Super Admin" ? "Plant" : "Inventory"} Management</Link>
                            <FiChevronRight size={24} color="black" />
                            <span className='text-red'>Finish Goods {userRoles[0] === "Super Admin" ? "List" : "Inventory"}</span>
                        </p>
                        {/* Status Cards */}
                        <div className="flex my-6 flex-col gap-6 md:flex-row">
                            <ItemInfoRedCard svgIcon={totalFinishGoodListIcon} cardHeading='Total Finish Goods' description={totalCount} />
                            <ItemInfoGreeCard svgIcon={activeFinishGoodsIcon} cardHeading='Active Finish Goods' description={availableCount} />
                            <ItemInfoSkyBlueCard svgIcon={lowStockRawMaterialsIcon} cardHeading='Low Stock Finish Goods' description={lowStockCount} />
                        </div>
                        <div className='flex gap-2 justify-end'></div>
                    </div>
                    <div className='flex gap-2'>
                        <Link className='text-right bg-red px-4 py-2 rounded-md text-white block max-w-max ml-auto mb-4'
                            href={route('plants.createfg')}>
                            Add Item
                        </Link>
                        <Link className='text-right bg-transparent px-4 py-2 rounded-md text-red max-w-max mb-4 border border-red flex gap-2'
                            href={route('plants.importfg')}>
                            Upload File{uploadFileIcon}
                        </Link>
                    </div>
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4 gap-2'>
                                <h2 className='font-bold text-2xl'>Finish Goods {userRoles[0] === "Super Admin" ? "List" : "Inventory"}</h2>
                                <div className='flex items-center justify-end flex-1 gap-2'>
                                    <form className="flex items-center max-w-sm">
                                        <label htmlFor="material-search" className="sr-only">Search by Name or Email</label>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                id="material-search"
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-8 p-2.5 placeholder:text-black"
                                                placeholder="Search by Code or Name"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                            <div className="absolute inset-y-0 end-2 flex items-center ps-3 pointer-events-none">
                                                {searchFormIcon}
                                            </div>
                                        </div>
                                    </form>
                                    <div>
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
                                        <tr className="border-b">
                                            <th className="px-2 py-3 text-red text-left text-sm">Item Code</th>
                                            <th className="px-2 py-3 text-red text-left text-sm">Item Description</th>
                                            <th
                                                onClick={togglePlantSort}
                                                className="cursor-pointer flex items-center px-2 py-3 text-red text-left text-sm"
                                            >
                                                Plant Name
                                                {plantSort === 'desc' && <FiChevronRight className="transform -rotate-90 ml-1" />}
                                                {plantSort === 'asc' && <FiChevronRight className="transform rotate-90 ml-1" />}
                                            </th>
                                            {userRoles[0] !== "Super Admin" && (
                                                <th className="px-2 py-3 text-red text-left text-sm">Reorder Level</th>
                                            )}
                                            <th className="px-2 py-3 text-red text-left text-sm">Available</th>
                                            <th className="px-2 py-3 text-red text-left text-sm">Status</th>
                                            <th className="px-2 py-3 text-red text-left text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentMaterials.map(material => (
                                            <tr key={material.id} className="border-b">
                                                <td className="px-2 py-3 text-sm font-semibold">{material.item_code}</td>
                                                <td className="px-2 py-3 text-sm">{material.item_description}</td>
                                                <td className="px-2 py-3 text-sm">
                                                    {material.plant.plant_name}
                                                </td>
                                                {userRoles[0] !== "Super Admin" && (
                                                    <td className="px-2 py-3 text-sm">
                                                        {material.reorder_level} {material.unit}
                                                    </td>
                                                )}
                                                <td className="px-2 py-3 text-sm">
                                                    {material.quantity} {material.unit}
                                                </td>
                                                <td className="px-2 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(material.status)}`}>
                                                        {getStatusText(material.status)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 text-sm relative">
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
                                                                <Link href={route('plants.viewfg', material.id)} className="text-blue-500 hover:underline">
                                                                    View
                                                                </Link>
                                                                <Link href={route('plants.editFgList', material.id)} className="text-blue-500 hover:underline">
                                                                    Edit
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
