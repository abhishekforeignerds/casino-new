import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import RecentNotification from '@/Components/RecentNotification';
import NotificationTabs from '@/Components/NotificationTabs';

export default function Dashboard({ notifications, statusCounts }) {

    return (
        <AuthenticatedLayout statusCounts={statusCounts}

            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Notifications
                </h3>
            }
        >
            <Head title="Dashboard" />

            <div className="main-content-container sm:ml-52">
                {/* Render the notifications component and pass the notifications prop */}
                <div className='mx-auto py-6'>
                    <RecentNotification notifications={notifications} showViewAll={false} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
