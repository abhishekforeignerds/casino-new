import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';

export default function Turnover({ gameResults, claimsByUser, saleToUser, unClaimsByUser, betByUser }) {
    console.log('betByUser', betByUser)
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

    const selectedGameResults =
        selectedGame && gameResults[selectedGame]
            ? gameResults[selectedGame].filter(r =>
                fromDate || toDate
                    ? r.created_at && filterByDate(r.created_at, selectedFilter)
                    : r.created_at
                        ? filterByDate(r.created_at, selectedFilter)
                        : true
            )
            : [];

    const aggregated = useMemo(() => {
        const map = {};
        selectedGameResults.forEach(r => {
            const pid = r.client.id;
            if (!map[pid]) {
                map[pid] = { client: r.client, bet: 0, win_value: 0, created_at: r.created_at, claim_point: 0 };
            }
            map[pid].bet += Number(r.bet);
            map[pid].win_value += Number(r.win_value);
        });
        Object.values(map).forEach(rec => {
            rec.claim_point = claimsByUser[rec.client.id] || 0;
            rec.unclaim_point = unClaimsByUser[rec.client.id] || 0;
        });

        Object.values(map).forEach(rec => {
            rec.sale_point = saleToUser[rec.client.id] || 0;
        });
        return Object.values(map);
    }, [selectedGameResults, claimsByUser, saleToUser, unClaimsByUser]);

    const filtered = aggregated.filter(rec => {
        const cAt = rec.created_at
            ? new Date(rec.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '';
        return (
            rec.bet.toString().includes(columnFilters.bet) &&
            rec.win_value.toString().includes(columnFilters.win_value) &&
            cAt.toLowerCase().includes(columnFilters.created_at.toLowerCase())
        );
    });

    const sorted = useMemo(() => {
        if (!sortConfig.field) return filtered;
        return [...filtered].sort((a, b) => {
            let aV = a[sortConfig.field];
            let bV = b[sortConfig.field];
            if (['bet', 'win_value', 'claim_point'].includes(sortConfig.field)) {
                aV = +aV;
                bV = +bV;
            }
            if (sortConfig.field === 'created_at') {
                aV = new Date(aV);
                bV = new Date(bV);
            }
            if (aV < bV) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aV > bV) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortConfig]);

    const totalPages = Math.ceil(sorted.length / rowsPerPage);
    const pageStart = (currentPage - 1) * rowsPerPage;
    const pageData = sorted.slice(pageStart, pageStart + rowsPerPage);

    // Calculate summary totals for current page (including negatives correctly)
    const toPaisa = x => Math.round((x + Number.EPSILON) * 100);
    const toRupee = p => p / 100;

    const totals = useMemo(() => {
        let totalBetC = 0;
        let totalWinC = 0;
        let totalSaleC = 0;
        let totalPointsC = 0;
        let totalClaimC = 0;
        let totalUnClaimC = 0;
        let grossPointC = 0;
        let netPointC = 0;
        let revenueC = 0;

        pageData.forEach(rec => {
            const betC = toPaisa(parseFloat(betByUser[rec.client.id] ?? 0));
            const saleC = toPaisa(parseFloat(rec.sale_point));
            const winC = toPaisa(parseFloat(rec.win_value));
            const pointC = toPaisa(parseFloat(rec.client.points));
            const pointsC = toPaisa(parseFloat(rec.client.points + rec.claim_point + rec.unclaim_point));
            const claimC = toPaisa(parseFloat(rec.claim_point || 0));
            const unclaimC = toPaisa(parseFloat(rec.unclaim_point || 0));

            let diffC = 0, commC = 0, netC = 0;

            if (userRoles[0] === 'Retailer') {
                diffC = saleC - pointsC;
                commC = Math.round(betC * commission);
                netC = diffC - commC;

            } else if (userRoles[0] === 'Stockit') {
                const retdiffC = saleC - pointsC;
                const gstPercent = parseFloat(rec?.client?.retailer?.gstin_number) || 0;
                const retC = Math.round(betC * (gstPercent / 100));
                const retnetC = retdiffC - retC;

                diffC = retnetC;
                commC = Math.round(diffC * commission);
                netC = diffC - commC;

            } else {
                const retdiffC = saleC - pointsC;
                const gstR = parseFloat(rec?.client?.retailer?.gstin_number) || 0;
                const retC1 = Math.round(betC * (gstR / 100));
                const retnetC = retdiffC - retC1;

                const stkP = parseFloat(rec?.client?.stockit?.gstin_number) || 0;
                const stkC = Math.round(retnetC * (stkP / 100));
                const stkNetC = retnetC - stkC;

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
            totalUnClaimC: toRupee(totalUnClaimC),
            grossPoint: toRupee(grossPointC),
            netPoint: toRupee(netPointC),
            revenue: toRupee(revenueC),
        };
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
                    {/* ... filters, tabs, summary ... */}
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
                                    route('retailer.turnoverHistory'),
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
                                        Sale Point<SortIndicator field="bet" />
                                    </th>
                                    <th
                                        className="p-2 border-b cursor-pointer"
                                        onClick={() =>
                                            setSortConfig(f => ({ field: 'win_value', direction: f.direction === 'asc' ? 'desc' : 'asc' }))
                                        }
                                    >
                                        Win Point<SortIndicator field="win_value" />
                                    </th>

                                    <th className="p-2 border-b">End Point</th>
                                    <th className="p-2 border-b">Claim Point</th>
                                    <th className="p-2 border-b">Unclaim Point</th>
                                    <th className="p-2 border-b">Gross Point</th>
                                    <th className="p-2 border-b">Net Point</th>
                                    <th className="p-2 border-b">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-gray-100 font-semibold text-sm">
                                    <td className="p-2 border-b">–</td>
                                    <td className="p-2 border-b">Total</td>
                                    <td className="p-2 border-b">{totals.totalBet.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.totalWin.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.totalPoints.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.totalClaim.toFixed(2)}</td>
                                    <td className="p-2 border-b">{(totals.totalUnClaimC).toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.grossPoint.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.netPoint.toFixed(2)}</td>
                                    <td className="p-2 border-b">{totals.revenue.toFixed(2)}</td>
                                </tr>
                                {pageData.length ? (
                                    pageData.map(rec => {
                                        const bet = parseFloat(betByUser[rec.client.id]);
                                        const points = parseFloat(rec.claim_point + rec.unclaim_point);
                                        let diff = 0;
                                        let commAmount = 0;
                                        let netamount = 0;

                                        if (userRoles[0] === 'Retailer') {
                                            diff = bet - points;
                                            commAmount = (bet * commission).toFixed(2);
                                            netamount = (diff - parseFloat(commAmount)).toFixed(2);
                                        } else if (userRoles[0] === 'Stockit') {
                                            const retdiff = bet - points;
                                            const gstPercent = parseFloat(rec?.client?.retailer?.gstin_number) || 0;
                                            const retcommAmount = (bet * (gstPercent / 100)).toFixed(2);
                                            const retnetamount = retdiff - parseFloat(retcommAmount);
                                            diff = retnetamount;
                                            commAmount = (diff * commission).toFixed(2);
                                            netamount = (diff - parseFloat(commAmount)).toFixed(2);
                                        } else {
                                            const retdiff = bet - points;
                                            const gstPercent = parseFloat(rec?.client?.retailer?.gstin_number) || 0;
                                            const retcommAmount = (bet * (gstPercent / 100)).toFixed(2);
                                            const retnetamount = retdiff - parseFloat(retcommAmount);
                                            const stkdiff = retnetamount;
                                            const stkPercent = parseFloat(rec?.client?.stockit?.gstin_number) || 0;
                                            const stkcommAmount = (stkdiff * (stkPercent / 100)).toFixed(2);
                                            const stknetamount = stkdiff - parseFloat(stkcommAmount);
                                            diff = stknetamount;
                                            commAmount = diff.toFixed(2);
                                            netamount = parseFloat(commAmount).toFixed(2);
                                        }

                                        return (
                                            <tr key={rec.client.id} className="hover:bg-gray-50 text-sm">
                                                <td className="p-2 border-b">{rec.client.username}</td>
                                                <td className="p-2 border-b">
                                                    {rec.client.first_name} {rec.client.last_name}
                                                </td>
                                                <td className="p-2 border-b">  {betByUser[rec.client.id] ?? 0}</td>
                                                <td className="p-2 border-b">{rec.win_value}</td>
                                                <td className="p-2 border-b">{rec.client.points}</td>
                                                <td className="p-2 border-b">{rec.claim_point}</td>
                                                <td className="p-2 border-b">{rec.unclaim_point}</td>
                                                <td className="p-2 border-b">{(diff).toFixed(2)}</td>
                                                <td className="p-2 border-b">{netamount}</td>
                                                <td className="p-2 border-b">{commAmount}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="p-2 text-center text-sm">
                                            No records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {/* Pagination */}
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
