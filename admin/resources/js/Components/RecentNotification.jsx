import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { getStatusText } from "./../../utils/statusUtils";
import NotificationTabs from "@/Components/NotificationTabs";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getIcon = (purpose) => {
  if (purpose === "pending") return "⏳";
  if (
    purpose === "move_forward" ||
    purpose === "completed" ||
    purpose === "plant_head_approved"
  )
    return "🔔";
  if (purpose === "dispatched") return "🚛";
  if (purpose === "low_stock") return "📉";

  return "🔔";
};

const RecentNotifications = ({ notifications, showViewAll = true }) => {
  const { auth } = usePage().props; // Get user data from Inertia
  const userRoles = auth?.user?.roles || [];
  const [activeTab, setActiveTab] = useState("All");
  const userPermissions =
    auth?.user?.rolespermissions?.flatMap((role) => role.permissions) || [];

  // Filter notifications: Super Admin sees all, others see only their notifications
  const filteredNotifications =
    userRoles[0] === "Super Admin"
      ? notifications
      : notifications.filter(
        (notification) => notification.to_id === auth.user.id
      );

  // Tab-wise filtering logic
  const getFilteredNotifications = () => {
    if (activeTab === "Pending") {
      return filteredNotifications.filter(
        (notification) => notification.purpose === "pending"
      );
    } else if (activeTab === "Completed") {
      return filteredNotifications.filter(
        (notification) =>
          notification.purpose === "completed" ||
          notification.purpose === "plant_head_approved"
      );
    }
    return filteredNotifications; // Default: All notifications
  };

  return (
    <div className="bg-lightPink shadow-md rounded-lg p-4 px-2 overflow-x-auto flex-1">
      <h2 className="text-lg font-semibold mb-4 flex gap-2 items-center">
        <p className="px-2 py-1 text-md bg-white rounded-md">🔔</p>
        Recent Notifications
      </h2>

      {/* Notification Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-300">
        {["All", "Pending", "Completed"].map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-2 text-sm font-semibold focus:outline-none ${activeTab === tab
                ? "border-b-2 border-red-hover text-red-500"
                : "text-gray-600 hover:text-red-500"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification Content */}
      <div className="space-y-4">
        {getFilteredNotifications().length > 0 ? (
          getFilteredNotifications().map((notification, index) => (
            <a
              key={index}
              href={notification.notification_url}
              className="block items-start gap-2 p-1 border-b last:border-none hover:bg-gray-50"
            >
              <div className="flex items-start gap-2 p-1">
                <div className="text-md">{getIcon(notification.purpose)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start flex-col sm:flex-row">
                    <h3 className="font-medium text-sm">
                      {getStatusText(notification.type)}
                    </h3>
                    <span className="text-xs text-red min-w-[4rem] text-right">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {notification.notification_text}
                  </p>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="text-center text-gray-500">No Notifications</div>
        )}
      </div>

      {/* View All Notifications */}
      {showViewAll && getFilteredNotifications().length > 0 && (
        <div className="text-center mt-4">
          <Link
            href={route("notifications")}
            className="font-bold py-1 text-red rounded max-w-max"
          >
            Read All Notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentNotifications;

