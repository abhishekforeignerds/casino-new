import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function Create(retailerUsers, retailer) {
    // console.log('retailer', retailer)
    const { auth } = usePage().props; // Get user data from Inertia
    const userRoles = auth?.user?.roles || [];
    const [activeTab, setActiveTab] = useState("All");
    const userPermissions =
        auth?.user?.rolespermissions?.flatMap((role) => role.permissions) || [];
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        country: '',
        phone: '',
        email: '',
        username: '',
        password: '',
        points: '',
        retailer_id: userRoles[0] === 'Retailer' ? auth.user.id : '',
        winning_percentage: 70,
        override_chance: 0.3,
    });
    const isRetailer = userRoles.includes('Retailer');


    // Find the stockitUsers record for the logged‑in user
    const currentStockit = isRetailer
        ? retailerUsers.retailerUsers.find(u => u.id === auth.user.id)
        : null;
    const balance = currentStockit ? currentStockit.pan_card : '';
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('players.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Add Player
                </h2>
            }
        >
            <Head title="Add Player" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className="flex flex-wrap">
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('players.index')}> Clients Management</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className="text-red">Add Player</span>
                    </p>
                    <Link
                        href={route('players.index')}
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>

                <div className="mx-auto py-6">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 min-h-[80vh]">

                            <div className="top-search-bar-box flex py-4">
                                <h2 className="font-semibold text-3xl mb-6">Add Player</h2>
                            </div>
                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* First Name */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">First Name*</label>
                                        <input
                                            type="text"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter First Name"
                                        />
                                        {errors.first_name && <div className="text-red-600">{errors.first_name}</div>}
                                    </div>
                                    {/* Last Name */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Last Name*</label>
                                        <input
                                            type="text"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Last Name"
                                        />
                                        {errors.last_name && <div className="text-red-600">{errors.last_name}</div>}
                                    </div>
                                    {
                                        userRoles[0] != 'Retailer' && (

                                            <div className="mb-4">
                                                <label className="block text-gray-700">Select Retailer *</label>
                                                <select
                                                    value={data.retailer_id}
                                                    onChange={(e) => setData('retailer_id', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                >
                                                    <option value="">Select Retailer User</option>
                                                    {retailerUsers.retailerUsers.map((user) => (
                                                        <option key={user.id} value={user.id}>
                                                            {user.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.retailer_id && <div className="text-errorRed text-sm">{errors.retailer_id}</div>}
                                            </div>

                                        )
                                    }
                                    {/* Country */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Country*</label>
                                        <input
                                            type="text"
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Country"
                                        />
                                        {errors.country && <div className="text-red-600">{errors.country}</div>}
                                    </div>
                                    {/* Phone */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Phone*</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Phone Number"
                                        />
                                        {errors.phone && <div className="text-red-600">{errors.phone}</div>}
                                    </div>
                                    {/* Email Address */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Email Address*</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Email Address"
                                        />
                                        {errors.email && <div className="text-red-600">{errors.email}</div>}
                                    </div>
                                    {/* Username */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Username*</label>
                                        <input
                                            type="text"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Username"
                                        />
                                        {errors.username && <div className="text-red-600">{errors.username}</div>}
                                    </div>
                                    {/* Password */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Password*</label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Password"
                                        />
                                        {errors.password && <div className="text-red-600">{errors.password}</div>}
                                    </div>
                                    {/* Points */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Points*</label>
                                        <input
                                            type="number"
                                            max={balance}
                                            value={data.points}
                                            onChange={(e) => setData('points', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Points"
                                        />
                                        {errors.points && <div className="text-red-600">{errors.points}</div>}
                                    </div>
                                    {/* Winning Percentage */}
                                    {userPermissions.includes("winningpercentage players") && (
                                        <div className="mb-4">
                                            {/* <label className="block text-gray-700">Winning Percentage*</label> */}
                                            <input hidden
                                                type="number"
                                                step="0.01"
                                                value={data.winning_percentage}
                                                onChange={(e) => setData('winning_percentage', e.target.value)}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                placeholder="Enter Winning Percentage"
                                            />
                                            {errors.winning_percentage && <div className="text-red-600">{errors.winning_percentage}</div>}
                                        </div>
                                    )}
                                    {/* Override Chance */}
                                    {userPermissions.includes("overidechance players") && (
                                        <div className="mb-4">
                                            {/* <label className="block text-gray-700">Override Chance*</label> */}
                                            <input hidden
                                                type="number"
                                                step="0.01"
                                                value={data.override_chance}
                                                onChange={(e) => setData('override_chance', e.target.value)}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                placeholder="Enter Override Chance"
                                            />
                                            {errors.override_chance && <div className="text-red-600">{errors.override_chance}</div>}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Add Player
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
