import React from "react";
import { Link, usePage } from "@inertiajs/react";
import img5 from "../../assets/Customers.png";
import img6 from "../../assets/Total Finished Goods.png";
import img7 from "../../assets/FG in Stock.png";
import img8 from "../../assets/check-icon-png.png";
import img9 from "../../assets/watch.png";
import img10 from "../../assets/mat-card-subtitle → Customers (3).png";
import img11 from "../../assets/mat-card-subtitle → Customers (1).png";
import img12 from "../../assets/mat-card-subtitle → Customers (2).png";
import img13 from "../../assets/dilivery-car.png";
import img14 from "../../assets/pending-tab.png";
import img15 from "../../assets/reject-po.png";
import img16 from "../../assets/invoice-update.png";
import img17 from "../../assets/not-invoiced.png";
import img18 from "../../assets/canceled-po.png";
import '../../css/app.css';

const CardLayout = ({
  img,
  title,
  description,
  numberInfo,
  bgColor,
  statusInfo,
  link,
}) => (
  <Link href={link || route("dashboard")} className="h-full">
    <div className="bg-white shadow-lg rounded-lg p-4 flex items-start gap-4 hover:shadow-xl transition-all duration-200 h-full flex-1">
      {/* Color Box */}
      <div
        className="color-box w-16 rounded-lg flex items-center justify-center h-full"
        style={{ backgroundColor: bgColor }}
      >
        <img src={img} alt={title} className="max-h-8" />
      </div>
      {/* Card Content */}
      <div className="cardContent">
        <h3 className="text-base mb-2 font-normal">{title}</h3>
        <div className="numBox">
          <p className="text-4xl font-semibold inline-block">{numberInfo}</p>
          {statusInfo && (
            <p className="text-gray-500 text-xs inline-block ms-2">{statusInfo}</p>
          )}
        </div>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
    </div>
  </Link>
);

