import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Link } from '@inertiajs/react';

export default function GameResultsPage({ gameResults, claimsByUser, unClaimsByUser, betByUser }) {

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
    const gameIds = Object.keys(gameResults);
    const [selectedGame, setSelectedGame] = useState(gameIds.length ? gameIds[0] : null);
    const [selectedFilter, setSelectedFilter] = useState('today');

    // column filter state for every column (including claim/unclaim points)
    const [columnFilters, setColumnFilters] = useState({
        username: '',
        playerName: '',
        parent: '',
        balance: '',
        bet: '',
        win_value: '',
        claim_point: '',
        unclaim_point: '',
        casinoProfit: '',
        ntp: ''
    });

    // default sort by player name
    const [sortConfig, setSortConfig] = useState({ field: 'playerName', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const rowsPerPageOptions = [20, 50, 100, 200, 500];

    // filter base records by date
    const selectedGameResults = selectedGame
        ? gameResults[selectedGame].filter(record =>
            record.created_at ? filterByDate(record.created_at, selectedFilter) : true
        )
        : [];

    // 1️⃣ AGGREGATE BY PLAYER
    const aggregatedResults = useMemo(() => {
        const map = {};
        selectedGameResults.forEach(record => {
            const pid = record.client.id;
            if (!map[pid]) {
                map[pid] = { client: record.client, bet: 0, win_value: 0, created_at: record.created_at };
            }
            map[pid].bet += Number(betByUser[record.client.id]);
            map[pid].win_value += Number(record.win_value);
        });
        Object.values(map).forEach(rec => {
            rec.claim_point = claimsByUser[rec.client.id] || 0;
            rec.unclaim_point = unClaimsByUser[rec.client.id] || 0;
        });
        return Object.values(map);
    }, [selectedGameResults, claimsByUser, unClaimsByUser]);

    // extract auth and commission
    const { auth } = usePage().props;
    const alluserdetails = auth?.user?.userall || [];
    const commission = (alluserdetails[0]?.gstin_number || 0) / 100;

    // 2️⃣ APPLY FILTERS on aggregated results
    const filteredResults = useMemo(() => {
        return aggregatedResults.filter(record => {
            const usernameMatch = record.client.username
                .toLowerCase()
                .includes(columnFilters.username.toLowerCase());
            const fullName = `${record.client.first_name} ${record.client.last_name}`;
            const playerNameMatch = fullName.toLowerCase().includes(columnFilters.playerName.toLowerCase());
            const parentName = record.client.retailer ? record.client.retailer.name : '';
            const parentMatch = parentName.toLowerCase().includes(columnFilters.parent.toLowerCase());
            const balanceMatch = record.client.points.toString().includes(columnFilters.balance);
            const betMatch = betByUser[record.client.id].toString().includes(columnFilters.bet);
            const winMatch = record.win_value.toString().includes(columnFilters.win_value);
            const claimMatch = record.claim_point.toString().includes(columnFilters.claim_point);
            const unclaimMatch = record.unclaim_point.toString().includes(columnFilters.unclaim_point);
            const profit = betByUser[record.client.id] - (record.client.points + record.claim_point + record.unclaim_point);
            const profitMatch = profit.toString().includes(columnFilters.casinoProfit);
            const ntpVal = (betByUser[record.client.id] - record.win_value) * commission;
            const ntpMatch = ntpVal.toString().includes(columnFilters.ntp);
            return (
                usernameMatch &&
                playerNameMatch &&
                parentMatch &&
                balanceMatch &&
                betMatch &&
                winMatch &&
                claimMatch &&
                unclaimMatch &&
                profitMatch &&
                ntpMatch
            );
        });
    }, [aggregatedResults, columnFilters, commission]);

    // 3️⃣ SORTING
    const sortedResults = useMemo(() => {
        const list = [...filteredResults];
        if (!sortConfig.field) return list;
        return list.sort((a, b) => {
            let aVal, bVal;
            switch (sortConfig.field) {
                case 'playerName':
                    aVal = `${a.client.first_name} ${a.client.last_name}`;
                    bVal = `${b.client.first_name} ${b.client.last_name}`;
                    break;
                case 'username':
                    aVal = a.client.username;
                    bVal = b.client.username;
                    break;
                case 'parent':
                    aVal = a.client.retailer ? a.client.retailer.name : '';
                    bVal = b.client.retailer ? b.client.retailer.name : '';
                    break;
                case 'balance':
                    aVal = a.client.points;
                    bVal = b.client.points;
                    break;
                case 'bet':
                case 'win_value':
                case 'claim_point':
                case 'unclaim_point':
                    aVal = a[sortConfig.field];
                    bVal = b[sortConfig.field];
                    break;
                case 'casinoProfit':
                    aVal = a.bet - (a.client.points + a.claim_point + a.unclaim_point);
                    bVal = b.bet - (b.client.points + b.claim_point + b.unclaim_point);
                    break;
                case 'ntp':
                    aVal = (a.bet - a.win_value) * commission;
                    bVal = (b.bet - b.win_value) * commission;
                    break;
                default:
                    aVal = '';
                    bVal = '';
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredResults, sortConfig, commission]);

    // 4️⃣ PAGINATION
    const totalPages = Math.ceil(sortedResults.length / rowsPerPage);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const paginatedResults = sortedResults.slice(startIdx, startIdx + rowsPerPage);

    // 5️⃣ COMPUTE TOTALS
    const totals = useMemo(() => {
        return filteredResults.reduce(
            (acc, rec) => {
                acc.balance += rec.client.points;
                acc.bet += betByUser[rec.client.id];
                acc.win_value += rec.win_value;
                acc.claim_point += rec.claim_point;
                acc.unclaim_point += rec.unclaim_point;
                acc.casinoProfit += betByUser[rec.client.id] - (rec.claim_point + rec.unclaim_point);
                acc.ntp += (betByUser[rec.client.id] - rec.win_value) * commission;
                return acc;
            },
            {
                balance: 0,
                bet: 0,
                win_value: 0,
                claim_point: 0,
                unclaim_point: 0,
                casinoProfit: 0,
                ntp: 0
            }
        );
    }, [filteredResults, commission]);

    const handleFilterChange = (e, field) => {
        setColumnFilters({ ...columnFilters, [field]: e.target.value });
        setCurrentPage(1);
    };
    const handleSort = field => {
        setSortConfig(prev =>
            prev.field === field
                ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
                : { field, direction: 'asc' }
        );
    };
    const goToPage = page => page >= 1 && page <= totalPages && setCurrentPage(page);

    const SortIndicator = ({ field }) =>
        sortConfig.field === field ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : null;

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Recent Game Results
                </h3>
            }
        >
            <Head title="Recent Game Results" />
            <div className="main-content-container sm:ml-52">
                <Link hidden ref={dashboardLinkRef} href="/player-game-results">
                    Refresh
                </Link>
                <div className="mx-auto py-6">
                    <p className="flex items-center text-sm text-gray-600 mb-4">
                        <span className="cursor-pointer hover:underline" onClick={() => window.history.back()}>
                            Back
                        </span>
                        <FiChevronRight className="mx-2" />
                        <span className="font-medium">Recent Game Results</span>
                    </p>
                    <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
                        {/* Filters & Game Tabs */}
                        <div className="flex flex-wrap justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Recent Game Results</h2>
                            <select
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                value={selectedFilter}
                                onChange={e => { setSelectedFilter(e.target.value); setCurrentPage(1); }}
                            >
                                {filterOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {gameIds.map(id => {
                                const name = gameResults[id]?.game_name || `Game ${id}`;
                                return (
                                    <button
                                        key={id}
                                        className={`px-3 py-2 rounded text-sm ${selectedGame === id ? 'bg-red text-white' : 'bg-gray-100 text-gray-600'}`}
                                        onClick={() => { setSelectedGame(id); setCurrentPage(1); }}
                                    >
                                        {name}
                                    </button>
                                );
                            })}
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {/* Totals row */}
                                <tr className="bg-gray-100 text-sm font-bold">
                                    <th className="p-2 border-b">Totals</th>
                                    <th className="p-2 border-b"></th>
                                    <th className="p-2 border-b"></th>
                                    <th className="p-2 border-b">{totals.balance}</th>
                                    <th className="p-2 border-b">{totals.bet}</th>
                                    <th className="p-2 border-b">{totals.win_value}</th>
                                    <th className="p-2 border-b">{totals.claim_point}</th>
                                    <th className="p-2 border-b">{totals.unclaim_point}</th>
                                    <th className="p-2 border-b">{totals.casinoProfit}</th>
                                    <th className="p-2 border-b">{totals.ntp.toFixed(2)}</th>
                                </tr>
                                {/* Header names */}
                                <tr className="text-sm text-red">
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('username')}>Username<SortIndicator field="username" /></th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('playerName')}>Player Name<SortIndicator field="playerName" /></th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('parent')}>Parent<SortIndicator field="parent" /></th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('balance')}>Balance<SortIndicator field="balance" /></th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('bet')}>Total Bet<SortIndicator field="bet" /></th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('win_value')}>Total Won<SortIndicator field="win_value" /></th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('claim_point')}>Claim Point<SortIndicator field="claim_point" /></th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('unclaim_point')}>Unclaim Point<SortIndicator field="unclaim_point" /></th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('casinoProfit')}>Casino Profit<SortIndicator field="casinoProfit" /></th>
                                    <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('ntp')}>NTP<SortIndicator field="ntp" /></th>
                                </tr>
                                {/* Filter inputs */}
                                <tr className="text-xs">
                                    {Object.entries(columnFilters).map(([field, val]) => (
                                        <th key={field} className="p-2 border-b">
                                            <input
                                                type="text"
                                                value={val}
                                                onChange={e => handleFilterChange(e, field)}
                                                placeholder="Search"
                                                className="w-full border border-gray-300 rounded p-1 text-xs"
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedResults.length > 0 ? (
                                    paginatedResults.map(rec => {
                                        const profit = betByUser[rec.client.id] - (rec.claim_point + rec.unclaim_point);
                                        const ntpVal = (betByUser[rec.client.id]) * commission;
                                        return (
                                            <tr key={rec.client.id} className="hover:bg-gray-50 text-sm">
                                                <td className="p-2 border-b">{rec.client.username}</td>
                                                <td className="p-2 border-b">{rec.client.first_name} {rec.client.last_name}</td>
                                                <td className="p-2 border-b">{rec.client.retailer ? rec.client.retailer.name : '—'}</td>
                                                <td className="p-2 border-b">{rec.client.points}</td>
                                                <td className="p-2 border-b">{betByUser[rec.client.id]}</td>
                                                <td className="p-2 border-b">{rec.win_value}</td>
                                                <td className="p-2 border-b">{rec.claim_point}</td>
                                                <td className="p-2 border-b">{rec.unclaim_point}</td>
                                                <td className="p-2 border-b">{profit}</td>
                                                <td className="p-2 border-b">{ntpVal.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="p-2 text-center text-sm">
                                            No records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="flex justify-between items-center mt-4">
                            <div>
                                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded mr-2">
                                    Previous
                                </button>
                                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border rounded">
                                    Next
                                </button>
                            </div>
                            <div>
                                <span className="text-sm mr-2">Page {currentPage} of {totalPages}</span>
                                <select className="border border-gray-300 rounded py-1 text-sm" value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                    {rowsPerPageOptions.map(opt => <option key={opt} value={opt}>{opt} rows</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
