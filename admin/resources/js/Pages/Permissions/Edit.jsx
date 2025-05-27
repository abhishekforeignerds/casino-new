import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function Edit({ permission }) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('permissions.update', permission.id));
    };

    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Permission
                </h2>
            }
        >
            <Head title="Edit Permission" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div>
                        <p className="flex">
                            <Link href={route('dashboard')}>Dashboard</Link>
                            <FiChevronRight size={24} color="black" />
                            <Link href={route('permissions.index')}>Permissions Management</Link>
                            <FiChevronRight size={24} color="black" />
                            <span className="text-blue-600">Edit Permission</span>
                        </p>
                        <Link
                            href={route('permissions.index')}
                            className="text-right bg-blue-600 px-8 py-2 rounded-md text-white block max-w-max ml-auto mb-4"
                        >
                            Back
                        </Link>
                    </div>
                    <div className="bg-white shadow-sm sm:rounded-lg p-6 text-gray-900">
                        <form onSubmit={handleSubmit} className="styled-form">
                            <div className="mb-4">
                                <label className="block text-gray-700">Permission Name*</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                    placeholder="Enter Permission Name"
                                />
                                {errors.name && (
                                    <div className="text-red-500 text-sm">{errors.name}</div>
                                )}
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                >
                                    Update Permission
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
