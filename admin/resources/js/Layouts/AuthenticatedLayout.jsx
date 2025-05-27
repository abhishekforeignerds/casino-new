import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Sidebar from '../Components/sidebar';
import { BsPersonGear } from "react-icons/bs";
import { bellNotificationIcon, reportMRPIcon } from "../../utils/svgIconContent";

import welcomeLogo from "../../assets/welcome-logo.png";
import {
    BuildingOfficeIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";
import { BsGrid } from "react-icons/bs";
import { BiCartAdd } from "react-icons/bi";


export default function AuthenticatedLayout({ header, children, statusCounts = {} }) {
    const { auth } = usePage().props;
    const user = usePage().props.auth.user;

    const currentPath = window.location.pathname;

    // Flatten all links from all sections into one array.

    const userRoles = auth?.user?.roles || [];
    const balance = auth?.user?.balance;
    const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);

    const quickLinkSections = (() => {
        if (
            (currentPath.startsWith('/dashboard') || currentPath.startsWith("/profile") || currentPath.startsWith("/notifications")) &&
            userRoles[0] === 'Super Admin'
        ) {
            return [
                {
                    // No title provided; the header won’t show.
                    links: [

                        { name: "Users List", icon: <UsersIcon className="w-6 h-6" />, link: "/users" },
                        { name: "Players List", icon: <UsersIcon className="w-6 h-6" />, link: "/players" },
                        { name: "Games List", icon: <BiCartAdd className="w-6 h-6" />, link: "/games/" },

                    ],
                },
            ];
        } else if (
            currentPath.startsWith('/dashboard') &&
            userRoles[0] === 'Retailer'
        ) {
            return [
                {
                    // No title provided; the header won’t show.
                    links: [

                        { name: "Turnover Report", icon: <UsersIcon className="w-6 h-6" />, link: "/turnover-history" },
                        { name: "Games Results", icon: <BiCartAdd className="w-6 h-6" />, link: "/player-game-results" },
                        { name: "Players List", icon: <UsersIcon className="w-6 h-6" />, link: "/players" },

                    ],
                },
            ];
        } else if (
            currentPath.startsWith('/players')
            || currentPath.startsWith('/player-game-results')
            || currentPath.startsWith('/turnover-history')
            || currentPath.startsWith('/player-history')
            || currentPath.startsWith('/transaction-history')
            || currentPath.startsWith('/results-history')
        ) {
            return [
                {
                    links: [
                        { name: "Players List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/players" },
                        { name: "Game Results", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/player-game-results" },
                        { name: "Turnover report", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/turnover-history" },
                        { name: "Player History", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/player-history" },
                        { name: "Transaction History", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/transaction-history" },
                        // { name: "Results History", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/results-history" },
                    ],
                },
            ];
        }
        else if (
            currentPath.startsWith('/dashboard') &&
            userRoles[0] === 'Manager Imports'
        ) {
            return [
                {
                    links: [
                        { name: "View Purchase Orders", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders/" },
                    ],
                },
            ];
        }
        else if (
            currentPath.startsWith('/dashboard') &&
            userRoles[0] === 'Vendor'
        ) {
            return [
                {
                    links: [
                        { name: "View All POs", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendor-purchase-orders/" },
                    ],
                },
            ];
        }
        else if (
            currentPath.startsWith('/dashboard') &&
            userRoles[0] === 'Client'
        ) {
            return [
                {
                    links: [
                        { name: "Send New PO", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendor-purchase-orders/" },
                        { name: "Check PO List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendor-purchase-orders/" },
                        { name: "View Invoices", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendor-purchase-orders/" },
                    ],
                },
            ];
        }
        else if (
            currentPath.startsWith('/dashboard') &&
            userRoles[0] === 'Security Guard'
        ) {
            return [
                {
                    links: [
                        { name: "Finish Good Dispatch", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders" },
                        { name: "Raw Material Arrival", icon: <ChartBarIcon className="w-6 h-6" />, link: "/vendor-purchase-orders" },

                    ],
                },
            ];
        }
        else if (
            currentPath.startsWith('/vendor-purchase-orders') &&
            userRoles[0] === 'Vendor'
        ) {
            return [
                {
                    title: "PURCHASE ORDER",
                    links: [
                        { name: "Purchase Order List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendor-purchase-orders/" },
                        { name: "PO History", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/reports/po" },

                    ],
                },
            ];
        }
        else if (
            currentPath.startsWith('/client-purchase-orders') &&
            userRoles[0] === 'Client'
        ) {
            return [
                {
                    title: "PURCHASE ORDER MANAGEMENT",
                    links: [
                        { name: "Purchase Order List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders/" },
                        { name: "PO History", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendor-purchase-orders/" },
                        { name: "View Invoices", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendor-purchase-orders/" },
                    ],
                },
            ];
        }
        else if (
            (currentPath.startsWith('/client-purchase-orders') || currentPath.startsWith('/vendor-purchase-orders')) &&
            userRoles[0] === 'Security Guard'
        ) {
            return [
                {
                    title: "Client PO ",
                    links: [
                        { name: "Finish Good Dispatch", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders" },
                    ],
                },
                {
                    title: "Vendor PO ",
                    links: [
                        { name: "Raw Material Arrival", icon: <ChartBarIcon className="w-6 h-6" />, link: "/vendor-purchase-orders" },
                    ],
                },
            ];
        }
        else if (
            currentPath.startsWith('/dashboard') &&
            userRoles[0] === 'Production Manager'
        ) {
            return [
                {
                    links: [
                        { name: "View Purchase Orders", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders/" },
                        { name: "View Inventory", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/games/" },
                    ],

                },
            ];
        }
        else if (
            currentPath.startsWith('/dashboard') &&
            userRoles[0] === 'Store Manager'
        ) {
            return [
                {
                    links: [

                        { name: "Manage Inventory", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "plants/games/" },
                    ],

                },
            ];
        }
        else if (
            currentPath.startsWith('/dashboard') &&
            userRoles[0] === 'Plant Head'
        ) {
            return [
                {
                    links: [
                        { name: "View Purchase Orders", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders/" },
                        { name: "Create Client PO", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders/create/" },
                        { name: "Create Vendor PO", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendor-purchase-orders/create/" },
                    ],

                },
            ];
        }
        // inside your menu–building function/component:
        const allUserLinks = [
            { name: "User List", icon: <UsersIcon className="w-6 h-6" />, link: "/users", permission: "view users" },
            { name: "Stockit List", icon: <UsersIcon className="w-6 h-6" />, link: "/stockit", permission: "view stockit" },
            { name: "Retailer List", icon: <UsersIcon className="w-6 h-6" />, link: "/retailer", permission: "view retailer" },
            // { name: "Add New Users", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/users/create", permission: "create users" },
            { name: "Roles List", icon: <UsersIcon className="w-6 h-6" />, link: "/roles", permission: "view users" },
            { name: "Permissions List", icon: <UsersIcon className="w-6 h-6" />, link: "/permissions", permission: "view users" },
        ];

        if (
            currentPath.startsWith("/users") ||
            currentPath.startsWith("/roles") ||
            currentPath.startsWith("/permissions") ||
            currentPath.startsWith("/stockit") ||
            currentPath.startsWith("/retailer") ||
            currentPath.startsWith("/subadmin")
        ) {
            return [
                {
                    title: "USER MANAGEMENT",
                    links: allUserLinks.filter(link =>
                        userPermissions.includes(link.permission)
                    )
                }
            ];
        }
        else if (
            currentPath.startsWith('/inventory') ||
            currentPath.startsWith('/games') ||
            currentPath.startsWith('/raw-materials')
        ) {
            return [
                {
                    title: "GAMES MANAGEMENT",
                    links: [
                        { name: "Games List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/games" },

                    ],
                },
            ];
        }
        else if (
            (currentPath.startsWith('/plants') ||
                currentPath.startsWith('/assign-plants')) &&
            userRoles[0] === 'Super Admin'
        ) {
            return [
                {
                    title: "PLANT MANAGEMENT",
                    links: [
                        { name: "Plants List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/plants" },
                        { name: "Add New Plant", icon: <ChartBarIcon className="w-6 h-6" />, link: "/plants/create" },
                        { name: "Assign Plant Head", icon: <BsPersonGear className="w-6 h-6" />, link: "/assign-plants" },
                        { name: "Finish Goods List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/plants/games" },
                        { name: "Raw Materials List", icon: <ChartBarIcon className="w-6 h-6" />, link: "/plants/raw-materials" },
                    ],
                },
            ];
        }
        else if (
            currentPath.startsWith('/plants') &&
            userRoles[0] === 'Store Manager'
        ) {
            return [
                {
                    title: "INVENTORY MANAGEMENT",
                    links: [

                        { name: "Finish Goods List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/plants/games" },
                        { name: "Raw Materials List", icon: <ChartBarIcon className="w-6 h-6" />, link: "/plants/raw-materials" },
                    ],
                },
            ];
        }
        else if (
            (currentPath.startsWith('/plants/games') || currentPath.startsWith('/plants/raw-materials')) &&
            userRoles[0] === 'Production Manager'
        ) {
            return [
                {
                    title: "INVENTORY MANAGEMENT",
                    links: [

                        { name: "Finish Goods List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/plants/games" },
                        { name: "Raw Materials List", icon: <ChartBarIcon className="w-6 h-6" />, link: "/plants/raw-materials" },
                    ],
                },
            ];
        }
        else if (
            (currentPath.startsWith('/reports') || currentPath.startsWith('/assign-plants'))
        ) {
            const menuItems = [];

            if (userPermissions.includes("inventory-index reports")) {
                menuItems.push({
                    name: "Inventory Report",
                    icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
                    link: "/reports/inventory"
                });
            }

            if (userPermissions.includes("production-index reports")) {
                menuItems.push({
                    name: "Production Report",
                    icon: <ChartBarIcon className="w-6 h-6" />,
                    link: "/reports/production"
                });
            }

            if (userPermissions.includes("po-index reports")) {
                menuItems.push({
                    name: "PO Report",
                    icon: <ChartBarIcon className="w-6 h-6" />,
                    link: "/reports/po"
                });
            }

            return menuItems.length > 0 ? [{ title: "REPORTS", links: menuItems }] : [];
        }

        else if (
            (currentPath.startsWith('/client-purchase-orders') ||
                currentPath.startsWith('/vendor-purchase-orders') ||
                currentPath.startsWith('/ongoing-production')) &&
            userRoles[0] === 'Super Admin' || userRoles[0] === 'Production Manager'
        ) {
            return [
                {
                    title: "Client PO List",
                    links: [
                        { name: "Client PO", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders" },
                    ],
                },
                {
                    title: "Vendor PO List",
                    links: [
                        { name: "Vendor PO", icon: <ChartBarIcon className="w-6 h-6" />, link: "/vendor-purchase-orders" },
                    ],
                },
                {
                    title: "Ongoing Production",
                    links: [
                        { name: "Ongoing Prod", icon: <ChartBarIcon className="w-6 h-6" />, link: "/ongoing-production" },
                    ],
                },
            ];
        } else if (
            (currentPath.startsWith('/client-purchase-orders') ||
                currentPath.startsWith('/vendor-purchase-orders') ||
                currentPath.startsWith('/ongoing-production')) &&
            (userRoles[0] === 'Manager Imports' || userRoles[0] === 'Plant Head' || userRoles[0] === 'Store Manager')
        ) {
            return [
                {
                    title: "Client PO List",
                    links: [
                        { name: "Client PO", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders" },
                    ],
                },
                {
                    title: "Vendor PO List",
                    links: [
                        { name: "Vendor PO", icon: <ChartBarIcon className="w-6 h-6" />, link: "/vendor-purchase-orders" },
                    ],
                },
            ];
        } else if (
            currentPath.startsWith('/client-purchase-orders') &&
            userRoles[0] === 'Client'
        ) {
            return [
                {
                    links: [
                        { name: "PO List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/client-purchase-orders" },
                        { name: "PO History", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/po-history" },
                        { name: "View Invoices", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/po-invoices" },
                    ],
                },
            ];
        } else if (
            (currentPath.startsWith('/players') || currentPath.startsWith('/vendors')) &&
            userRoles[0] === 'Super Admin'
        ) {
            return [
                {
                    title: "Player Management",
                    links: [
                        { name: "Players List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/players" },
                    ],
                },

            ];
        }
        const allReportsLinks = [
            // { name: "Admin Report", icon: <UsersIcon className="w-6 h-6" />, link: "/report/admin-report", permission: "admin report" },
            { name: "Retailer Report", icon: <UsersIcon className="w-6 h-6" />, link: "/report/retailer-report", permission: "retailer report" },
            { name: "Stockit Report", icon: <UsersIcon className="w-6 h-6" />, link: "/report/stockit-report", permission: "stockit report" },

        ];

        if (
            currentPath.startsWith("/report")
        ) {
            return [
                {
                    title: "USER MANAGEMENT",
                    links: allReportsLinks.filter(link =>
                        userPermissions.includes(link.permission)
                    )
                }
            ];
        }
        else if (
            (currentPath.startsWith('/players') || currentPath.startsWith('/vendors')) &&
            userRoles[0] === 'Plant Head'
        ) {
            return [
                {
                    title: "Client Management",
                    links: [
                        { name: "Client List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/players" },
                    ],
                },
                {
                    title: "Vendor Management",
                    links: [
                        { name: "Vendor List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendors" },
                    ],
                },
            ];
        }
        else if (
            (currentPath.startsWith('/vendors')) &&
            userRoles[0] === 'Store Manager'
        ) {
            return [

                {
                    title: "Vendor Management",
                    links: [
                        { name: "Vendor List", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, link: "/vendors" },
                    ],
                },
            ];
        }
        else {
            return [
                {
                    links: [
                        { name: "Default Link", icon: <BuildingOfficeIcon className="w-6 h-6" />, link: "#" },
                    ],
                },
            ];
        }
    })();

    const getTitle = () => {
        if (currentPath.startsWith('/dashboard')) {
            return "Quick Links";
        } else if (currentPath.startsWith('/users')) {
            return "USER MANAGEMENT";
        } else if (currentPath.startsWith('/plants')) {
            return "Plant Management";
        } else if (currentPath.startsWith('/players')) {
            return "Client Management";
        }
        else if (currentPath.startsWith('/games')) {
            return "INVENTORY MANAGEMENT";
        } else if (currentPath.startsWith('/raw-materials')) {
            return "INVENTORY MANAGEMENT";
        } else {
            return "Quick Links";
        }
    };
    const getHeader = () => {
        if (currentPath.startsWith('/dashboard' || currentPath.startsWith("/profile"))) {
            return "Dashboard";
        }
        else if (currentPath.startsWith('/profile')) {
            return "Profile";
        }
        else if (currentPath.startsWith('/roles')) {
            return "Roles";
        }
        else if (currentPath.startsWith('/permissions')) {
            return "Permissions";
        } else if (currentPath.startsWith('/raw-materials')) {
            return "";
        } else {
            return "";
        }
    };
    const allLinks = quickLinkSections.flatMap(section => section.links);

    // Find the link with the longest matching prefix.
    const bestMatch = allLinks.reduce((best, link) => {
        if (currentPath.startsWith(link.link) && link.link.length > (best?.link?.length || 0)) {
            return link;
        }
        return best;
    }, null);
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const notifications = usePage().props.notifications_unread.unread_count;

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />
            <div className="dashboard-content-container pl-16 max-md:pl-0">
                <header className='relative z-10'>
                    <nav className=" logo-topbar border-b border-gray-100 bg-gray-300" style={{ backgroundColor: ' rgb(214 214 214);' }}>
                        <div className="mr-8 ml-12 max-w-7xl px-4 sm:px-6 lg:px-6 lg:mx-0">
                            <div className="flex h-16 justify-between">
                                <div className="flex">
                                    <div className="flex shrink-0 items-center">
                                        <Link href="/">
                                            {/* menu icon for toggle sidebar in mobile view */}
                                            <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                        </Link>
                                    </div>

                                    <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                        <NavLink className='text-gray-900 focus:border-red-700 uppercase font-semibold'
                                            href={route('dashboard')}
                                            active={route().current('dashboard')}
                                        >
                                            <img src={welcomeLogo} className='mr-2 font-medium' />Welcome {userRoles}
                                        </NavLink>
                                    </div>
                                </div>

                                <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                    <div className='font-bold'>  Balance : {balance || 0}</div>
                                    <div className='sm:ms-6 sm:flex sm:items-center gap-10'>
                                        <Link
                                            href={route('notifications')}   // Use the correct path to navigate to the users page
                                            className=" text-red rounded max-w-max flex gap-0"
                                        >
                                            {bellNotificationIcon}

                                            {notifications && (
                                                <span className='bg-red px-[4px] text-white w-full rounded-xl min-w-[15px] h-5 text-center text-sm -mt-3 -ml-2'>

                                                    {notifications}
                                                </span>
                                            )}

                                        </Link>

                                    </div>
                                    <div className="relative ms-3">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                                    >
                                                        {user.name}

                                                        <svg
                                                            className="-me-0.5 ms-2 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content>
                                                <Dropdown.Link
                                                    href={route('profile.edit')}
                                                >
                                                    Profile
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                >
                                                    Log Out
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                </div>

                                <div className="-me-2 flex items-center sm:hidden">
                                    <button
                                        onClick={() =>
                                            setShowingNavigationDropdown(
                                                (previousState) => !previousState,
                                            )
                                        }
                                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                className={
                                                    !showingNavigationDropdown
                                                        ? 'inline-flex'
                                                        : 'hidden'
                                                }
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                            <path
                                                className={
                                                    showingNavigationDropdown
                                                        ? 'inline-flex'
                                                        : 'hidden'
                                                }
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            className={
                                (showingNavigationDropdown ? 'block' : 'hidden') +
                                ' sm:hidden'
                            }
                        >
                            <div className="space-y-1 pb-3 pt-2">
                                <ResponsiveNavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </ResponsiveNavLink>
                            </div>

                            <div className="border-t border-gray-200 pb-1 pt-4">
                                <div className="px-4">
                                    <div className="text-base font-medium text-gray-800">
                                        {user.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500">
                                        {user.email}
                                    </div>
                                </div>

                                <div className="mt-3 space-y-1">
                                    <ResponsiveNavLink href={route('profile.edit')}>
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        method="post"
                                        href={route('logout')}
                                        as="button"
                                    >
                                        Log Out
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        </div>
                    </nav>
                </header>
                {header && (
                    <div className="bg-white shadow">

                        <div className=" hidden inner-nav mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-4 fixed bg-white h-screen mt-16 min-w-52 sm:block">
                            {/* {header} */}
                            {(getHeader() === 'Dashboard' || getHeader() === 'Profile' || getHeader() === 'Notifications' || getHeader() === 'Roles' || getHeader() === 'Permissions') && (<>
                                <h5 className='text-sm tracking-widest uppercase mb-4'>Dashboards</h5>

                                <div className="flex gap-2 bg-red text-white mx-auto max-w-7xl px-4 py-3 sm:px-6 rounded-md mb-4 shadow-lg shadow-indigo-500/30">
                                    <BsGrid size="22px" color="white" />  {getHeader()}
                                </div>
                                <p className='text-sm tracking-widest uppercase'>Quick Links</p>
                            </>
                            )}

                            <div className="mt-3">
                                {quickLinkSections.map((section, sectionIndex) => (
                                    <div key={sectionIndex}>
                                        {/* Render the title only if it exists */}
                                        {section.title && (
                                            <h5 className="text-sm tracking-wide uppercase my-3">{section.title}</h5>
                                        )}
                                        <div className="flex flex-col gap-2">
                                            {section.links.map((link, linkIndex) => {
                                                // Mark as active only if this link is the best match.
                                                const isActive = bestMatch && bestMatch.link === link.link;
                                                return (
                                                    <Link
                                                        key={linkIndex}
                                                        href={link.link}
                                                        className={`gap-4 justify-center transition-all p-2 rounded-lg 
                    ${isActive ? 'bg-red text-white' : 'bg-white text-black'} 
                    hover:bg-red hover:text-white`}
                                                        title={link.name}
                                                    >
                                                        <p className="text-sm w-full flex items-center">
                                                            <span className="text-sm mr-2">{link.icon}</span>
                                                            {link.name}
                                                        </p>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>

                    </div>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
