import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import OptionsDropdown from '../../Components/styledComponents/optionsToggle';
import Pagination from '@/Components/Pagination';
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';
import { totalFGandRMInventoryIcon, lowStockRawMaterialsIcon } from './../../../utils/svgIconContent';
import ItemInfoSkyBlueCard from '@/Components/ItemInfoSkyBlueCard';
import ItemInfoGreeCard from '@/Components/ItemInfoGreeCard';
import ItemInfoRedCard from '@/Components/ItemInfoRedCard';

export default function View({ groupedFinishedGoods, rawMaterials, finishedGoods, rm_or_fg_count, unvalidated_fg_codes }) {
    const { flash = {} } = usePage().props;
    const showFlash = useAutoHideFlash(flash.success);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    // Convert groupedFinishedGoods object keys to an array
    // const groupedKeys = Object.keys(groupedFinishedGoods);
    // const totalGroups = groupedKeys.length;
    // const totalPages = Math.ceil(totalGroups / rowsPerPage);

    // // Slice keys for current page
    // const startIndex = (currentPage - 1) * rowsPerPage;
    // const currentKeys = groupedKeys.slice(startIndex, startIndex + rowsPerPage);


    // Get keys and total pages
    const groupedKeys = Object.keys(groupedFinishedGoods);

    // Filtered results based on search
    const filteredKeys = groupedKeys.filter(key => {
        const group = groupedFinishedGoods[key];
        const rawMaterialsStr = group.raw_materials.map((mat) => mat.raw_material_code).join(' + ').toLowerCase();
        return (
            key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rawMaterialsStr.includes(searchQuery.toLowerCase())
        );
    });

    // Pagination calculations
    const totalGroups = filteredKeys.length;
    const totalPages = Math.ceil(totalGroups / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentKeys = filteredKeys.slice(startIndex, startIndex + rowsPerPage);


    return (
        <AuthenticatedLayout
            header={<h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">Inventory</h3>}
        >
            <Head title="Inventory" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div className=''>
                        <p className='flex flex-wrap'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />  <Link href={route('raw-materials.index')}>Inventory Management</Link>   <FiChevronRight size={24} color="black" /> <span className='text-red'>Raw Materials for Finish Goods</span></p>
                        <div className="flex my-6 flex-col gap-6 md:flex-row">
                            <ItemInfoRedCard svgIcon={totalFGandRMInventoryIcon} cardHeading='Total Raw Materials' description={rawMaterials} />
                            <ItemInfoGreeCard svgIcon={totalFGandRMInventoryIcon} cardHeading='Total Finish Goods' description={finishedGoods} />

                            <div title={unvalidated_fg_codes.join('  - ')} className="bg-lightGreen text-red-800 p-4 rounded-lg shadow w-full text-center lg:max-w-[25%]">
                                <div className="svg-box bg-green w-12 h-12 flex justify-center items-center rounded-md ml-auto mr-auto mb-4">
                                    {totalFGandRMInventoryIcon}
                                </div>
                                <h3 className="text-md font-medium">Unvalidated RM For FG</h3>
                                <p className="text-2xl">
                                    {rm_or_fg_count}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-2 justify-end'>
                        <Link className='text-right bg-red px-8 py-2 rounded-md text-white block max-w-max mb-4'
                            href={route('inventory.create')}>Add New</Link>
                        <Link className='text-right bg-transparent px-4 py-2 rounded-md text-red max-w-max mb-4 border border-red flex gap-2'
                            href={route('inventory.import')}>Upload File<svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                                <path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M12.1099 20H8.10986C4.33886 20 2.45286 20 1.28186 18.828C0.110863 17.656 0.109863 15.771 0.109863 12V8C0.109863 4.229 0.109863 2.343 1.28186 1.172C2.45386 0.000999928 4.34886 0 8.13986 0C8.74586 0 9.23086 -4.09782e-08 9.63986 0.017C9.62653 0.097 9.61986 0.178333 9.61986 0.261L9.60986 3.095C9.60986 4.192 9.60986 5.162 9.71486 5.943C9.82886 6.79 10.0899 7.637 10.7819 8.329C11.4719 9.019 12.3199 9.281 13.1669 9.395C13.9479 9.5 14.9179 9.5 16.0149 9.5H20.0669C20.1099 10.034 20.1099 10.69 20.1099 11.563V12C20.1099 15.771 20.1099 17.657 18.9379 18.828C17.7659 19.999 15.8809 20 12.1099 20Z" fill="#A43434" />
                                <path d="M9.61986 0.259883L9.60986 3.09488C9.60986 4.19188 9.60986 5.16088 9.71486 5.94288C9.82886 6.78988 10.0899 7.63688 10.7819 8.32788C11.4719 9.01888 12.3199 9.28088 13.1669 9.39488C13.9479 9.49988 14.9179 9.49988 16.0149 9.49988H20.0669C20.0802 9.65455 20.0895 9.82122 20.0949 9.99988H20.1099C20.1099 9.73188 20.1099 9.59788 20.0999 9.43988C20.0239 8.4894 19.693 7.57701 19.1419 6.79888C19.0479 6.67088 18.9839 6.59488 18.8569 6.44188C18.0639 5.49388 17.0199 4.31188 16.1099 3.49988C15.2999 2.77588 14.1889 1.98488 13.2199 1.33888C12.3879 0.782883 11.9719 0.504883 11.4009 0.298883C11.2345 0.240137 11.0657 0.188753 10.8949 0.144883C10.5109 0.0498827 10.1369 0.0168828 9.60986 0.00488281L9.61986 0.259883Z" fill="#A43434" />
                            </svg></Link>

                    </div>
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg my-6">
                        <div className='p-6 text-gray-900'>
                            <div className='top-search-bar-box flex py-4 gap-2 '>
                                <h2 className='font-bold text-2xl'>Raw Materials For Finish Goods</h2>

                                <div className='flex items-center justify-end flex-1 gap-2'>
                                    {/* <input
                                    type="text"
                                    placeholder="Search Finished Goods or Raw Materials..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='border p-2 rounded-md w-80'
                                /> */}
                                </div>
                            </div>
                            <div className="table-container md:overflow-x-visible overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Finish Goods</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Raw Material</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">FG Gross Wt.</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">FG net Wt.</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Scrap net Wt.</th>
                                            <th className="px-2 py-3 border-b text-red text-left text-sm">Action</th>
                                        </tr >
                                    </thead >
                                    <tbody>
                                        {currentKeys.map((finishedGoodKey) => {
                                            const group = groupedFinishedGoods[finishedGoodKey];
                                            // Get the raw materials and quantities
                                            const rawMaterials = group.raw_materials;
                                            // Concatenate quantity details for each raw material
                                            const quantityRequiredPerMaterial = rawMaterials
                                                .map((material) => `${material.quantity_required}${material.unit}`)
                                                .join(' + ');
                                            // Show the total quantity using the unit from the first raw material (assuming same unit)
                                            const totalQuantityRequired = group.total_quantity_required
                                                ? `${group.total_quantity_required}${rawMaterials[0]?.unit || ''}`
                                                : '';

                                            return (
                                                <tr key={finishedGoodKey}>
                                                    {/* Finished Goods column */}
                                                    <td className="px-2 py-3 border-b text-sm font-semibold">
                                                        {finishedGoodKey}
                                                    </td>
                                                    {/* Raw Materials column */}
                                                    <td className="px-2 py-3 border-b text-sm">
                                                        {rawMaterials.map((material) => material.raw_material_code).join(' + ')}
                                                    </td>
                                                    <td className="px-2 py-3 border-b text-sm">
                                                        {group.fg_gross_wt.toFixed(2)}
                                                    </td>
                                                    <td className="px-2 py-3 border-b text-sm">
                                                        {group.fg_net_wt.toFixed(2)}
                                                    </td>
                                                    <td className="px-2 py-3 border-b text-sm">
                                                        {group.scrap_net_wt.toFixed(2)}
                                                    </td>
                                                    <td className="px-2 py-3 border-b text-sm">
                                                        <Link href={route('inventory.edit', group.id)} className="text-blue-500 hover:underline">
                                                            Edit
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                    </tbody>
                                </table >
                                {/* Pagination Controls */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    rowsPerPage={rowsPerPage}
                                    setCurrentPage={setCurrentPage}
                                    setRowsPerPage={setRowsPerPage}
                                />
                            </div >
                        </div >
                    </div >
                </div >
            </div >
        </AuthenticatedLayout >
    );
}

