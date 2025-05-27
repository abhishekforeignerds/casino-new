import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { useState, useEffect, useMemo } from 'react';
import OrderedItems from './Components/OrderedItems';
import MaterialRequirementsPlanning from './Components/MaterialRequirementsPlanning';
import StatusUpdateForm from './Components/StatusUpdateForm';
import { useAutoHideFlash } from './../../../utils/useAutoHideFlash';

import { getStatusText, getStatusClass } from './../../../utils/statusUtils';

// const getStatusClass = (status) => {
//     switch (status) {
//         case 'Available':
//             return 'bg-lightShadeGreen text-green-600 text-green';
//         case 'Unavailable':
//             return 'bg-lightYellow text-green-600 text-statusYellow';
//         default:
//             return 'bg-gray-100 text-gray-600';
//     }
// };

export default function View({ purchaseOrder, orderedItems, plantDetails, plantfgs, groupedFinishedGoods }) {


    const { data, setData, put, processing, errors } = useForm({
        order_status: purchaseOrder.order_status,
        status_reason: purchaseOrder.status_reason,
        materials: [],         // <-- Initialize materials here
        finished_goods: [],    // <-- Initialize finished_goods here
        item_ids: [],    // <-- Initialize finished_goods here
        rm_item_ids: [],    // <-- Initialize finished_goods here
        partial_finished_goods: [],
        partial_materials: [],
        rm_item_ids: [],
    });
    const { auth } = usePage().props;
    const user = usePage().props.auth.user;
    const currentPath = window.location.pathname;
    const userRoles = auth?.user?.roles || [];
    const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);

    const orderStatusOptions = ['pending_for_approval', 'completed', 'initiated', 'in_progress', 'cancelled', 'on_hold', 'rejected'];
    // Assume purchaseOrder.order_status is available

    const { flash = {} } = usePage().props;
    const showFlash = useAutoHideFlash(flash.success);
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('client-purchase-orders.update-status', purchaseOrder.id));
    };
    const handleProdSubmit = (e) => {
        e.preventDefault();
        put(route('client-purchase-orders.initiate-production', purchaseOrder.id));
    };
    const handleProdPartialSubmit = (e) => {
        e.preventDefault();
        put(route('client-purchase-orders.single-initiate-production', purchaseOrder.id));
    };

    const handleRequestPr = (e) => {
        e.preventDefault();
        put(route('vendor-purchase-orders.generate-pr'), data);

    };


    // Assuming errors and setData are defined in your component context
    const insufficientMaterials = errors.insufficient_materials ? JSON.parse(errors.insufficient_materials) : [];
    const partialinsufficientMaterials = errors.partialinsufficient_materials ? JSON.parse(errors.partialinsufficient_materials) : [];



    const totalUnavailableCount = useMemo(() => {
        // Filter out items that are in progress and check if all are available
        const unavailableCount = orderedItems
            .filter(item => item.status !== 'in_progress')
            .reduce((count, item) => {
                const plantfg = plantfgs.find(p => p.item_code === item.item_code);
                if (plantfg) {
                    const roundedOrderQty = Math.round(item.quantity);
                    const available = plantfg.quantity >= roundedOrderQty;

                    // // console.log(
                    //     `Item Code: ${item.item_code}, Order Quantity: ${roundedOrderQty} (Rounded from ${item.quantity}), Plant Quantity: ${plantfg.quantity}, Available: ${available}`
                    // );

                    return available ? count : count + 1;
                } else {
                    // // console.log(`Item Code: ${item.item_code} not found in plantfgs`);
                    return count + 1;
                }
            }, 0); // Initial count is 0

        // // console.log(`Total Unavailable Items: ${unavailableCount}`);
        return unavailableCount; // Return the number of unavailable items





        // Otherwise, compute total unavailable pieces per finished good.
        const totalOrderedPieces = {};
        const unavailableFinishedGoods = {};

        // 1. Sum the ordered pieces per finished good.
        orderedItems.forEach(item => {
            const fgCode = item.item_code;
            const group = groupedFinishedGoods[fgCode];
            if (group) {
                // Use the ordered quantity (assumed to be in pieces)
                const quantityInPieces = item.quantity;
                totalOrderedPieces[fgCode] = (totalOrderedPieces[fgCode] || 0) + quantityInPieces;
            }
        });

        // 2. Calculate shortfalls per finished good.
        Object.keys(totalOrderedPieces).forEach(fgCode => {
            const plantfg = plantfgs.find(p => p.item_code === fgCode);
            if (!plantfg) {
                // No plant entry available, so entire ordered quantity is unavailable.
                unavailableFinishedGoods[fgCode] = totalOrderedPieces[fgCode];
            } else {
                const plantAvailablePieces = plantfg.quantity;
                if (plantAvailablePieces < totalOrderedPieces[fgCode]) {
                    // Calculate the shortfall.
                    unavailableFinishedGoods[fgCode] = totalOrderedPieces[fgCode] - plantAvailablePieces;
                }
            }
        });

        // 3. Sum all the shortfalls to get the total unavailable count.
        return Object.values(unavailableFinishedGoods).reduce((sum, qty) => sum + qty, 0);
    }, [orderedItems, groupedFinishedGoods, plantfgs]);



    // ------------------------------------------------------------------
    // Update finished goods data with unavailable ones

    // 1. Compute raw material requirements for unavailable finished goods.
    useEffect(() => {
        const totalOrderedPieces = {};
        const unavailableFinishedGoods = {};

        orderedItems.forEach(item => {
            const fgCode = item.item_code;
            const group = groupedFinishedGoods[fgCode];
            if (group) {
                totalOrderedPieces[fgCode] = (totalOrderedPieces[fgCode] || 0) + item.quantity;
            }
        });

        Object.keys(totalOrderedPieces).forEach(fgCode => {
            const plantfg = plantfgs.find(p => p.item_code === fgCode);
            if (!plantfg || (plantfg && plantfg.quantity < totalOrderedPieces[fgCode])) {
                unavailableFinishedGoods[fgCode] = true;
            }
        });

        const totalRawMaterials = {};
        orderedItems.forEach(item => {
            const fgCode = item.item_code;
            if (unavailableFinishedGoods[fgCode]) {
                const group = groupedFinishedGoods[fgCode];
                if (group) {
                    const plantfg = plantfgs.find(p => p.item_code === fgCode);
                    const plantAvailableQuantity = plantfg ? plantfg.quantity : 0;
                    const remainingQuantity = Math.max(item.quantity - plantAvailableQuantity, 0);
                    group.raw_materials.forEach(rm => {
                        totalRawMaterials[rm.raw_material_code] =
                            (totalRawMaterials[rm.raw_material_code] || 0) +
                            (parseFloat(rm.quantity_required) * remainingQuantity);
                    });
                }
            }
        });

        const formattedMaterials = Object.entries(totalRawMaterials).map(([code, total]) => ({
            code,
            value: total.toFixed(2),
        }));

        if (JSON.stringify(data.materials) !== JSON.stringify(formattedMaterials)) {
            setData(prevData => ({
                ...prevData,
                materials: formattedMaterials,
            }));
        }
    }, [orderedItems, groupedFinishedGoods, plantfgs, data.materials, setData]);

    // 2. Compute and update finished goods shortfall.
    useEffect(() => {
        const totalOrderedPieces = {};
        orderedItems.forEach(item => {
            const fgCode = item.item_code;
            const group = groupedFinishedGoods[fgCode];
            if (group) {
                totalOrderedPieces[fgCode] = (totalOrderedPieces[fgCode] || 0) + item.quantity;
            }
        });

        const finishedGoodsTotals = {};
        Object.keys(totalOrderedPieces).forEach(fgCode => {
            const ordered = totalOrderedPieces[fgCode];
            const plantfg = plantfgs.find(p => p.item_code === fgCode);
            const plantAvailable = plantfg ? plantfg.quantity : 0;
            if (plantAvailable < ordered) {
                finishedGoodsTotals[fgCode] = ordered - plantAvailable;
            }
        });

        const newFinishedGoods = Object.entries(finishedGoodsTotals).map(([code, total]) => ({
            code,
            value: total.toFixed(2),
        }));

        if (JSON.stringify(data.finished_goods) !== JSON.stringify(newFinishedGoods)) {
            setData(prevData => ({
                ...prevData,
                finished_goods: newFinishedGoods,
            }));
        }
    }, [orderedItems, groupedFinishedGoods, plantfgs, data.finished_goods, setData]);

    // 3. Debug logging (without updating state)
    useEffect(() => {
        const totalOrderedPieces = {};
        const unavailableFinishedGoods = {};

        orderedItems.forEach(item => {
            const fgCode = item.item_code;
            const group = groupedFinishedGoods[fgCode];
            if (group) {
                totalOrderedPieces[fgCode] = (totalOrderedPieces[fgCode] || 0) + item.quantity;
            }
        });

        Object.keys(totalOrderedPieces).forEach(fgCode => {
            const plantfg = plantfgs.find(p => p.item_code === fgCode);
            if (!plantfg || (plantfg && plantfg.quantity < totalOrderedPieces[fgCode])) {
                unavailableFinishedGoods[fgCode] = true;
            }
        });

        const finishedGoodsTotals = {};
        orderedItems.forEach(item => {
            const fgCode = item.item_code;
            if (unavailableFinishedGoods[fgCode]) {
                const plantfg = plantfgs.find(p => p.item_code === fgCode);
                const plantAvailable = plantfg ? plantfg.quantity : 0;
                finishedGoodsTotals[fgCode] = (finishedGoodsTotals[fgCode] || 0) + Math.max(item.quantity - plantAvailable, 0);
            }
        });

        const totalUnavailable = Object.values(finishedGoodsTotals).reduce((sum, qty) => sum + qty, 0);

    }, [orderedItems, groupedFinishedGoods, plantfgs]);

    // -------------------------------
    // Item availability and insufficient items

    const isAvailable = (item) => {
        // Items that are "in_progress" are considered available.
        if (item.status === 'in_progress') {
            // console.log(`Item ${item.item_code} is in progress, considered available.`);
            return true;
        }
        // console.log(`Item ${item.item_code}`);
        // console.log(`groupedFinishedGoods ${groupedFinishedGoods} .`);

        const group = groupedFinishedGoods[item.item_code];
        // console.log(`Group ${group}. Assuming available.`);
        if (!group) {
            // console.log(`No conversion group found for item ${item.item_code}. Assuming available.`);
            return true;
        }

        const gramsPerPiece = group.total_quantity_required || 1;
        // console.log(`Item ${item.item_code}: gramsPerPiece = ${gramsPerPiece}`);

        // Convert the ordered quantity into pieces.
        const orderedQuantityInPieces = item.unit === 'Kgs'
            ? Math.ceil((parseFloat(item.quantity) * 1000) / gramsPerPiece)
            : Math.ceil(item.quantity);
        // console.log(`Item ${item.item_code}: Ordered Quantity = ${item.quantity} ${item.unit}, converted to ${orderedQuantityInPieces} pieces`);

        const plantfg = plantfgs.find(p => p.item_code === item.item_code);
        if (!plantfg) {
            // console.log(`No plant finished good found for item ${item.item_code}. Marking as unavailable.`);
            return false;
        }

        const plantAvailableQuantityInPieces = plantfg.unit === 'Kgs'
            ? Math.floor((parseFloat(plantfg.quantity) * 1000) / gramsPerPiece)
            : Math.floor(plantfg.quantity);
        // console.log(`Item ${item.item_code}: Plant Available Quantity = ${plantfg.quantity} ${plantfg.unit}, converted to ${plantAvailableQuantityInPieces} pieces`);

        const available = plantAvailableQuantityInPieces >= orderedQuantityInPieces;
        // console.log(`Item ${item.item_code}: Available? ${available} (${plantAvailableQuantityInPieces} >= ${orderedQuantityInPieces})`);

        return available;
    };



    const availableItems = orderedItems.filter(
        (item) => item.status === 'in_progress' || isAvailable(item)
    );
    const insufficientItems = orderedItems.filter(
        (item) => item.status !== 'in_progress' && !isAvailable(item)
    );

    const availabilityStatus = useMemo(() => {
        const total = orderedItems.length;
        if (total === 0) return 'none';

        const availableCount = orderedItems.filter(item => {
            const plantfg = plantfgs.find(p => p.item_code === item.item_code);
            return plantfg && plantfg.quantity >= Math.round(item.quantity);
        }).length;

        if (availableCount === total) return 'all_available';
        if (availableCount === 0) return 'all_unavailable';
        return 'partial';
    }, [orderedItems, plantfgs]); // Depend on plantfgs instead of availableItems


    // Update item_ids based on available items.
    useEffect(() => {
        const newItemIds = availableItems.map(item => item.id);
        if (JSON.stringify(data.item_ids) !== JSON.stringify(newItemIds)) {
            setData(prevData => ({
                ...prevData,
                item_ids: newItemIds,
            }));
        }
    }, [availableItems, data.item_ids, setData]);

    // Update rm_item_ids based on insufficient items.
    useEffect(() => {
        const newRmItemIds = insufficientItems.map(item => item.id);
        if (JSON.stringify(data.rm_item_ids) !== JSON.stringify(newRmItemIds)) {
            setData(prevData => ({
                ...prevData,
                rm_item_ids: newRmItemIds,
            }));
        }
    }, [insufficientItems, data.rm_item_ids, setData]);

    const handlepartialisuefgSubmit = (e) => {
        e.preventDefault();
        const formData = {
            ...data,
            item_ids: availableItems.map(item => item.id),
        };
        put(route('client-purchase-orders.issue-single-fg', purchaseOrder.id), { data: formData });
    };

    const handlePartialunavailable = (e) => {
        e.preventDefault();
        const formData = {
            ...data,
            rm_item_ids: insufficientItems.map(item => item.id),
        };
        put(route('client-purchase-orders.single-insufficient-fg', purchaseOrder.id), { data: formData });
    };

    // 4. Compute partial finished goods shortfall for insufficient items.
    useEffect(() => {
        const partialFinishedGoodsTotals = {};
        insufficientItems.forEach(item => {
            const fgCode = item.item_code;
            const group = groupedFinishedGoods[fgCode];
            if (group) {
                const gramsPerPiece = group.total_quantity_required || 1;
                let orderedQuantityInPieces = item.unit === 'Kgs'
                    ? Math.round((item.quantity * 1000) / gramsPerPiece)
                    : Math.round(item.quantity);
                const plantfg = plantfgs.find(p => p.item_code === fgCode);
                let plantAvailableQuantityInPieces = 0;
                if (plantfg) {
                    plantAvailableQuantityInPieces = plantfg.unit === 'Kgs'
                        ? Math.round((plantfg.quantity * 1000) / gramsPerPiece)
                        : Math.round(plantfg.quantity);
                }
                const shortfall = Math.max(orderedQuantityInPieces - plantAvailableQuantityInPieces, 0);
                if (shortfall > 0) {
                    partialFinishedGoodsTotals[fgCode] = (partialFinishedGoodsTotals[fgCode] || 0) + shortfall;
                }
            }
        });

        const formattedPartialFinishedGoods = Object.entries(partialFinishedGoodsTotals).map(
            ([code, total]) => ({
                code,
                value: total.toFixed(2),
            })
        );

        if (JSON.stringify(data.partial_finished_goods) !== JSON.stringify(formattedPartialFinishedGoods)) {
            setData(prevData => ({
                ...prevData,
                partial_finished_goods: formattedPartialFinishedGoods,
            }));
        }
    }, [insufficientItems, groupedFinishedGoods, plantfgs, data.partial_finished_goods, setData]);

    // 5. Compute partial raw material requirements for insufficient items.
    useEffect(() => {
        const partialRawMaterials = {};
        insufficientItems.forEach(item => {
            const fgCode = item.item_code;
            const group = groupedFinishedGoods[fgCode];
            if (group) {
                const gramsPerPiece = group.total_quantity_required || 1;
                let orderedQuantityInPieces = item.unit === 'Kgs'
                    ? Math.round((item.quantity * 1000) / gramsPerPiece)
                    : Math.round(item.quantity);
                const plantfg = plantfgs.find(p => p.item_code === fgCode);
                let plantAvailableQuantityInPieces = 0;
                if (plantfg) {
                    plantAvailableQuantityInPieces = plantfg.unit === 'Kgs'
                        ? Math.round((plantfg.quantity * 1000) / gramsPerPiece)
                        : Math.round(plantfg.quantity);
                }
                const remainingQuantity = Math.max(orderedQuantityInPieces - plantAvailableQuantityInPieces, 0);
                group.raw_materials.forEach(rm => {
                    const requirement = parseFloat(rm.quantity_required) * remainingQuantity;
                    partialRawMaterials[rm.raw_material_code] =
                        ((partialRawMaterials[rm.raw_material_code] || 0) + requirement);

                });
            }
        });

        const formattedPartialMaterials = Object.entries(partialRawMaterials).map(
            ([code, total]) => ({
                code,
                value: total.toFixed(2),
            })
        );

        if (JSON.stringify(data.partial_materials) !== JSON.stringify(formattedPartialMaterials)) {
            setData(prevData => ({
                ...prevData,
                partial_materials: formattedPartialMaterials,
            }));
        }
    }, [insufficientItems, groupedFinishedGoods, plantfgs, data.partial_materials, setData]);




    const currentStatus = purchaseOrder.order_status;

    // Build options based on the current status
    let statusOptions = [];

    if (currentStatus === 'pending_for_approval') {
        // When pending_for_approval, show all options

        if (userRoles[0] == 'Plant Head' && userPermissions.includes("release-init client-purchase-orders")) {
            statusOptions = [
                { value: '', label: 'Select Order Status' },
                { value: 'release_initiated', label: 'Initiate Release' },

            ];
        } else if (userRoles[0] == 'Store Manager') {
            statusOptions = [
                { value: '', label: 'Need Approval from Plant Head' },


            ];
        }

        else if (userRoles[0] == 'Super Admin') {
            statusOptions = [
                { value: '', label: 'Select Order Status' },
                { value: 'release_initiated', label: 'Initiate Release' },

            ];
        }
        else {
            statusOptions = [
                { value: null, label: "You don't have Permissions to Update Status" },

            ];
        }

    } else if (currentStatus === 'in_progress') {
        // When in progress, omit the pending_for_approval option
        if (userRoles[0] == 'Plant Head' || userRoles[0] == 'Super Admin') {
            statusOptions = [
                { value: '', label: 'Select Order Status' },
                { value: 'account_referred', label: 'Refer for Invoice' },

            ];

        } else {
            statusOptions = [
                { value: null, label: "You don't have Permissions to Update Status" },

            ];
        }

    }
    else if (currentStatus === 'completed') {
        // When completed, no change is allowed – only show completed
        statusOptions = [
            { value: 'completed', label: 'Completed' },
        ];
        if (userRoles[0] == 'Store Manager') {
            statusOptions = [
                { value: '', label: 'Select Order Status' },
                { value: 'insufficient_fg', label: 'Insufficient FG' },

                { value: 'in_progress', label: 'FG Issued' },

            ];
        } else {
            statusOptions = [
                { value: '', label: 'Select Order Status' },
                { value: 'insufficient_fg', label: 'Insufficient FG' },

                { value: 'in_progress', label: 'FG Issued' },
            ];
        }
    }
    else if (currentStatus === 'release_initiated' || currentStatus === 'added_fg') {
        // When completed, no change is allowed – only show completed
        if (userRoles[0] == 'Store Manager' || userRoles[0] == 'Super Admin') {
            if (totalUnavailableCount > 0) {
                statusOptions = [
                    { value: '', label: 'Select Order Status' },
                    { value: 'insufficient_fg', label: 'Insufficient FG' },
                ];
            }
            else {
                statusOptions = [
                    { value: '', label: 'Select Order Status' },
                    { value: 'in_progress', label: 'FG Issued' },

                ];
            }

        }
        else if (userRoles[0] == 'Manager Imports') {
            statusOptions = [
                { value: null, label: "You don't have Permissions to Update Status" },

            ];
        }

        else {
            statusOptions = [
                { value: null, label: "You don't have Permissions to Update Status" },

            ];
        }

    }

    else if (currentStatus === 'account_referred') {
        // When completed, no change is allowed – only show completed
        if (userRoles[0] == 'Plant Head' || userRoles[0] == 'Super Admin') {
            statusOptions = [
                { value: '', label: 'Select Order Status' },
                { value: 'ready_dispatched', label: 'Ready to Dispatched' },

            ];

        } else {
            statusOptions = [
                { value: null, label: "You don't have Permissions to Update Status" },

            ];
        }

    }
    else if (currentStatus === 'insufficient_fg') {
        // When completed, no change is allowed – only show completed

        if (userRoles[0] == 'Plant Head' || userRoles[0] == 'Super Admin') {

            statusOptions = [
                { value: '', label: 'Select Order Status' },
                { value: 'add_fg', label: 'Issue FG' },

            ];

        } else {
            statusOptions = [
                { value: null, label: "You don't have Permissions to Update Status" },

            ];
        }
    }
    else if (currentStatus === 'add_fg') {
        // When completed, no change is allowed – only show completed
        statusOptions = [
            { value: '', label: 'Select Order Status' },
            { value: 'add_rm', label: 'Issue RM' },

        ];
    }
    else if (currentStatus === 'completed') {
        // When completed, no change is allowed – only show completed
        statusOptions = [
            { value: '', label: 'Po Dispatched' },

        ];
    }
    else if (currentStatus === 'ready_dispatched') {
        // When completed, no change is allowed – only show completed
        if (userRoles[0] == 'Security Guard' || userRoles[0] == 'Super Admin') {

            statusOptions = [
                { value: '', label: 'Select Order Status' },
                { value: 'dispatched', label: 'Dispatched' },

            ];
        } else {
            statusOptions = [
                { value: null, label: "You don't have Permissions to Update Status" },

            ];
        }
    }
    else if (currentStatus === 'production_initiated') {
        // When completed, no change is allowed – only show completed


        statusOptions = [
            { value: null, label: "You don't have Permissions to Update Status" },

        ];

    }
    else {
        // Default: show all options (or adjust as needed for other statuses)
        statusOptions = [
            { value: '', label: 'Select Order Status' },
            { value: 'pending_for_approval', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'rejected', label: 'Rejected' },
        ];
    }

    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Approve Purchase Order
                </h2>
            }
        >
            <Head title="Approve Purchase Order" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'>
                        Dashboard  <FiChevronRight size={24} color="black" />
                        Purchase Orders  <FiChevronRight size={24} color="black" />
                        <span className='text-red'>Approve Purchase Order</span>
                    </p>

                    <Link
                        href={route('client-purchase-orders.index')}  // Adjust path as needed
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>

                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg min-h-[80vh]">
                        <div className="p-6 text-gray-900">
                            <div className='top-search-bar-box flex py-4'>
                                <h2 className='mb-2 text-2xl font-bold text-gray-800'>Purchase Order Details</h2>
                            </div>

                            {/* Purchase Order Details Section */}

                            <div className='grid grid-cols-2 bg-lightGrayTheme p-4'>
                                <div className=''>
                                    <h3 className="font-semibold text-lg mb-2 text-black">Purchase Order Information</h3>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="font-semibold text-gray-700">PO Number:</p>
                                        <p className="text-gray-600">{purchaseOrder.po_number || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="font-semibold text-gray-700">Client:</p>
                                        <p className="text-gray-600">{purchaseOrder.client.name || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="font-semibold text-gray-700">PO Date:</p>
                                        <p className="text-gray-600">
                                            {purchaseOrder.po_date
                                                ? new Date(purchaseOrder.po_date)
                                                    .toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "2-digit",
                                                    })
                                                    .replace(/\s/g, "-")
                                                : "N/A"}
                                        </p>

                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="font-semibold text-gray-700">Status:</p>
                                        <p className="text-gray-600">{purchaseOrder.order_status || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 text-black">Plant Details</h3>
                                    {/* <p className="text-lg font-semibold text-gray-700 mb-2">Address : {plantDetails?.city || 'N/A'} {plantDetails?.state || 'N/A'} {plantDetails?.address || 'N/A'} - {plantDetails?.zip || 'N/A'} {plantDetails?.country || 'N/A'} </p> */}
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="font-semibold text-gray-700">State:</p>
                                        <p className="text-gray-600">{plantDetails?.state || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="font-semibold text-gray-700">City:</p>
                                        <p className="text-gray-600">{plantDetails?.address || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="font-semibold text-gray-700">Zip:</p>
                                        <p className="text-gray-600">{plantDetails?.zip || 'N/A'}</p>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1">
                                        <p className="font-semibold text-gray-700">Country:</p>
                                        <p className="text-gray-600">{plantDetails?.country || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            {flash.success && (
                                <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                                    {flash.success}
                                </div>
                            )}
                            {/* Ordered Items Section */}
                            <OrderedItems
                                orderedItems={orderedItems}
                                groupedFinishedGoods={groupedFinishedGoods}
                            />


                            {/* Plant Details Section */}



                            <MaterialRequirementsPlanning
                                orderedItems={orderedItems}
                                purchaseOrder={purchaseOrder}
                                plantfgs={plantfgs}
                                groupedFinishedGoods={groupedFinishedGoods}
                                getStatusClass={getStatusClass}
                                getStatusText={getStatusText}
                                handleProdSubmit={handleProdSubmit}
                                handlepartialisuefgSubmit={handlepartialisuefgSubmit}
                                handlePartialunavailable={handlePartialunavailable}
                                data={data}
                                errors={errors}
                                insufficientMaterials={insufficientMaterials}
                                partialinsufficientMaterials={partialinsufficientMaterials}
                                processing={processing}
                                userRoles={userRoles}
                                handleSubmit={handleSubmit}
                                setData={setData}
                                statusOptions={statusOptions}
                                availabilityStatus={availabilityStatus}
                                availableItems={availableItems}
                                isAvailable={isAvailable}
                                insufficientItems={insufficientItems}
                                item_ids={data.item_ids}
                                handleProdPartialSubmit={handleProdPartialSubmit}
                                partial_finished_goods={data.partial_finished_goods}
                                partial_materials={data.partial_materials}
                                put={put}
                                handleRequestPr={handleRequestPr}

                            />



                            {(availabilityStatus == 'all_unavailable' || availabilityStatus == 'all_available') && (
                                <StatusUpdateForm
                                    userRoles={userRoles}
                                    purchaseOrder={purchaseOrder}
                                    insufficientMaterials={insufficientMaterials}
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    processing={processing}
                                    handleSubmit={handleSubmit}
                                    statusOptions={statusOptions}
                                    put={put}
                                    handleRequestPr={handleRequestPr}
                                />
                            )}
                            {(availabilityStatus == 'partial') && (
                                <StatusUpdateForm
                                    userRoles={userRoles}
                                    purchaseOrder={purchaseOrder}
                                    insufficientMaterials={insufficientMaterials}
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    processing={processing}
                                    handleSubmit={handleSubmit}
                                    statusOptions={statusOptions}
                                    handleRequestPr={handleRequestPr}
                                />
                            )}
                            <h3 className="font-semibold text-lg my-4 text-black">Current Status and Status Reason</h3>
                            <div className='grid grid-cols-2 gap-1'>
                                <div className="mb-1 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Current Status: </p>
                                    <p className={`bg-statusRed text-red-500 px-2 py-1 rounded-lg text-xs ${getStatusClass(data.order_status) || 'N/A'}`}>
                                        {getStatusText(data.order_status) || 'N/A'}</p>
                                </div>
                                <div className="mb-1 flex items-center gap-1">
                                    <p className="text-md font-semibold text-gray-700">Status Reason: </p>
                                    <p className="text-gray-600">{data.status_reason || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Back Button */}
                            <div className="mt-4">
                                <Link
                                    href={route('client-purchase-orders.index')} // Adjust path as needed
                                    className="block max-w-max px-4 py-2 font-normal uppercase text-sm text-white bg-red rounded hover:bg-red-800"
                                >
                                    Back to Purchase Orders
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}