import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from '@inertiajs/react';

export default function Edit({ user, roles, plants }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        status: user.status,
        mobile_number: user.mobile_number,
        gstin_number: user.gstin_number,
        password: '',
        role: user.roles && user.roles.length > 0 ? user.roles[0].name : '',
        plant_assigned: user.plant ? user.plant.id : '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit User
                </h2>
            }
        >
            <Head title="Edit User" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /><Link href={route('users.index')}> Users Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Edit User</span></p>
                    <Link
                        href={route('users.index')}  // Use the correct path to navigate to the users page
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg min-h-[80vh]">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='font-semibold text-3xl mb-6'>Edit User</h2>
                                <div className='flex items-center justify-end flex-1 gap-2'>


                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className='styled-form'>
                                <div className='theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    <div className="mb-4 ">
                                        <label className="block text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.name && <div className="text-errorRed text-sm">{errors.name}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Assign Role</label>
                                        <select
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.name}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.role && <div className="text-errorRed text-sm">{errors.role}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Assign Plant</label>
                                        <select
                                            value={data.plant_assigned}
                                            onChange={(e) => setData('plant_assigned', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select Plant</option>
                                            {plants.map((plant) => (
                                                <option key={plant.id} value={plant.id}>{plant.plant_name}</option>
                                            ))}
                                        </select>
                                        {errors.plant_assigned && <div className="text-errorRed text-sm">{errors.plant_assigned}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Status</label>
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
                                        <label className="block text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.email && <div className="text-errorRed text-sm">{errors.email}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.password && <div className="text-errorRed text-sm">{errors.password}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Mobile Number</label>
                                        <input
                                            type="text"
                                            value={data.mobile_number}
                                            onChange={(e) => setData('mobile_number', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            required />
                                        {errors.mobile_number && <div className="text-errorRed text-sm">{errors.mobile_number}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Commission Percentage</label>
                                        <input
                                            type="text"
                                            value={data.gstin_number}
                                            onChange={(e) => setData('gstin_number', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                            required />
                                        {errors.gstin_number && <div className="text-errorRed text-sm">{errors.gstin_number}</div>}
                                    </div>



                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-red rounded hover:bg-red/85"
                                    >
                                        Update User
                                    </button>
                                    {/* <button
                                        type="button"
                                        onClick={() => resetForm()} // Define the resetForm function to clear fields
                                        className="px-4 py-2 font-bold text-red border border-red rounded hover:bg-red/10"
                                    >
                                        Reset Form
                                    </button> */}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
