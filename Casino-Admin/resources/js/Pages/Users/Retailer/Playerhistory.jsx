import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';

export default function PlayerHistory({ gameResults, claimsByUser, betByUser }) {
    const { filters } = usePage().props;

    // — date filter state
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    //— quick “today / yesterday / all” filter
    const [selectedFilter, setSelectedFilter] = useState('today');

    // disable “Apply” if invalid
    const isDateRangeValid = !(fromDate && toDate) || new Date(fromDate) <= new Date(toDate);

    const gameIds = Object.keys(gameResults);
    const [selectedGame, setSelectedGame] = useState(gameIds[0] || null);

    const [columnFilters, setColumnFilters] = useState({ bet: '', win_value: '', created_at: '' });
    const [sortConfig, setSortConfig] = useState({ field: 'win_value', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const { auth } = usePage().props;
    const alluserdetails = auth?.user?.userall || [];
    const commission = (alluserdetails[0]?.gstin_number || 0) / 100;

    // ── guard against undefined ──
    const raw = selectedGame && gameResults[selectedGame]
        ? gameResults[selectedGame]
        : [];

    // ── apply quick filter only when no from/to dates set ──
    const dateFiltered = raw.filter(r => {
        if (fromDate || toDate) return true;
        return r.created_at ? filterByDate(r.created_at, selectedFilter) : true;
    });

    // ── aggregate per player ──
    const aggregated = useMemo(() => {
        const map = {};
        dateFiltered.forEach(r => {
            const id = r.client.id;
            if (!map[id]) {
                map[id] = { client: r.client, bet: 0, win_value: 0, created_at: r.created_at, claim_point: 0 };
            }
            map[id].bet += Number(r.bet);
            map[id].win_value += Number(r.win_value);
        });
        Object.values(map).forEach(rec => rec.claim_point = claimsByUser[rec.client.id] || 0);
        return Object.values(map);
    }, [dateFiltered, claimsByUser]);

    // ── column text filters ──
    const filtered = aggregated.filter(rec => {
        const cAt = rec.created_at
            ? new Date(rec.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '';
        return (
            betByUser[rec.client.id].toString().includes(columnFilters.bet) &&
            rec.win_value.toString().includes(columnFilters.win_value) &&
            cAt.toLowerCase().includes(columnFilters.created_at.toLowerCase())
        );
    });

    // ── sorting, paging, totals ──
    const sorted = useMemo(() => {
        if (!sortConfig.field) return filtered;
        return [...filtered].sort((a, b) => {
            let aV = a[sortConfig.field], bV = b[sortConfig.field];
            if (['bet', 'win_value', 'claim_point'].includes(sortConfig.field)) {
                aV = +aV; bV = +bV;
            }
            if (sortConfig.field === 'created_at') {
                aV = new Date(aV); bV = new Date(bV);
            }
            if (aV < bV) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aV > bV) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortConfig]);

    const totalPages = Math.ceil(sorted.length / rowsPerPage);
    const pageData = sorted.slice((currentPage - 1) * rowsPerPage, (currentPage - 1) * rowsPerPage + rowsPerPage);
    const totalBet = dateFiltered.reduce((s, r) => s + Number(r.bet), 0);
    const totalWin = dateFiltered.reduce((s, r) => s + Number(r.win_value), 0);

    const SortIndicator = ({ field }) => {
        if (sortConfig.field !== field) return null;
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    return (
        <AuthenticatedLayout header={
            <h3 className="text-md font-semibold text-white bg-red p-4 rounded text-center">
                Recent Game Results
            </h3>
        }>
            <Head title="Recent Game Results" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    <p className="flex items-center text-sm text-gray-600 mb-4">
                        <span className="cursor-pointer hover:underline" onClick={() => window.history.back()}>Back</span>
                        <FiChevronRight className="mx-2" />
                        <span className="font-medium">Recent Game Results</span>
                    </p>

                    <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">

                        {/* date pickers + quick filter */}
                        <div className="flex gap-3 mb-4 items-end flex-wrap">
                            <div>
                                <label className="block text-sm">From</label>
                                <input type="date" value={fromDate}
                                    onChange={e => {
                                        setFromDate(e.target.value);
                                        setSelectedFilter('today');
                                    }}
                                    disabled={selectedFilter !== 'today'}
                                    className="border rounded px-2 py-1" />
                            </div>
                            <div>
                                <label className="block text-sm">To</label>
                                <input type="date" value={toDate}
                                    onChange={e => {
                                        setToDate(e.target.value);
                                        setSelectedFilter('today');
                                    }}
                                    disabled={selectedFilter !== 'today'}
                                    className="border rounded px-2 py-1" />
                            </div>
                            <button onClick={() => {
                                router.get(route('retailer.playerhistory'),
                                    { from_date: fromDate, to_date: toDate, quick_filter: selectedFilter },
                                    { preserveState: true, replace: true }
                                );
                            }}
                                disabled={!isDateRangeValid}
                                className={`px-4 py-1 rounded text-sm ${isDateRangeValid ? 'bg-red text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    }`}
                            >Apply</button>
                            {!isDateRangeValid && (
                                <div className="text-sm text-red-600 ml-2">
                                    From must be ≤ To
                                </div>
                            )}
                            <select className="border rounded px-2 py-1 text-sm"
                                value={selectedFilter}
                                onChange={e => {
                                    setSelectedFilter(e.target.value);
                                    setFromDate(''); setToDate('');
                                    setCurrentPage(1);
                                }}
                            >
                                {filterOptions.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* game tabs */}
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {gameIds.map(id => {
                                const name = gameResults[id]?.game_name || `Game ${id}`;
                                return (
                                    <button key={id}
                                        className={`px-3 py-2 rounded text-sm ${selectedGame === id ? 'bg-red text-white' : 'bg-gray-100 text-gray-600'
                                            }`}
                                        onClick={() => { setSelectedGame(id); setCurrentPage(1); }}
                                    >{name}</button>
                                );
                            })}
                        </div>

                        {/* summary */}


                        {/* table */}
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-sm text-red">
                                    <th className="p-2 border-b">Player</th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => setSortConfig(s => ({ field: 'bet', direction: s.direction === 'asc' ? 'desc' : 'asc' }))}>
                                        Play Point<SortIndicator field="bet" />
                                    </th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => setSortConfig(s => ({ field: 'win_value', direction: s.direction === 'asc' ? 'desc' : 'asc' }))}>
                                        Win Point<SortIndicator field="win_value" />
                                    </th>
                                    <th className="p-2 border-b">Net Point</th>
                                    <th className="p-2 border-b">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.length ? pageData.map(rec => (
                                    <tr key={rec.client.id} className="hover:bg-gray-50 text-sm">
                                        <td className="p-2 border-b">{rec.client.first_name} {rec.client.last_name}</td>
                                        <td className="p-2 border-b">{betByUser[rec.client.id] ?? 0}</td>
                                        <td className="p-2 border-b">{rec.win_value}</td>
                                        <td className="p-2 border-b">{betByUser[rec.client.id] - rec.win_value}</td>
                                        <td className="p-2 border-b">{rec.client.points}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="p-2 text-center text-sm">No records found.</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* pagination */}
                        <div className="flex justify-between items-center mt-4">
                            <div>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded mr-2">Previous</button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1 border rounded">Next</button>
                            </div>
                            <div>
                                <span className="text-sm mr-2">Page {currentPage} of {totalPages}</span>
                                <select className="border rounded py-1 text-sm"
                                    value={rowsPerPage}
                                    onChange={e => { setRowsPerPage(+e.target.value); setCurrentPage(1); }}
                                >
                                    {[20, 50, 100, 200, 500].map(n => (
                                        <option key={n} value={n}>{n} rows</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
