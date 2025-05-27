// Fixed filter options with additional Last 3 Months and Last 6 Months options
export const filterOptions = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "this_week" },
    { label: "Previous 7 Days", value: "previous_7_days" },
    { label: "Last 14 Days", value: "last_14_days" },
    { label: "Last 30 Days", value: "last_30_days" },
    { label: "This Month", value: "this_month" },
    { label: "Last Month", value: "last_month" },
    { label: "This Year", value: "this_year" },
    { label: "Last Year", value: "last_year" },
    { label: "Last 3 Months", value: "last_3_months" },
    { label: "Last 6 Months", value: "last_6_months" }
];

// Helper function to determine if a date fits within the selected filter
export const filterByDate = (date, filter) => {
    const d = new Date(date);
    const now = new Date();
    switch (filter) {
        case 'today':
            return d.toDateString() === now.toDateString();
        case 'yesterday': {
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);
            return d.toDateString() === yesterday.toDateString();
        }
        case 'this_week': {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return d >= startOfWeek && d <= endOfWeek;
        }
        case 'previous_7_days': {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            return d >= sevenDaysAgo && d < todayStart;
        }
        case 'last_14_days': {
            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(now.getDate() - 14);
            // Include any record from fourteenDaysAgo until now
            return d >= fourteenDaysAgo && d <= now;
        }
        case 'last_30_days': {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return d >= thirtyDaysAgo && d <= now;
        }
        case 'this_month':
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'last_month': {
            const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        }
        case 'this_year':
            return d.getFullYear() === now.getFullYear();
        case 'last_year':
            return d.getFullYear() === now.getFullYear() - 1;
        case 'last_3_months': {
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            return d >= threeMonthsAgo && d < now;
        }
        case 'last_6_months': {
            const sixMonthsAgo = new Date(now);
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            return d >= sixMonthsAgo && d < now;
        }
        default:
            return true; // "all"
    }
};