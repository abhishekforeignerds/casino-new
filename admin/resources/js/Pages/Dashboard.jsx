import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import DashboardStateGrid from '@/Components/DashboardStateGrid';
import DashboardInfoGrid from '@/Components/DashboardInfoGrid';
import ProductionOrderChart from '@/Components/ProductionOrderChart';
import ProcessEfficiencyChart from '@/Components/ProcessEfficiencyChart';
import MonthlyProductionSummary from '@/Components/MonthlyProductionSummary';
import RecentOrders from '@/Components/RecentOrders';
import RecentNotification from '@/Components/RecentNotification';
import ProductStatusOver from '@/Components/plantHeadComponents/ProductStatusOver';
import MaterialAllocationSummary from '@/Components/plantHeadComponents/MaterialAllocationSummary';
import RecentOrdersStatus from '@/Components/StoreManagerComponents/RecentOrdersStatus';
import LowStockAlerts from '@/Components/StoreManagerComponents/LowStockAlerts';
import RecentOrdersTable from '@/Components/managerImport/RecentOrdersTable';
import RecentProductionTable from '@/Components/productionManagerComponents/RecentProductionTable';
import WorkInProgressTable from '@/Components/productionManagerComponents/WorkInProgress';
import OutgoingPOTable from '@/Components/securityGuard/OutgoingPO';
import IncomingPOTable from '@/Components/securityGuard/IncomingPO';
import RecentVendororders from '@/Components/vendorComponent/RecentVendororders';
import RecentClientorders from '@/Components/clientComponenet/RecentClientorders';
import RecentVendorOrdersSummery from '@/Components/vendorComponent/RecentVendorOrdersSummery';
import PoUpdatesState from '@/Components/productionManagerComponents/PoUpdatesState';

export default function Dashboard({ gameResults, vendorpurchaseOrders, statusCounts, notifications, ongoingProds, lowStockRawMaterialstable, purchaseorderstable, lowStockFinishGoodtable, productionsOrders, allocatedRmtable, productionPos, invoicesvendors }) {
    const dashboardLinkRef = useRef(null);
    useEffect(() => {
        // Set up an interval to click the link every 10 seconds (10000 ms)
        const intervalId = setInterval(() => {
            // Check if the link ref exists and trigger a click
            if (dashboardLinkRef.current) {
                dashboardLinkRef.current.click();

            }
        }, 5000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);
    const { auth } = usePage().props;
    const user = usePage().props.auth.user;
    const userRoles = auth?.user?.roles || [];
    const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);
    return (
        <AuthenticatedLayout statusCounts={statusCounts}
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Dashboard
                </h3>

            }
        >
            <Head title="Dashboard" />

            <div className="main-content-container sm:ml-52">
                <Link hidden ref={dashboardLinkRef} href="/dashboard">
                    Refresh
                </Link>
                <div className="mx-auto py-6">
                    {userRoles[0] != 'Manager Imports' && (
                        <div className="overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="text-gray-900 flex flex-col gap-4">
                                {/* This is Dashboard */}


                                <DashboardStateGrid statusCounts={statusCounts} />





                                <div className='flex flex-col gap-4 md:flex-row md:flex-wrap lg:flex-nowrap'>

                                </div>

                                <div className='flex flex-col gap-4 md:flex-row md:flex-wrap lg:flex-nowrap'>


                                    {/* <PoUpdatesState /> */}
                                </div>
                                <RecentOrders gameResults={gameResults} />
                                <div className='flex flex-col gap-4 md:flex-row md:flex-wrap lg:flex-nowrap'>

                                    <div className='flex flex-col gap-4 md:flex-row md:flex-wrap lg:flex-nowrap'>
                                        <div className='flex flex-col gap-4 md:flex-row md:flex-wrap lg:flex-nowrap'>


                                        </div>

                                    </div>

                                    {/* <PoUpdatesState /> */}
                                </div>
                                <RecentNotification notifications={notifications} />
                            </div>
                            {/* <div><RecentVendorOrdersSummery orders={orders} /></div> */}

                        </div>
                    )}
                    {userRoles[0] == 'Manager Imports' && (
                        <div className="overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="text-gray-900 flex flex-col gap-4">
                                {/* This is Dashboard */}


                                <DashboardStateGrid statusCounts={statusCounts} />


                                <DashboardInfoGrid statusCounts={statusCounts} />


                                <div className='flex flex-col gap-4 md:flex-row md:flex-wrap lg:flex-nowrap'>





                                </div>

                                <div className='flex flex-col gap-4 md:flex-row md:flex-wrap lg:flex-nowrap'>

                                    <div className='flex flex-col gap-4 md:flex-row md:flex-wrap lg:flex-nowrap'>


                                    </div>
                                    {/* <PoUpdatesState /> */}
                                </div>
                            </div>
                            {/* <div><RecentVendorOrdersSummery orders={orders} /></div> */}

                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
