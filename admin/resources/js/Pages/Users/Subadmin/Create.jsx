import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import { FiChevronRight } from 'react-icons/fi'

export default function Create({ message, roles, plants, subAdmins, stockitUsers }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        status: '',
        mobile_number: '',
        role: 'Super Admin',
        plant_id: '',
        pan_card: '',
        gstin_number: '',
        sub_admin_id: '',
        stockit_id: '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post(route('subadmin.store'))
    }

    const filteredRoles = roles.filter(
        (role) => !['Super Admin', 'Stockit', 'Retailer'].includes(role.name)
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create User
                </h2>
            }
        >
            <Head title="Create User" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className="flex">
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('subadmin.index')}>Users Management</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className="text-red">Create User</span>
                    </p>
                    <Link href={route('subadmin.index')} className="border border-red py-1 px-14 text-red rounded max-w-max">
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900  min-h-[80vh]">
                            <div className="top-search-bar-box flex py-4">
                                <h2 className="font-semibold text-3xl mb-6">Create New User</h2>
                            </div>
                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Full Name*</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Full Name"
                                        />
                                        {errors.name && <div className="text-errorRed text-sm">{errors.name}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Assign Role*</label>
                                        <select
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Role*</option>
                                            {filteredRoles.map((role) => (
                                                <option key={role.id} value={role.name}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.role && <div className="text-errorRed text-sm">{errors.role}</div>}
                                    </div>
                                    {data.role === 'Stockit' && (
                                        <div className="mb-4">
                                            <label className="block text-gray-700">Select Super Admin*</label>
                                            <select
                                                value={data.sub_admin_id}
                                                onChange={(e) => setData('sub_admin_id', e.target.value)}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            >
                                                <option value="">Select Super Admin</option>
                                                {subAdmins.map((user) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.sub_admin_id && <div className="text-errorRed text-sm">{errors.sub_admin_id}</div>}
                                        </div>
                                    )}
                                    {data.role === 'Retailer' && (
                                        <div className="mb-4">
                                            <label className="block text-gray-700">Select Stockit User*</label>
                                            <select
                                                value={data.stockit_id}
                                                onChange={(e) => setData('stockit_id', e.target.value)}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            >
                                                <option value="">Select Stockit User</option>
                                                {stockitsubadmin.map((user) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.stockit_id && <div className="text-errorRed text-sm">{errors.stockit_id}</div>}
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Status*</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Status</option>
                                            <option value="pending_approval">Pending</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        {errors.status && <div className="text-errorRed text-sm">{errors.status}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Email Address*</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Email Address"
                                        />
                                        {errors.email && <div className="text-errorRed text-sm">{errors.email}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Password*</label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Create Password"
                                        />
                                        {errors.password && <div className="text-errorRed text-sm">{errors.password}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Mobile Number*</label>
                                        <input
                                            type="text"
                                            value={data.mobile_number}
                                            onChange={(e) => setData('mobile_number', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Mobile Number"
                                        />
                                        {errors.mobile_number && <div className="text-errorRed text-sm">{errors.mobile_number}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Commission Percentage*</label>
                                        <input
                                            type="text"
                                            value={data.gstin_number}
                                            onChange={(e) => setData('gstin_number', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Commission Percentage"
                                        />
                                        {errors.gstin_number && <div className="text-errorRed text-sm">{errors.gstin_number}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Balance*</label>
                                        <input
                                            type="text"
                                            value={data.pan_card}
                                            onChange={(e) => setData('pan_card', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            placeholder="Enter Balance"
                                        />
                                        {errors.pan_card && <div className="text-errorRed text-sm">{errors.pan_card}</div>}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
