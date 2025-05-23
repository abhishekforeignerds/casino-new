import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';

export default function TransactionHistoryPage({ userpointsSales }) {
    const { filters } = usePage().props;

    // — date pickers state (local)
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    // — quick filter
    const [selectedFilter, setSelectedFilter] = useState(filters.quick_filter || 'all');

    // disable “Apply” if invalid
    const isDateRangeValid = !(fromDate && toDate) || new Date(fromDate) <= new Date(toDate);

    // — column text filters
    const [columnFilters, setColumnFilters] = useState({
        reference_number: '',
        from_user: '',
        to_user: '',
        amount: '',
        status: '',
        created_at: '',
    });

    const [sortConfig, setSortConfig] = useState({ field: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const rowsPerPageOptions = [20, 50, 100, 200, 500];

    // ── FIXED DATE FILTERING ──
    // only skip “quick” filter when a local from/to range is set
    const hasLocalRange = fromDate || toDate;
    const dateFiltered = userpointsSales.filter(r => {
        if (hasLocalRange) {
            return true;
        }
        return r.created_at ? filterByDate(r.created_at, selectedFilter) : true;
    });

    // ── column text filtering ──
    const filteredData = dateFiltered.filter(record => {
        const fromName = `${record.fromUser?.first_name || ''} ${record.fromUser?.last_name || ''}`;
        const toName = `${record.user?.first_name || ''} ${record.user?.last_name || ''}`;
        const createdAtStr = record.created_at
            ? new Date(record.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            })
            : '';
        return (
            record.reference_number.toLowerCase().includes(columnFilters.reference_number.toLowerCase()) &&
            fromName.toLowerCase().includes(columnFilters.from_user.toLowerCase()) &&
            toName.toLowerCase().includes(columnFilters.to_user.toLowerCase()) &&
            record.amount.toString().includes(columnFilters.amount) &&
            createdAtStr.toLowerCase().includes(columnFilters.created_at.toLowerCase())
        );
    });

    // ── sorting ──
    const sortedData = useMemo(() => {
        const arr = [...filteredData];
        const { field, direction } = sortConfig;
        arr.sort((a, b) => {
            let aV =
                field === 'fromUser'
                    ? a.fromUser?.first_name || ''
                    : field === 'toUser'
                        ? a.user?.first_name || ''
                        : field === 'status'
                            ? a.status
                            : a[field];
            let bV =
                field === 'fromUser'
                    ? b.fromUser?.first_name || ''
                    : field === 'toUser'
                        ? b.user?.first_name || ''
                        : field === 'status'
                            ? b.status
                            : b[field];

            if (field === 'amount') {
                aV = Number(aV);
                bV = Number(bV);
            }
            if (field === 'created_at') {
                aV = new Date(aV);
                bV = new Date(bV);
            }
            if (aV < bV) return direction === 'asc' ? -1 : 1;
            if (aV > bV) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        return arr;
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * rowsPerPage,
        (currentPage - 1) * rowsPerPage + rowsPerPage
    );

    const handleFilterChange = (e, field) => {
        setColumnFilters({ ...columnFilters, [field]: e.target.value });
        setCurrentPage(1);
    };

    const SortIndicator = ({ field }) => {
        if (sortConfig.field !== field) return null;
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold text-white bg-red p-4 rounded text-center">
                    Transaction History
                </h3>
            }
        >
            <Head title="Transaction History" />

            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <p className="flex items-center text-sm text-gray-600 mb-4">
                        <span className="cursor-pointer hover:underline" onClick={() => window.history.back()}>
                            Back
                        </span>
                        <FiChevronRight className="mx-2" />
                        <span className="font-medium">Transaction History</span>
                    </p>

                    <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
                        {/* — date pickers + quick filter */}
                        <div className="flex gap-3 mb-4 items-end flex-wrap">
                            <div>
                                <label className="block text-sm">From</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={e => {
                                        setFromDate(e.target.value);
                                        setSelectedFilter('all');
                                    }}
                                    disabled={selectedFilter !== 'all'}
                                    className="border rounded px-2 py-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm">To</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={e => {
                                        setToDate(e.target.value);
                                        setSelectedFilter('all');
                                    }}
                                    disabled={selectedFilter !== 'all'}
                                    className="border rounded px-2 py-1"
                                />
                            </div>
                            <button
                                onClick={() =>
                                    router.get(
                                        route('retailer.transactionhistory'),
                                        { from_date: fromDate, to_date: toDate, quick_filter: selectedFilter },
                                        { preserveState: true, replace: true }
                                    )
                                }
                                disabled={!isDateRangeValid}
                                className={`px-4 py-1 rounded text-sm ${isDateRangeValid ? 'bg-red text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                Apply
                            </button>
                            {!isDateRangeValid && (
                                <div className="text-sm text-red-600 ml-2">From must be ≤ To</div>
                            )}
                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={selectedFilter}
                                onChange={e => {
                                    setSelectedFilter(e.target.value);
                                    setFromDate(''); setToDate('');
                                    setCurrentPage(1);
                                }}
                            >
                                {filterOptions.map(o => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* — table */}
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-sm text-red">
                                    <th className="p-2 border-b">Transaction ID</th>
                                    <th
                                        className="p-2 border-b cursor-pointer"
                                        onClick={() =>
                                            setSortConfig(s => ({
                                                field: 'fromUser',
                                                direction: s.direction === 'asc' ? 'desc' : 'asc',
                                            }))
                                        }
                                    >
                                        From User<SortIndicator field="fromUser" />
                                    </th>
                                    <th
                                        className="p-2 border-b cursor-pointer"
                                        onClick={() =>
                                            setSortConfig(s => ({
                                                field: 'toUser',
                                                direction: s.direction === 'asc' ? 'desc' : 'asc',
                                            }))
                                        }
                                    >
                                        To User<SortIndicator field="toUser" />
                                    </th>
                                    <th
                                        className="p-2 border-b cursor-pointer"
                                        onClick={() =>
                                            setSortConfig(s => ({
                                                field: 'amount',
                                                direction: s.direction === 'asc' ? 'desc' : 'asc',
                                            }))
                                        }
                                    >
                                        Amount<SortIndicator field="amount" />
                                    </th>
                                    <th className="p-2 border-b">Status</th>
                                    <th
                                        className="p-2 border-b cursor-pointer"
                                        onClick={() =>
                                            setSortConfig(s => ({
                                                field: 'created_at',
                                                direction: s.direction === 'asc' ? 'desc' : 'asc',
                                            }))
                                        }
                                    >
                                        Date<SortIndicator field="created_at" />
                                    </th>
                                </tr>
                                <tr className="text-sm">
                                    <th className="p-2 border-b">
                                        <input
                                            type="text"
                                            value={columnFilters.reference_number}
                                            onChange={e => handleFilterChange(e, 'reference_number')}
                                            className="w-full border rounded p-1"
                                            placeholder="Search Trans ID#"
                                        />
                                    </th>
                                    <th className="p-2 border-b">
                                        <input
                                            type="text"
                                            value={columnFilters.from_user}
                                            onChange={e => handleFilterChange(e, 'from_user')}
                                            className="w-full border rounded p-1"
                                            placeholder="Search From"
                                        />
                                    </th>
                                    <th className="p-2 border-b">
                                        <input
                                            type="text"
                                            value={columnFilters.to_user}
                                            onChange={e => handleFilterChange(e, 'to_user')}
                                            className="w-full border rounded p-1"
                                            placeholder="Search To"
                                        />
                                    </th>
                                    <th className="p-2 border-b">
                                        <input
                                            type="text"
                                            value={columnFilters.amount}
                                            onChange={e => handleFilterChange(e, 'amount')}
                                            className="w-full border rounded p-1"
                                            placeholder="Search Amount"
                                        />
                                    </th>
                                    <th className="p-2 border-b">
                                        <input
                                            type="text"
                                            value={columnFilters.status}
                                            onChange={e => handleFilterChange(e, 'status')}
                                            className="w-full border rounded p-1"
                                            placeholder="Search Status"
                                        />
                                    </th>
                                    <th className="p-2 border-b">
                                        <input
                                            type="text"
                                            value={columnFilters.created_at}
                                            onChange={e => handleFilterChange(e, 'created_at')}
                                            className="w-full border rounded p-1"
                                            placeholder="Search Date"
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length ? (
                                    paginatedData.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50 text-sm">
                                            <td className="p-2 border-b">{record.reference_number}</td>
                                            <td className="p-2 border-b">{record.from_user?.name}</td>
                                            <td className="p-2 border-b">
                                                {record.user?.first_name} {record.user?.last_name}
                                            </td>
                                            <td className="p-2 border-b">{record.amount}</td>
                                            <td className="p-2 border-b">Added</td>
                                            <td className="p-2 border-b">
                                                {new Date(record.created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-2 text-center text-sm">No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* pagination … */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
