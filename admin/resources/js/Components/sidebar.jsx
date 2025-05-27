import "../../css/app.css";
import React, { useState } from "react";
import { LiaUsersCogSolid } from "react-icons/lia";
import { RiDashboardFill } from "react-icons/ri";
import { GrHostMaintenance } from "react-icons/gr";
import { BsShop, BsCartPlus } from "react-icons/bs";
import { AiOutlineFileDone } from "react-icons/ai";
import { MdInventory } from "react-icons/md";
import { MdOutlineMapsHomeWork } from "react-icons/md";
import { HiMenuAlt3 } from "react-icons/hi";
import { Link } from "@inertiajs/react";
import { MdMenu, MdClose } from 'react-icons/md';
import { usePage } from '@inertiajs/react';
import { GiShop } from "react-icons/gi";
import { MdStore } from "react-icons/md";

const Sidebar = () => {
  const currentRoute = route()?.current() || "";
  // Default to an empty string

  const { auth } = usePage().props; // Get user data from Inertia
  const userRoles = auth?.user?.roles || []; // Get roles or default to an empty array
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userPermissions = auth.user.rolespermissions.flatMap(role => role.permissions);
  const hasInventoryPermission = userPermissions.includes("inventory-report reports");
  const hasPOPermission = userPermissions.includes("po-report reports") && userRoles[0] !== 'Super Admin';
  const getSidebarLinkClass = (isActive) => {
    return `flex items-center gap-4 p-1 w-10 h-10 rounded-md justify-center transition-all ${isActive
      ? "bg-primary text-white shadow-md" // Active styles
      : "bg-white color-secondary hover:bg-primary hover:text-white"
      }`;
  };
  const isSuperAdmin = userRoles[0] == 'Super Admin' ? true : false;

  // …
  return (
    <>
      {/* Mobile Toggle Button - Visible only on small screens */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-red text-white p-2 rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      <div
        className={`
      main-sidebar bg-light text-white fixed top-0 transform transition-transform 
      w-16 min-h-screen flex flex-col z-40 
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    `}
      >
        <nav className="flex flex-col mt-4 items-center gap-4">
          {/* Dashboard Link */}
          <div className="relative group">
            <Link href="/dashboard">
              <a className={getSidebarLinkClass(window.location.pathname === '/dashboard')}>
                <RiDashboardFill className="text-xl" />
              </a>
            </Link>
            <span className="tooltip">Dashboard</span>
          </div>

          {/* Conditionally Render for "Super Admin" Role */}
          {userPermissions.includes("view plants") && (
            <div className="relative group">
              <Link href={route("plants.index")}>
                <a className={getSidebarLinkClass(currentRoute.startsWith("plants"))}>
                  <GrHostMaintenance className="text-xl" />
                </a>
              </Link>
              <span className="tooltip">Plants Management</span>
            </div>
          )}

          {/* Finished Goods / Raw Materials Link */}
          {userPermissions.includes("view players") && (
            <div className="relative group">
              <Link href={route("players.index")}>
                <a
                  className={getSidebarLinkClass(
                    (currentRoute.startsWith("players") || currentRoute.startsWith("vendors"))
                  )}
                >
                  <BsShop className="text-xl" />
                </a>
              </Link>
              <span className="tooltip">Players List</span>
            </div>
          )}

          {/* Store Manager Specific Link */}
          {userPermissions.includes("view vendors") && userRoles[0] == 'Store Manager' && (
            <div className="relative group">
              <Link href={route("vendors.index")}>
                <a className={getSidebarLinkClass(currentRoute === "vendors.index")}>
                  <BsShop className="text-xl" />
                </a>
              </Link>
              <span className="tooltip">Vendors</span>
            </div>
          )}
          {userPermissions.includes("view vendor-purchase-orders") && userRoles[0] == 'Vendor' && (
            <div className="relative group">
              <Link href={route("vendor-purchase-orders.index")}>
                <a className={getSidebarLinkClass(currentRoute === "vendor-purchase-orders.index")}>
                  <BsCartPlus className="text-xl" />
                </a>
              </Link>
              <span className="tooltip">Purchase Orders</span>
            </div>
          )}

          {/* Users Link */}
          {userPermissions.includes("view users") && (
            <div className="relative group">
              <Link href="/users">
                <a
                  className={getSidebarLinkClass(
                    currentRoute && (currentRoute.startsWith("users") || currentRoute.startsWith("roles") || currentRoute.startsWith("permissions"))
                  )}
                >
                  <LiaUsersCogSolid className="text-xl" />
                </a>
              </Link>
              <span className="tooltip">User Management</span>
            </div>
          )}



          {!isSuperAdmin && userPermissions.includes('view retailer') && (
            <div className="relative group">
              <Link
                href="/retailer"
                className={getSidebarLinkClass(
                  currentRoute?.startsWith("retailer")
                )}
              >
                <LiaUsersCogSolid className="text-xl" />
                <span className="tooltip">Retailers Management</span>
              </Link>
            </div>
          )}


          {/* Cart Link */}
          {(
            userPermissions.includes("view client-purchase-orders")
          ) && (
              <div className="relative group">
                <Link href={route("client-purchase-orders.index")}>
                  <a
                    className={getSidebarLinkClass(currentRoute.startsWith("client-purchase-orders") || currentRoute.startsWith("vendor-purchase-orders") || currentRoute === "ongoingProduction.index")
                    }
                  >
                    <BsCartPlus className="text-xl" />
                  </a>
                </Link>
                <span className="tooltip">Purchase Orders</span>
              </div>
            )}

          {/* Inventory & Stock Link */}
          {(
            userPermissions.includes("view games")
          ) && (
              <div className="relative group">
                <Link href={route("games.index")}>
                  <a
                    className={getSidebarLinkClass(
                      (currentRoute === "games.index" ||
                        currentRoute === "raw-materials.index" ||
                        currentRoute.startsWith("inventory"))
                    )}
                  >
                    <MdInventory className="text-xl" />
                  </a>
                </Link>
                <span className="tooltip">Games Settings</span>
              </div>
            )}
          {(
            userPermissions.includes("finishedGoodsList plants") && userRoles[0] != 'Super Admin'
          ) && (
              <div className="relative group">
                <Link href={route("plants.finishedGoodsList")}>
                  <a
                    className={getSidebarLinkClass(
                      (currentRoute === "plants.finishedGoodsList" ||
                        currentRoute === "plants.rawMaterialsList" ||
                        currentRoute.startsWith("inventory"))
                    )}
                  >
                    <MdInventory className="text-xl" />
                  </a>
                </Link>
                <span className="tooltip">Inventory & Stock</span>
              </div>
            )}

          {/* Reports Analytics Link */}


          {(
            userPermissions.includes("admin report")
          ) && (
              <div className="relative group">
                <Link href={route("report.retilaer")}>
                  <a className={getSidebarLinkClass(currentRoute.startsWith("reports"))}>
                    <AiOutlineFileDone className="text-xl" />
                  </a>
                </Link>
                <span className="tooltip">Reports Analytics</span>
              </div>
            )}

        </nav>
      </div>
    </>

  );
};

export default Sidebar;