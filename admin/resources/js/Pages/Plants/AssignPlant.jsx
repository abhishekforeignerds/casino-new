import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { FiMoreVertical } from "react-icons/fi";
import OptionsDropdown from '../../Components/styledComponents/optionsToggle';
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';


export default function AssignPlant({ users, plants }) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        plant_id: '',
        effective_date: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('plants.updateassignplant'));
    };
    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const { flash = {} } = usePage().props;
    const showFlash = useAutoHideFlash(flash.success);


    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
    };


    return (
        <AuthenticatedLayout


            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Users
                </h3>
            }
        >
            <Head title="Users" />
            <div className="main-content-container sm:ml-52">

                <div className="mx-auto py-6">
                    <div className=''>
                        <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /><Link href={route('plants.index')}>Plant Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Assign Plant Head</span></p>

                        {/* Status Cards */}
                        <div className='bg-white shadow-sm rounded-lg p-6 mt-4'>
                            <h2 className='font-semibold text-2xl mb-6'>Assign Manager</h2>

                            <form onSubmit={handleSubmit} className='styled-form'>
                                <div className='theme-style-form flex flex-col lg:flex-row gap-6 items-center'>

                                    <div className="mb-4 flex-1">
                                        <label className="block text-gray-700">Select Plant*</label>
                                        <select
                                            value={data.plant_id}
                                            onChange={(e) => setData('plant_id', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            required
                                        >
                                            <option value="">Select Plant</option>
                                            {plants.map((plant) => (
                                                <option key={plant.id} value={plant.id}>{plant.plant_name}</option>
                                            ))}
                                        </select>
                                        {errors.plant_name && <div className="text-errorRed text-sm">{errors.plant_name}</div>}
                                    </div>

                                    <div className="mb-4 flex-1">
                                        <label className="block text-gray-700">Select Head*</label>
                                        <select
                                            value={data.user_id}
                                            onChange={(e) => setData('user_id', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select User</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                        {errors.user_id && <div className="text-errorRed text-sm">{errors.user_id}</div>}
                                    </div>

                                    <div className="mb-4 flex-1">
                                        <label className="block text-gray-700">Effective Date* </label>
                                        <input
                                            type="date"
                                            value={data.effective_date}
                                            onChange={(e) => setData('effective_date', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.effective_date && <div className="text-errorRed text-sm">{errors.effective_date}</div>}
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800 capitalize"
                                        >
                                            Assign Head
                                        </button>
                                    </div>

                                </div>

                            </form>
                        </div>
                        {/* <Link className='text-right bg-red px-4 py-2 rounded-md text-white block max-w-max ml-auto mb-4'
                            href={route('users.create')}>Create Users</Link> */}

                    </div>

                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 mt-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}
                    <div className="bg-white shadow-sm sm:rounded-lg mt-6">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='font-bold text-2xl'>Manager Assignment Table</h2>
                                <div className='flex items-center justify-end flex-1 gap-2'>
                                    <div className="">
                                    </div>
                                    {/*  */}
                                </div>
                            </div>
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Current Head</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Plant Name</th>
                                        {/* <th className="px-2 py-3 border-b text-red text-left text-sm">Role</th> */}
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Status</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Effective Date</th>
                                        <th className="px-2 py-3 border-b text-red text-left text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-3 border-b text-sm">{user.name}</td>
                                            <td className="px-2 py-3 border-b text-sm">{user.plant && user.plant.plant_name ? user.plant.plant_name : '---'}
                                            </td>

                                            {/* <td className="px-4 py-3 border-b text-sm">
                                                {user.roles.map(role => role.name).join(', ')}
                                            </td> */}
                                            <td className="px-4 py-3 border-b text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${user.plant && user.plant.plant_name ? 'bg-lightShadeGreen text-green-600 text-green' : 'bg-statusRed text-red-600 text-red'}`}>
                                                    {user.plant && user.plant.plant_name ? 'Assigned' : 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b text-sm">
                                                {user.effective_date ? new Date(user.effective_date).toLocaleDateString('en-IN') : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 border-b text-sm">
                                                {/* Dropdown Trigger */}
                                                <button
                                                    type="button"
                                                    className="flex justify-center items-center size-9 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                                    onClick={() => toggleDropdown(user.id)} // Use user.id to ensure uniqueness
                                                    aria-haspopup="menu"
                                                    aria-expanded={openDropdown === user.id ? "true" : "false"}
                                                    aria-label="Dropdown"
                                                >
                                                    <FiMoreVertical className="size-4 text-gray-600" />
                                                </button>
                                                {openDropdown === user.id && (
                                                    <div

                                                        className="absolute right-4 mt-2 min-w-40 bg-slate-200 shadow-md rounded-lg transition-opacity duration-200 z-10"
                                                        role="menu"
                                                        aria-orientation="vertical"
                                                        onMouseLeave={closeDropdown}
                                                    >
                                                        <div className="space-y-0.5 flex flex-col p-2 gap-1">
                                                            <Link
                                                                href={route('plants.edit', user.plant_assigned)}
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                Edit plant
                                                            </Link>
                                                            <Link href={route('plants.view', user.plant_assigned)} className="text-blue-500 hover:underline">View plant</Link>


                                                        </div>
                                                    </div>
                                                )}

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}