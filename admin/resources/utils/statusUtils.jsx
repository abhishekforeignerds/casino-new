// src/utils/statusUtils.js
export const getStatusText = (status) => {
    // client status
    if (status === 'active') return 'Active';
    if (status === 'pending_approval') return 'Pending';
    if (status === 'pending_for_approval') return 'Pending For Approval';
    if (status === 'inactive') return 'Inactive';
    if (status === 'deleted') return 'Deleted';
    // finish goods
    if (status === 'available') return 'Available';
    if (status === 'unavailable') return 'Unavailable';
    if (status === 'low_stock') return 'Low Stock';
    // Vendor PO
    if (status === 'pr_requsted') return 'PR Requested';
    if (status === 'plant_head_approved') return 'Plant Head Approved';
    if (status === 'accepted') return 'Accepted';
    if (status === 'fulfilled') return 'Fulfilled';
    if (status === 'dispatched') return 'Dispatched';
    if (status === 'received') return 'Received';
    if (status === 'pending') return 'Pending';
    if (status === 'rejected') return 'Rejected';
    if (status === 'on_hold') return 'On Hold';
    if (status === 'initiated') return 'Initiated';
    // PO status
    if (status === 'initiated') return 'Production Initiated';
    if (status === 'in_progress') return 'FG Issued';
    if (status === 'on_hold') return 'On Hold';
    if (status === 'completed') return 'Completed';
    if (status === 'pending') return 'Pending';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'ready_to_release') return 'Release Initiated';
    if (status === 'insufficient_fg') return 'Insufficient FG';
    if (status === 'add_fg') return 'Issue FG';
    if (status === 'add_rm') return 'Issue RM';
    if (status === 'added_fg') return 'FG Added';
    if (status === 'ready_dispatched') return 'Ready to Dispatch';
    if (status === 'dispatched') return 'Dispatched';
    if (status === 'account_referred') return 'Referred for Invoice';
    if (status === 'rejected') return 'Rejected';
    // notification
    if (status === "pending") return "PO Generated";
    if (status === "ready_to_release") return "Release Initiated";
    if (status === "fg_issued") return "FG Issued";
    if (status === "ready_dispatched") return "Ready to Dispatch";
    if (status === "dispatched") return "Dispatched";
    if (status === "add_fg") return "Low FG Stock";
    if (status === "add_rm") return "Low RM Stock";
    if (status === "added_fg") return "FG Added";
    if (status === "account_referred") return "Referred for Invoicing";
    if (status === "pr_requsted") return "PR Requsted";
    if (status === 'plant_head_approved') return 'Plant Head Approved';
    if (status === 'accepted') return 'PO Accepted';
    if (status === 'received') return 'PO Received';
    if (status === 'fulfill') return 'PO Fulfilled';
    if (status === "completed") return "Completed";
    if (status === "low_stock") return "Low Stock";
    if (status === "unavailable") return "Unavailable";
    if (status === "inactive") return "Inactive";
    if (status === "deleted") return "Deleted";
    if (status === "deleted") return "Deleted";
    if (status === "imported") return "Imported";
    if (status === "created") return "Added";
    if (status === "added") return "Added";
    if (status === "pr_requested") return "Purcahe Order Raises";
    if (status === "updated") return "Updated";
    if (status === "release_initiated") return "Release Initiated";
    if (status === "production_initiated") return "Production Initiated";
    if (status === "adminapproved") return "Admin Approved";
    if (status === "plant_head_approved") return "Plant Head Approved";

    if (status === "requested") return "Claim Requsted";
    if (status === "claim-accepted") return "Claim Accepted";
    if (status === "claimed") return "Claimed";
    return 'Unknown Status';
};

export const getStatusClass = (status) => {
    switch (status) {
        // client
        case 'active':
            return 'bg-green text-white text-green';
        case 'pending_approval':
            return 'bg-lightYellow text-green-600 text-statusYellow';
        case 'pending_for_approval':
            return 'bg-statusRed text-green-600 text-statusYellow';
        case 'inactive':
            return 'bg-red px-3 py-1 rounded-md text-white text-xs';
        // finish goods
        case 'available':
            return 'bg-lightShadeGreen text-green-600 text-green';
        case 'low_stock':
            return 'bg-lightYellow text-green-600 text-statusYellow';
        case 'unavailable':
            return 'bg-statusRed text-red-600 text-red';
        case 'in_progress':
            return 'bg-lightShadeGreen text-green-600';
        case 'deleted':
            return 'bg-statusRed text-red-600 text-red';
        // Vendor PO
        case 'accepted':
            return 'bg-lightShadeGreen text-green-600 text-green';
        case 'fulfilled':
            return 'bg-lightShadeGreen text-green-600 text-green';
        case 'dispatched':
            return 'bg-lightShadeGreen text-green-600 text-green';
        case 'received':
            return 'bg-lightShadeGreen text-green-600 text-green';
        case 'pending':
            return 'bg-lightYellow text-green-600 text-statusYellow';
        case 'rejected':
            return 'bg-statusRed text-red-600 text-red';
        // PO
        case 'initiated':
        case 'completed':
        case 'ready_to_release':
        case 'added_fg':
        case 'dispatched':
            return 'bg-lightShadeGreen text-green-600 text-green';
        case 'pending':
        case 'insufficient_fg':
        case 'add_fg':
            return 'bg-lightYellow text-green-600 text-statusYellow';
        case 'cancelled':
        case 'rejected':
            return 'bg-gray-200 text-red';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

// Utility function for invoice status class
export const getInvoiceClass = (status) => {
    switch (status) {
        case "Uploaded":
            return "bg-green-100 text-green-600";
        case "Not Uploaded":
            return "bg-blue-100 text-blue-600";
        case "Rejected":
            return "bg-red-100 text-red-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
};