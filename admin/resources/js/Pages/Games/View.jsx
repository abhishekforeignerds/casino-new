import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import { useState } from 'react';
import { ItemInfoDarkBlueCard } from '@/Components/ItemInfoDarkBlueCard';
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import { ItemInfoDarkRedCard } from '@/Components/ItemInfoDarkRedCard';
import { totalFGandRMInventoryIcon, lowStockRawMaterialsIcon, uploadFileIcon, searchFormIcon } from '../../../utils/svgIconContent';
import { useAutoHideFlash } from '../../../utils/useAutoHideFlash';
import { getStatusText, getStatusClass } from '../../../utils/statusUtils';
import { filterOptions, filterByDate } from '@/Components/FilterUtils';
import Pagination from '@/Components/Pagination';

export default function View({ games, statusCounts }) {
    const { flash = {} } = usePage().props;
    const [search, setSearch] = useState('');
    const showFlash = useAutoHideFlash(flash.success);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDropdown, setOpenDropdown] = useState(null);


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
    const [selectedFilter, setSelectedFilter] = useState('all'); // Default: All Time

    // Filter games based on search term and selected date filter
    const filteredMaterials = games.filter(item => {
        const matchesSearch =
            item.game_name.toLowerCase().includes(search.toLowerCase()) ||
            item.game_category.toLowerCase().includes(search.toLowerCase());
        const matchesDate = selectedFilter === 'all' ? true : filterByDate(item.created_at, selectedFilter);
        return matchesSearch && matchesDate;
    });

    const validMaterials = filteredMaterials.filter(material => material.status !== "deleted");

    // Pagination calculations
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentMaterials = validMaterials.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(validMaterials.length / rowsPerPage);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Games</h2>}>
            <Head title="Games" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div className=''>
                        <p className='flex flex-wrap'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /> <Link href={route('games.index')}>Games Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Games List</span></p>

                        {/* Status Cards */}
                        <div className="flex my-6 flex-col gap-6 md:flex-row">
                            {/* total users */}
                            <ItemInfoDarkBlueCard svgIcon={totalFGandRMInventoryIcon} cardHeading='Total Games' description={statusCounts.allgames} />
                            {/* Active Users */}
                            <ItemInfoDarkRedCard svgIcon={lowStockRawMaterialsIcon} cardHeading='Inactive Games' description={statusCounts.lowStockgames || 0} />
                        </div>
                        <div className='flex gap-2 justify-end'>
                            <Link className='text-right bg-red px-8 py-2 rounded-md text-white block max-w-max mb-4'
                                href={route('games.create')}>Add Item</Link>
                            <Link className='text-right bg-transparent px-4 py-2 rounded-md text-red max-w-max mb-4 border border-red flex gap-2'
                                href={route('games.import')}>Upload File{uploadFileIcon}</Link>
                        </div>
                    </div>
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4 gap-2'>
                                <h2 className='font-bold text-2xl'>Games Inventory</h2>
                                <div className='flex items-center justify-end flex-1 gap-2'>
                                    <form className="flex items-center max-w-sm">
                                        <label for="simple-search" className="sr-only">Search by Name or Email</label>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                id="material-search"
                                                className="bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-10 p-2.5"
                                                placeholder="Search by Item Name/Code"
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
                                        </select></div>
                                </div>
                            </div>
                            <div className='table-container md:overflow-x-visible overflow-x-auto'>
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Game Name</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Game Category</th>
                                            {/* <th className="px-2 py-3 border-b text-red text-left text-sm">Override Chance</th> */}
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Game Type</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Spin Time</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Min Bet</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Max Bet</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {games.map(game => (
                                            <tr key={game.id} className="border-b">
                                                <td className="px-2 py-3 text-sm">{game.game_name}</td>
                                                <td className="px-2 py-3 text-sm">{game.game_category}</td>
                                                {/* <td className="px-2 py-3 text-sm">{game.override_chance}</td> */}
                                                <td className="px-2 py-3 text-sm">{game.game_type}</td>
                                                <td className="px-2 py-3 text-sm">{game.game_spin_time} sec</td>
                                                <td className="px-2 py-3 text-sm">{game.min_bet}</td>
                                                <td className="px-2 py-3 text-sm">{game.maximum_bet}</td>
                                                <td className="px-2 py-3 text-sm relative">
                                                    <button
                                                        type="button"
                                                        className="flex justify-center items-center size-9 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                                        onClick={() => toggleDropdown(game.id)}
                                                        aria-haspopup="menu"
                                                        aria-expanded={openDropdown === game.id ? "true" : "false"}
                                                        aria-label="Dropdown"
                                                    >
                                                        <FiMoreVertical className="size-4 text-gray-600" />
                                                    </button>

                                                    {openDropdown === game.id && (
                                                        <div
                                                            className="absolute right-0 mt-2 min-w-40 bg-slate-200 shadow-md rounded-lg transition-opacity duration-200 z-10"
                                                            role="menu"
                                                            aria-orientation="vertical"
                                                            onMouseLeave={closeDropdown}
                                                        >
                                                            <div className="space-y-0.5 flex flex-col p-2 gap-1">
                                                                <Link href={route('games.edit', game.id)} className="text-blue-500 hover:underline">
                                                                    Edit
                                                                </Link>
                                                                <Link href={route('games.view', game.id)} className="text-blue-500 hover:underline">
                                                                    View
                                                                </Link>
                                                                <Link href={route('games.delete', game.id)} className="text-blue-500 hover:underline">
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