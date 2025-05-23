import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function DailyMrp({ dailyTaskTime, fetchedData }) {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing } = useForm({
        daily_task_time: dailyTaskTime,
    });

    function updateTime(e) {
        e.preventDefault();
        post(route('daily-mrp.update'));
    }

    const { auth } = usePage().props;
    const user = usePage().props.auth.user;
    const userRoles = auth?.user?.roles || [];
    const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);

    // Define the function to return meaningful text for each status
    const getStatusText = (status) => {
        switch (status) {
            case 'pending_for_approval':
                return 'Pending for Approval';
            case 'completed':
                return 'Completed';
            case 'production_initiated':
                return 'Production Initiated';
            case 'cancelled':
                return 'Cancelled';
            case 'on_hold':
                return 'On Hold';
            case 'deleted':
                return 'Deleted';
            case 'in_progress':
                return 'In Progress';
            case 'release_initiated':
                return 'Release Initiated';
            case 'insufficient_fg':
                return 'Insufficient FG';
            case 'account_referred':
                return 'Account Referred';
            case 'ready_dispatched':
                return 'Ready Dispatched';
            case 'dispatched':
                return 'Dispatched';
            case 'add_fg':
                return 'Add FG';
            case 'add_rm':
                return 'Add RM';
            case 'added_fg':
                return 'Added FG';
            case 'added_rm':
                return 'Added RM';
            case 'rejected':
                return 'Rejected';
            case 'insufficient_rm':
                return 'Insufficient RM';
            case 'pr_requested':
                return 'PR Requested';
            case 'plant_head_approved':
                return 'Plant Head Approved';
            case 'pending':
                return 'Pending';
            case 'accepted':
                return 'Accepted';
            case 'rejected_vendor':
                return 'Rejected Vendor';
            case 'cancelled_vendor':
                return 'Cancelled Vendor';
            case 'dispatched_vendor':
                return 'Dispatched Vendor';
            case 'received_vendor':
                return 'Received Vendor';
            case 'fulfilled_vendor':
                return 'Fulfilled Vendor';
            default:
                return status.replace(/_/g, ' ');
        }
    };

    let fields = [];

    if (userRoles[0] === 'Super Admin') {
        fields = [
            'pending_for_approval',
            'completed',
            'production_initiated',
            'cancelled',
            'on_hold',
            'deleted',
            'in_progress',
            'release_initiated',
            'insufficient_fg',
            'account_referred',
            'ready_dispatched',
            'dispatched',
            'add_fg',
            'add_rm',
            'added_fg',
            'added_rm',
            'rejected',
            'insufficient_rm',
            'pr_requested',
            'plant_head_approved',
            'pending',
            'accepted',
            'rejected_vendor',
            'cancelled_vendor',
            'dispatched_vendor',
            'received_vendor',
            'fulfilled_vendor',
        ];
    } else if (userRoles[0] === 'Manager Import') {
        fields = [
            'pending_for_approval',
            'production_initiated',
            'cancelled',
            'on_hold',
            'release_initiated',
            'insufficient_fg',
            'account_referred',
            'ready_dispatched',
            'dispatched',
            'add_fg',
            'add_rm',
            'added_fg',
            'added_rm',
            'rejected',
            'insufficient_rm',
            'pr_requested',
            'plant_head_approved',
            'pending',
            'accepted',
            'rejected_vendor',
            'cancelled_vendor',
            'dispatched_vendor',
            'received_vendor',
            'fulfilled_vendor',
        ];
    } else if (userRoles[0] === 'Store Manager') {
        fields = [

            'production_initiated',
            'release_initiated',
            'insufficient_fg',
            'add_fg',
            'add_rm',
            'insufficient_rm',
            'pr_requested',
            'plant_head_approved',
            'pending',
            'accepted',
            'rejected_vendor',
            'cancelled_vendor',
            'dispatched_vendor',
            'received_vendor',
            'fulfilled_vendor',
        ];
    }




    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Daily MRP Settings
                </h3>
            }
        >
            <Head title="Daily MRP" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <div className="mb-4">
                        <p className="flex">
                            <a href={route('dashboard')}>Dashboard</a>
                            <FiChevronRight size={24} color="black" />
                            <span className="text-red">Daily MRP</span>
                        </p>
                    </div>

                    {flash.success && (
                        <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h2 className="font-bold text-2xl mb-4">Daily MRP Settings</h2>
                        <div className="mb-6">
                            <p className="mb-2">
                                <strong>Current Scheduled Time: </strong>
                                {dailyTaskTime}
                            </p>
                            <form onSubmit={updateTime} className="flex flex-col sm:flex-row items-center gap-4">
                                <label htmlFor="daily_task_time" className="w-full sm:w-auto">
                                    Update Time (HH:mm):
                                </label>
                                <input
                                    id="daily_task_time"
                                    type="time"
                                    value={data.daily_task_time}
                                    onChange={(e) => setData('daily_task_time', e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-red text-white px-6 py-2 rounded-md"
                                >
                                    Update
                                </button>
                            </form>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-bold text-xl mb-4">Today's purchase orders</h3>
                            <div className='flex items-start gap-4 flex-wrap'>
                                {fields.map((field) => (
                                    <div
                                        key={field}
                                        className='px-2 py-4 bg-slate-200 text-black border border-blue-200 rounded sm:w-[32%] w-full'>
                                        <strong>{getStatusText(field)}:</strong> {fetchedData[field]}
                                    </div>



                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