const DashboardInfoGrid = ({ statusCounts = {} }) => {
  const { auth } = usePage().props;
  const userRoles = auth?.user?.roles || [];

  // Define role-based dashboard cards
  const roleBasedCards = {
    "Super Admin": [
      {
        img: img5,
        title: "Dispatch",
        description: "",
        numberInfo: statusCounts.dispatchedpurchaseOrders || 0,
        bgColor: "#D2F2FF",
        statusInfo: "Dispatches Today",
        // link: route("/"),
      },
      {
        img: img6,
        title: "Total Finish Goods",
        description: "",
        numberInfo: statusCounts.allFinishedGoods || 0,
        bgColor: "#FCFFD2",
        statusInfo: " ",
        link: route("games.index"),
      },
      {
        img: img7,
        title: "Total Raw Material",
        description: "",
        numberInfo: statusCounts.availableRawMaterials || 0,
        bgColor: "#D2FFDC",
        statusInfo: "",
        link: route("raw-materials.index"),
      },
    ],
    "Store Manager": [
      {
        img: img7,
        title: "Total Raw Material Stock",
        description: "",
        numberInfo: statusCounts.availableRawMaterials || 0,
        bgColor: "#D2FFDC",
        statusInfo: "",
        link: route("plants.rawMaterialsList"),
      },
      {
        img: img6,
        title: "Total FG Stock",
        description: "",
        numberInfo: statusCounts.allFinishedGoods || 0,
        bgColor: "#D2E0FF",
        statusInfo: " ",
        link: route("plants.finishedGoodsList"),
      },
      {
        img: img10,
        title: "Low Stock Alerts",
        description: "",
        numberInfo: (statusCounts.lowStockRawMaterials + statusCounts.lowStockFinishedGoods) || 0,
        bgColor: "#D9D2FF",
        statusInfo: "Critical Items",
        // link: route("/"),
      },


    ],
    "Manager Imports": [
      {
        img: img8,
        title: "Completed Orders",
        description: "",
        numberInfo: statusCounts.completedpurchaseOrders || 0,
        bgColor: "#E4FFD2",
        statusInfo: "Pending",
        // link: route("games.index"),
      },
      {
        img: img9,
        title: "Scheduled Orders",
        description: "",
        numberInfo: statusCounts.schduledpurchaseOrders || 0,
        bgColor: "#D2E0FF",
        statusInfo: "Pending",
        // link: route("games.index"),
      },
      {
        img: img10,
        title: "Active Orders",
        description: "",
        numberInfo: statusCounts.activePurchaseOrders || 0,
        bgColor: "#D9D2FF",
        statusInfo: "Pending",
        // link: route("games.index"),
      },

    ],
    "Production Manager": [
      {
        img: img8,
        title: "Completed Orders",
        description: "",
        numberInfo: statusCounts.completedpurchaseOrders || 0,
        bgColor: "#E4FFD2",
        statusInfo: "Pending",
        // link: route("games.index"),
      },
      {
        img: img9,
        title: "Scheduled Orders",
        description: "",
        numberInfo: statusCounts.schduledpurchaseOrders || 0,
        bgColor: "#D2E0FF",
        statusInfo: "Pending",
        // link: route("games.index"),
      },
      {
        img: img10,
        title: "Active Orders",
        description: "",
        numberInfo: statusCounts.activePurchaseOrders || 0,
        bgColor: "#D9D2FF",
        statusInfo: "Pending",
        // link: route("games.index"),
      },

    ],
    "Plant Head": [
      {
        img: img11,
        title: "POs Pending Approval",
        description: "",
        numberInfo: statusCounts.pendingpurchaseOrders || 0,
        bgColor: "#E4FFD2",
        statusInfo: "Purchase Order",
        link: route("client-purchase-orders.index"),
      },
      {
        img: img12,
        title: "Available Raw Material",
        description: "",
        numberInfo: statusCounts.plantRawMaterialCount || 0,
        bgColor: "#D2E0FF",
        statusInfo: "",
        // link: route("games.index"),
      },
      {
        img: img10,
        title: "Materials Allocated",
        description: "",
        numberInfo: (statusCounts.allocatedRmTotal || 0) + ' Kgs',
        bgColor: "#D9D2FF",
        statusInfo: "to Production Floor",
        // link: route("games.index"),
      },
      {
        img: img5,
        title: "PO Dispatch",
        description: "",
        numberInfo: statusCounts.currentdispatchedOrders || 0,
        bgColor: "#D2F2FF",
        statusInfo: "Dispatches Today",
        // link: route("games.index"),
      },
      {
        img: img6,
        title: "Production Status",
        description: "",
        numberInfo: statusCounts.productionInProgress || 0,
        bgColor: "#FCFFD2",
        statusInfo: "Orders in Progress",
        // link: route("games.index"),
      },
      {
        img: img7,
        title: "Fg Stock",
        description: "",
        numberInfo: statusCounts.plantFinishGoodCount || 0,
        bgColor: "#D2FFDC",
        statusInfo: "",
        // link: route("games.index"),
      },

    ],
    "Client": [
      {
        img: img11,
        title: "Total Purchase Orders",
        description: "",
        numberInfo: statusCounts.currentallpurchaseOrders || 0,
        bgColor: "#E4FFD2",
        statusInfo: "Purchase Order",
        // link: route("games.index"),
      },
      {
        img: img8,
        title: "Fulfilled Orders",
        description: "",
        numberInfo: statusCounts.currentcompletedpurchaseOrders || 0,
        bgColor: "#D2E0FF",
        statusInfo: "",
        // link: route("games.index"),
      },
      {
        img: img14,
        title: "Pending POs",
        description: "",
        numberInfo: (statusCounts.currentpendingpurchaseOrders || 0),
        bgColor: "#D9D2FF",
        statusInfo: "to Production Floor",
        // link: route("games.index"),
      },
      {
        img: img10,
        title: "POs in Progress",
        description: "",
        numberInfo: statusCounts.currentInProgressOrders || 0,
        bgColor: "#D2FFDC",
        statusInfo: "Dispatches Today",
        // link: route("games.index"),
      },
      {
        img: img18,
        title: "Cancelled POs",
        description: "",
        numberInfo: statusCounts.currentcancelledOrders || 0,
        bgColor: "#D2F2FF",
        statusInfo: "Orders in Progress",
        // link: route("games.index"),
      },
      {
        img: img16,
        title: "Invoice Available",
        description: "",
        numberInfo: 0 || 0,
        bgColor: "#FCFFD2",
        statusInfo: "",
        // link: route("games.index"),
      },

    ],
    "Vendor": [
      {
        img: img11,
        title: "Total Purchase Orders",
        description: "",
        numberInfo: statusCounts.currentallVendorpurchaseOrders || 0,
        bgColor: "#E4FFD2",
        statusInfo: "Purchase Order",
        // link: route("games.index"),
      },
      {
        img: img13,
        title: "Delivered POs",
        description: "",
        numberInfo: statusCounts.currentcompletedpurchaseOrders || 0,
        bgColor: "#D2E0FF",
        statusInfo: "",
        // link: route("games.index"),
      },
      {
        img: img14,
        title: "Pending POs",
        description: "",
        numberInfo: (statusCounts.currentpendingVendorpurchaseOrders || 0),
        bgColor: "#D9D2FF",
        statusInfo: "to Production Floor",
        // link: route("games.index"),
      },
      {
        img: img15,
        title: "Rejected POs",
        description: "",
        numberInfo: statusCounts.currentcancelledVendorOrders || 0,
        bgColor: "#D2F2FF",
        statusInfo: "Dispatches Today",
        // link: route("games.index"),
      },
      {
        img: img16,
        title: "Invoice Uploaded",
        description: "",
        numberInfo: statusCounts.currentInvoiceVendorpurchaseOrderscount || 0,
        bgColor: "#FCFFD2",
        statusInfo: "Orders in Progress",
        // link: route("games.index"),
      },
      {
        img: img17,
        title: "Not Invoiced",
        description: "",
        numberInfo: statusCounts.currentallVendorpurchaseOrders - statusCounts.currentInvoiceVendorpurchaseOrderscount || 0,
        bgColor: "#D2FFDC",
        statusInfo: "",
        // link: route("games.index"),
      },

    ],

  };

  // Get cards for the first matching role
  const matchingRole = Object.keys(roleBasedCards).find((role) =>
    userRoles.includes(role)
  );
  const cardsToDisplay = roleBasedCards[matchingRole] || [];

  if (cardsToDisplay.length === 0) return null; // Hide the dashboard if no matching role

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cardsToDisplay.map((card, index) => (
        <CardLayout key={index} {...card} />
      ))}
    </div>
  );
};

export default DashboardInfoGrid;
