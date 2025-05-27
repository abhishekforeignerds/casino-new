import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import React, { useState } from 'react';
import { totalRawMaterialIcon, activeRawMaterialIcon, lowStockRawMaterialsIcon, uploadFileIcon, searchFormIcon } from './../../../utils/svgIconContent';
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import ItemInfoSkyBlueCard from '@/Components/ItemInfoSkyBlueCard';
import { getStatusText, getStatusClass } from './../../../utils/statusUtils';
import { filterOptions, filterByDate } from '@/Components/FilterUtils';
import Pagination from '@/Components/Pagination';

export default function View({ rawMaterials, statusCounts }) {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // default: All Time
  const [plantSort, setPlantSort] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { auth } = usePage().props;
  const user = auth.user;
  const userRoles = auth?.user?.roles || [];
  const userPlantId = user.plant_id;
  const currentPath = window.location.pathname;

  // Dropdown functions for actions
  const [openDropdown, setOpenDropdown] = useState(null);
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };
  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Toggle sort order for Plant Name column
  const togglePlantSort = () => {
    setPlantSort(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Filtering rawMaterials based on user role.
  // For non–Super Admin users: filter solely by plant_id.
  // For Super Admin users: apply search, date, and status filters.
  let filteredMaterials = [];
  if (userRoles[0] !== "Super Admin") {
    filteredMaterials = rawMaterials.filter((material) => {
      // Convert both to numbers before comparing.
      const plantMatch = Number(material.plant_id) === Number(userPlantId);
      // console.log(
      // `Checking material ${material.id} with plant_id ${material.plant_id} (type: ${typeof material.plant_id}) against userPlantId ${userPlantId} (type: ${typeof userPlantId}):`,
      //   plantMatch
      // );
      return plantMatch;
    });
    // console.log("Non–Super Admin filtered raw materials:", filteredMaterials);
  } else {
    filteredMaterials = rawMaterials.filter((material) => {
      const matchesSearch =
        material.item_description.toLowerCase().includes(search.toLowerCase()) ||
        material.item_code.toLowerCase().includes(search.toLowerCase());
      const matchesDate = filterByDate(material.created_at, selectedFilter);
      const includeMaterial = matchesSearch && matchesDate && material.status !== "deleted";
      // console.log(
      // `Super Admin - Checking material ${material.id}: search(${matchesSearch}), date(${matchesDate}), status(${material.status}) -> Include:`,
      //   includeMaterial
      //   );
      return includeMaterial;
    });
    // console.log("Super Admin filtered raw materials:", filteredMaterials);
  }

  // Calculate counts for the status cards.
  // For Super Admin, use the counts coming from the server.
  // For non–Super Admin users, count based on the filtered materials.
  let totalCount, availableCount, lowStockCount;
  if (userRoles[0] !== "Super Admin") {
    totalCount = filteredMaterials.length;
    availableCount = filteredMaterials.filter(material => material.status === 'available').length;
    lowStockCount = filteredMaterials.filter(material => material.status === 'low_stock').length;
  } else {
    totalCount = statusCounts.allRawMaterials;
    availableCount = statusCounts.activeRawMaterials;
    lowStockCount = statusCounts.lowStockRawMaterials;
  }

  // For Super Admin, sort materials by plant name based on the selected sort order.
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
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Raw Materials {userRoles[0] === "Super Admin" ? "List" : "Inventory"}
        </h2>
      }
    >
      <Head title={`Raw Materials ${userRoles[0] === "Super Admin" ? "List" : "Inventory"}`} />
      <div className="main-content-container sm:ml-52">
        <div className="mx-auto py-6">
          <div className=''>
            <p className='flex'>
              <Link href={route('dashboard')}>Dashboard</Link>
              <FiChevronRight size={24} color="black" />
              <Link href={route('plants.index')}>{userRoles[0] === "Super Admin" ? "Plant" : "Inventory"} Management</Link>
              <FiChevronRight size={24} color="black" />
              <span className='text-red'>
                Raw Materials {userRoles[0] === "Super Admin" ? "List" : "Inventory"}
              </span>
            </p>
            {/* Status Cards */}
            <div className="flex my-6 flex-col gap-6 md:flex-row">
              <ItemInfoRedCard svgIcon={totalRawMaterialIcon} cardHeading='Total Raw Materials' description={totalCount} />
              <ItemInfoGreeCard svgIcon={activeRawMaterialIcon} cardHeading='Active Raw Materials' description={availableCount} />
              <ItemInfoSkyBlueCard svgIcon={lowStockRawMaterialsIcon} cardHeading='Low Stock Raw Materials' description={lowStockCount} />
            </div>
            <div className='flex gap-2 justify-end'></div>
          </div>
          <div className='flex gap-2'>
            <Link
              className='text-right bg-red px-4 py-2 rounded-md text-white block max-w-max ml-auto mb-4'
              href={route('plants.createrm')}
            >
              Add Item
            </Link>
            <Link
              className='text-right bg-transparent px-4 py-2 rounded-md text-red max-w-max mb-4 border border-red flex gap-2'
              href={route('plants.importrm')}
            >
              Upload File{uploadFileIcon}
            </Link>
          </div>
          <div className="bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className='top-search-bar-box flex py-4 gap-2'>
                <h2 className='font-bold text-2xl'>
                  Raw Materials {userRoles[0] === "Super Admin" ? "List" : "Inventory"}
                </h2>
                <div className='flex items-center justify-end flex-1 gap-2'>
                  <form className="flex items-center max-w-sm">
                    <label htmlFor="material-search" className="sr-only">Search by Name or Email</label>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        {searchFormIcon}
                      </div>
                      <input
                        type="text"
                        id="material-search"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                        placeholder="Search by Code or Name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </form>
                  <div>
                    <select
                      className="border border-gray-300 rounded-md px-8 py-2.5 text-sm"
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                    >
                      {filterOptions.map((option) => (
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
                        Plant Name {plantSort === 'asc' ? (
                          <FiChevronRight className="transform -rotate-90 ml-1" />
                        ) : (
                          <FiChevronRight className="transform rotate-90 ml-1" />
                        )}
                      </th>
                      <th className="px-2 py-3 text-red text-left text-sm">Available</th>
                      <th className="px-2 py-3 text-red text-left text-sm">Status</th>
                      {userRoles[0] !== "Super Admin" && (
                        <th className="px-2 py-3 text-red text-left text-sm">Minimum Threshold</th>
                      )}
                      <th className="px-2 py-3 text-red text-left text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMaterials.map((material) => (
                      <tr key={material.id} className="border-b">
                        <td className="px-2 py-3 text-sm font-semibold">{material.item_code}</td>
                        <td className="px-2 py-3 text-sm">{material.item_description}</td>
                        <td className="px-2 py-3 text-sm">{material.plant.plant_name}</td>
                        <td className="px-2 py-3 text-sm">
                          {material.quantity}{material.unit}
                        </td>
                        <td className="px-2 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(material.status)}`}>
                            {getStatusText(material.status)}
                          </span>
                        </td>
                        {userRoles[0] !== "Super Admin" && (
                          <td className="px-2 py-3 text-sm">
                            {material.minimum_threshold} {material.unit}
                          </td>
                        )}
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
                                <Link href={route('plants.viewrm', material.id)} className="text-blue-500 hover:underline">
                                  View
                                </Link>
                                <Link href={route('plants.editRmList', material.id)} className="text-blue-500 hover:underline">
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
