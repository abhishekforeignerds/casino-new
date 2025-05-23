import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from '@inertiajs/react';

export default function Edit({ user, roles }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        status: user.status,
        mobile_number: user.mobile_number,
        company_name: user.company_name || '',
        gstin_number: user.gstin_number || '',
        pan_card: user.pan_card || '',
        state_code: user.state_code || '',
        company_address: user.company_address || '',
        password: '',
        role: user.roles && user.roles.length > 0 ? user.roles[0].name : '', // Safely access roles
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    View Vendor
                </h2>
            }
        >
            <Head title="View Vendor" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" /><Link href={route('vendors.index')}> Vendors Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>View Vendor</span></p>

                    <Link
                        href={route('vendors.index')}  // Use the correct path to navigate to the users page
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg min-h-[80vh]">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='mb-6 text-2xl font-bold text-gray-800'>View Vendor: <span className='font-normal'>{data.name || 'N/A'}</span></h2>

                            </div>
                            <div className='bg-lightGrayTheme p-4 grid grid-cols-2 gap-col-4'>
                                <div className="mb-2 flex items-center gap-1">

                                    <p className="text-md font-semibold text-gray-700">Name:</p>
                                    <p className="text-gray-600">{data.company_name || 'N/A'}</p>



                                </div>
                                <div className="mb-2 flex items-center gap-1">

                                    <p className="text-md font-semibold text-gray-700">Full Name:</p>
                                    <p className="text-gray-600">{data.name || 'N/A'}</p>

                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Email Address:</p>
                                    <p className="text-gray-600">{data.email || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Mobile Number:</p>
                                    <p className="text-gray-600">{data.mobile_number || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Status:</p>
                                    <p className="text-gray-600 capitalize">{data.status || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Role:</p>
                                    <p className="text-gray-600">{data.role || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">GSTIN Number:</p>
                                    <p className="text-gray-600">{data.gstin_number || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">State Code:</p>
                                    <p className="text-gray-600">{data.state_code || 'N/A'}</p>
                                </div>
                                <div className="mb-2 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Company Address:</p>
                                    <p className="text-gray-600">{data.company_address || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <Link
                                    href={route('vendors.index')}  // Use the correct path to navigate to the users page
                                    className=" block max-w-max mt-4 px-4 py-2 font-normal text-sm text-white bg-red rounded hover:bg-red-800"
                                >
                                    Back to Vendors
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
