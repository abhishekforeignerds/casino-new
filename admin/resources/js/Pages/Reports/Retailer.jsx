import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';

export default function Turnover({ gameResults, claimsByUser, saleToUser, unClaimsByUser }) {
    const { auth, filters } = usePage().props;
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [selectedFilter, setSelectedFilter] = useState('today');
    const isDateRangeValid = !(fromDate && toDate) || new Date(fromDate) <= new Date(toDate);

    const gameIds = Object.keys(gameResults);
    const [selectedGame, setSelectedGame] = useState(gameIds[0] || null);

    const [columnFilters, setColumnFilters] = useState({ bet: '', win_value: '', created_at: '' });
    const [sortConfig, setSortConfig] = useState({ field: 'win_value', direction: 'desc' });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const userRoles = auth?.user?.roles || [];
    const alluserdetails = auth?.user?.userall || [];
    const commission = (alluserdetails[0]?.gstin_number || 0) / 100;

    // 1) Filter by selected game & date range
    const selectedGameResults = useMemo(() => {
        if (!selectedGame || !gameResults[selectedGame]) return [];
        return gameResults[selectedGame].filter(r => {
            if (fromDate || toDate) {
                return r.created_at && filterByDate(r.created_at, selectedFilter);
            }
            return r.created_at ? filterByDate(r.created_at, selectedFilter) : true;
        });
    }, [gameResults, selectedGame, fromDate, toDate, selectedFilter]);

    // 2) Aggregate per client (unchanged)
    const aggregated = useMemo(() => {
        const map = {};
        selectedGameResults.forEach(r => {
            const pid = r.client.id;
            if (!map[pid]) {
                map[pid] = {
                    client: r.client,
                    bet: 0,
                    win_value: 0,
                    created_at: r.created_at,
                    claim_point: 0,
                    unclaim_point: 0,
                    sale_point: 0,
                };
            }
            map[pid].bet += Number(r.bet);
            map[pid].win_value += Number(r.win_value);
        });
        Object.values(map).forEach(rec => {
            const id = rec.client.id;
            rec.claim_point = claimsByUser[id] || 0;
            rec.unclaim_point = unClaimsByUser[id] || 0;
            rec.sale_point = saleToUser[id] || 0;
        });
        return Object.values(map);
    }, [selectedGameResults, claimsByUser, saleToUser, unClaimsByUser]);

    // 3) Column filters
    const filtered = useMemo(() => {
        return aggregated.filter(rec => {
            const cAt = rec.created_at
                ? new Date(rec.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '';
            return (
                rec.bet.toString().includes(columnFilters.bet) &&
                rec.win_value.toString().includes(columnFilters.win_value) &&
                cAt.toLowerCase().includes(columnFilters.created_at.toLowerCase())
            );
        });
    }, [aggregated, columnFilters]);

    // 4) Sort
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

    // 5) Paginate
    const totalPages = Math.ceil(sorted.length / rowsPerPage);
    const pageStart = (currentPage - 1) * rowsPerPage;
    const pageData = sorted.slice(pageStart, pageStart + rowsPerPage);

    // 6) Page totals (unchanged)
    const toPaisa = x => Math.round((x + Number.EPSILON) * 100);
    const toRupee = p => p / 100;
    const totals = useMemo(() => {
        let totalBetC = 0, totalWinC = 0, totalSaleC = 0, totalPointsC = 0;
        let totalClaimC = 0, totalUnClaimC = 0, grossPointC = 0, netPointC = 0, revenueC = 0;

        pageData.forEach(rec => {
            const betC = toPaisa(parseFloat(rec.bet));
            const winC = toPaisa(parseFloat(rec.win_value));
            const saleC = toPaisa(parseFloat(rec.sale_point));
            const pointC = toPaisa(parseFloat(rec.client.points));
            const claimC = toPaisa(parseFloat(rec.claim_point));
            const unclaimC = toPaisa(parseFloat(rec.unclaim_point));
            const pointsC = pointC + claimC + unclaimC;

            let diffC = 0, commC = 0, netC = 0;
            const role = userRoles[0] || '';

            if (role === 'Retailer') {
                diffC = saleC - pointsC;
                commC = Math.round(diffC * commission);
                netC = diffC - commC;
            } else if (role === 'Stockit') {
                const retdiffC = saleC - pointsC;
                const gstPercent = parseFloat(rec.client.retailer?.gstin_number || 0);
                const retC = Math.round(retdiffC * gstPercent / 100);
                const retnetC = retdiffC - retC;
                diffC = retnetC;
                commC = Math.round(diffC * commission);
                netC = diffC - commC;
            } else {
                const retdiffC = saleC - pointsC;
                const gstR = parseFloat(rec.client.retailer?.gstin_number || 0);
                const retC1 = Math.round(retdiffC * gstR / 100);
                const retnet = retdiffC - retC1;
                const stkP = parseFloat(rec.client.stockit?.gstin_number || 0);
                const stkC = Math.round(retnet * stkP / 100);
                const stkNetC = retnet - stkC;
                diffC = stkNetC;
                commC = Math.round(diffC * commission);
                netC = diffC - commC;
            }

            totalBetC += betC;
            totalWinC += winC;
            totalSaleC += saleC;
            totalPointsC += pointC;
            totalClaimC += claimC;
            totalUnClaimC += unclaimC;
            grossPointC += diffC;
            netPointC += netC;
            revenueC += commC;
        });

        return {
            totalBet: toRupee(totalBetC),
            totalWin: toRupee(totalWinC),
            totalSale: toRupee(totalSaleC),
            totalPoints: toRupee(totalPointsC),
            totalClaim: toRupee(totalClaimC),
            totalUnClaim: toRupee(totalUnClaimC),
            grossPoint: toRupee(grossPointC),
            netPoint: toRupee(netPointC),
            revenue: toRupee(revenueC),
        };
    }, [pageData, userRoles, commission]);

    // 7) NEW: Group this page’s records by retailer, sum them into one row each
    const retailerRows = useMemo(() => {
        const map = {};
        pageData.forEach(rec => {
            const r = rec.client.retailer || { id: 'unknown', name: '— No Retailer —', gstin_number: 0 };
            const key = r.id;
            if (!map[key]) {
                map[key] = {
                    retailer: r,
                    totalBet: 0,
                    totalWin: 0,
                    totalSale: 0,
                    totalPoints: 0,
                    totalClaim: 0,
                    totalUnclaim: 0,
                };
            }
            const e = map[key];
            e.totalBet += rec.bet;
            e.totalWin += rec.win_value;
            e.totalSale += rec.sale_point;
            e.totalPoints += rec.client.points;
            e.totalClaim += rec.claim_point;
            e.totalUnclaim += rec.unclaim_point;
        });

        // turn into array and compute diff/comm/net per retailer
        return Object.values(map).map(e => {
            const pts = e.totalPoints + e.totalClaim + e.totalUnclaim;
            let diff = 0, commAmount = 0, netamount = 0;
            const role = userRoles[0] || '';

            if (role === 'Retailer') {
                diff = e.totalSale - pts;
                commAmount = diff * commission;
                netamount = diff - commAmount;
            } else if (role === 'Stockit') {
                const retdiff = e.totalSale - pts;
                const gstPercent = parseFloat(e.retailer.gstin_number || 0);
                const retC = retdiff * (gstPercent / 100);
                const retnet = retdiff - retC;
                diff = retnet;
                commAmount = diff * commission;
                netamount = diff - commAmount;
            } else {
                const retdiff = e.totalSale - pts;
                const gstR = parseFloat(e.retailer.gstin_number || 0);
                const retC1 = retdiff * (gstR / 100);
                const retnet = retdiff - retC1;
                const stkP = parseFloat(e.retailer.stockit?.gstin_number || 0);
                const stkC = retnet * (stkP / 100);
                const stkNet = retnet - stkC;
                diff = stkNet;
                commAmount = diff * commission;
                netamount = diff - commAmount;
            }

            return {
                retailer: e.retailer,
                bet: e.totalBet,
                win_value: e.totalWin,
                sale_point: e.totalSale,
                end_point: e.totalPoints,
                claim_point: e.totalClaim,
                unclaim_point: e.totalUnclaim,
                gross: diff,
                net: netamount,
                revenue: commAmount,
            };
        });
    }, [pageData, userRoles, commission]);

    const SortIndicator = ({ field }) =>
        sortConfig.field === field ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : null;

    return (
        <AuthenticatedLayout
            header={
                <h3 className="text-md font-semibold leading-tight text-white w-full bg-red p-4 rounded-md text-center">
                    Turnover History
                </h3>
            }
        >
            <Head title="Turnover History" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6">
                    {/* … your filters UI unchanged … */}

                    <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-sm text-red">
                                    <th className="p-2 border-b">Username</th>
                                    <th className="p-2 border-b">Player Name</th>
                                    <th
                                        className="p-2 border-b cursor-pointer"
                                        onClick={() =>
                                            setSortConfig(f => ({ field: 'bet', direction: f.direction === 'asc' ? 'desc' : 'asc' }))
                                        }
                                    >
                                        Play Point<SortIndicator field="bet" />
                                    </th>
                                    <th
                                        className="p-2 border-b cursor-pointer"
                                        onClick={() =>
                                            setSortConfig(f => ({ field: 'win_value', direction: f.direction === 'asc' ? 'desc' : 'asc' }))
                                        }
                                    >
                                        Win Point<SortIndicator field="win_value" />
                                    </th>
                                    <th className="p-2 border-b">Sale Point</th>
                                    <th className="p-2 border-b">End Point</th>
                                    <th className="p-2 border-b">Claim Point</th>
                                    <th className="p-2 border-b">Unclaim Point</th>
                                    <th className="p-2 border-b">Gross Point</th>
                                    <th className="p-2 border-b">Net Point</th>
                                    <th className="p-2 border-b">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Totals row */}
                                <tr className="bg-gray-100 font-semibold text-sm">
                                    <td className="p-2 border-b">–</td>
                                    <td className="p-2 border-b">Total</td>
                                    <td className="p-2 border-b">{totals.totalBet.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.totalWin.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.totalSale.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.totalPoints.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.totalClaim.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.totalUnClaim.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.grossPoint.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.netPoint.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.revenue.toFixed(2)}</td>
                                </tr>

                                {/* One row per retailer */}
                                {retailerRows.map(r => (
                                    <tr key={r.retailer.id} className="hover:bg-gray-50 text-sm">
                                        <td className="p-2 border-b">–</td>
                                        <td className="p-2 border-b">{r.retailer.name}</td>
                                        <td className="p-2 border-b">{r.bet.toFixed(2)}</td>
                                        <td className="p-2 border-b">{r.win_value.toFixed(2)}</td>
                                        <td className="p-2 border-b">{r.sale_point.toFixed(2)}</td>
                                        <td className="p-2 border-b">{r.end_point.toFixed(2)}</td>
                                        <td className="p-2 border-b">{r.claim_point.toFixed(2)}</td>
                                        <td className="p-2 border-b">{r.unclaim_point.toFixed(2)}</td>
                                        <td className="p-2 border-b">{r.gross.toFixed(2)}</td>
                                        <td className="p-2 border-b">{r.net.toFixed(2)}</td>
                                        <td className="p-2 border-b">{r.revenue.toFixed(2)}</td>
                                    </tr>
                                ))}

                                {retailerRows.length === 0 && (
                                    <tr>
                                        <td colSpan="11" className="p-2 text-center text-sm">
                                            No records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* pagination (unchanged) */}
                        <div className="flex justify-between items-center mt-4">
                            <div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded mr-2"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1 border rounded"
                                >
                                    Next
                                </button>
                            </div>
                            <div>
                                <span className="text-sm mr-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <select
                                    className="border rounded py-1 text-sm"
                                    value={rowsPerPage}
                                    onChange={e => {
                                        setRowsPerPage(+e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {[20, 50, 100, 200, 500].map(n => (
                                        <option key={n} value={n}>
                                            {n} rows
                                        </option>
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
