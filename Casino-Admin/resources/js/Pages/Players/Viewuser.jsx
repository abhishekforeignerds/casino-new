import React, { useState, useMemo } from "react";
// import { usePage } from '@inertiajs/react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';

const View = ({ gameResults }) => {
    // Convert the gameResults (grouped by game_id) object into an array.
    const gameEntries = Object.entries(gameResults);

    // Sort game groups: the group with the most recent created_at (across its records) appears first.
    const sortedGameEntries = gameEntries.sort(([, recordsA], [, recordsB]) => {
        const latestA = recordsA.reduce(
            (max, record) => new Date(record.created_at) > max ? new Date(record.created_at) : max,
            new Date(0)
        );
        const latestB = recordsB.reduce(
            (max, record) => new Date(record.created_at) > max ? new Date(record.created_at) : max,
            new Date(0)
        );
        return latestB - latestA;
    });

    // Global filters & sort configuration.
    const [selectedFilter, setSelectedFilter] = useState("today");
    const [columnFilters, setColumnFilters] = useState({
        winning_number: "",
        lose_number: "",
        bet: "",
        win_value: "",
        created_at: ""
    });
    const [sortConfig, setSortConfig] = useState({ field: "win_value", direction: "desc" });
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const rowsPerPageOptions = [20, 50, 100, 200, 500];

    // Maintain individual pagination states for each game table.
    // Use a state object where keys are game IDs and values are the current page.
    const [paginationStates, setPaginationStates] = useState({});

    // Handler for updating per-game current page
    const goToPage = (gameId, page, totalPages) => {
        if (page >= 1 && page <= totalPages) {
            setPaginationStates(prev => ({
                ...prev,
                [gameId]: page,
            }));
        }
    };

    // Global handler for column filter changes.
    const handleFilterChange = (e, field) => {
        setColumnFilters({
            ...columnFilters,
            [field]: e.target.value
        });
        // Reset all pagination states to page 1.
        setPaginationStates({});
    };

    // Global sorting handler.
    const handleSort = (field) => {
        setSortConfig(prev => {
            if (prev.field === field) {
                return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
            }
            return { field, direction: "asc" };
        });
        // Reset pagination if needed.
        setPaginationStates({});
    };

    // Helper component to show sort indicators.
    const SortIndicator = ({ field }) => {
        if (sortConfig.field !== field) return null;
        return sortConfig.direction === "asc" ? " ↑" : " ↓";
    };

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Recent Game Results
                </h2>
            }
        >
            <Head title="Players Game Results" />
            <div className="py-12">
                {/* Global filter panel */}
                <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto w-[80%] ml-auto my-8">

                    <div className="flex justify-between items-center mb-4 flex-wrap">
                        <h2 className="text-lg font-semibold">Recent Game Results</h2>
                        <select
                            className="border border-gray-300 rounded pe-8 py-1 text-sm"
                            value={selectedFilter}
                            onChange={(e) => { setSelectedFilter(e.target.value); setPaginationStates({}); }}
                        >
                            {filterOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    {/* Column filters */}
                    <div className="grid grid-cols-5 gap-2">

                        <input
                            type="text"
                            value={columnFilters.bet}
                            onChange={(e) => handleFilterChange(e, 'bet')}
                            placeholder="Bet"
                            className="w-full border border-gray-300 rounded p-1 text-xs"
                        />
                        <input
                            type="text"
                            value={columnFilters.win_value}
                            onChange={(e) => handleFilterChange(e, 'win_value')}
                            placeholder="Win value"
                            className="w-full border border-gray-300 rounded p-1 text-xs"
                        />
                        <input
                            type="text"
                            value={columnFilters.created_at}
                            onChange={(e) => handleFilterChange(e, 'created_at')}
                            placeholder="Created at"
                            className="w-full border border-gray-300 rounded p-1 text-xs"
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {sortedGameEntries.map(([gameId, records]) => {
                        // For each game group, apply global date filter and column filters.
                        const filteredRecords = records.filter(record => {
                            const winningMatch = (record.winning_number ?? "")
                                .toString()
                                .toLowerCase()
                                .includes(columnFilters.winning_number.toLowerCase());
                            const loseMatch = (record.lose_number ?? "")
                                .toString()
                                .toLowerCase()
                                .includes(columnFilters.lose_number.toLowerCase());
                            const betMatch = (record.bet ?? "")
                                .toString()
                                .toLowerCase()
                                .includes(columnFilters.bet.toLowerCase());
                            const winValueMatch = (record.win_value ?? "")
                                .toString()
                                .toLowerCase()
                                .includes(columnFilters.win_value.toLowerCase());
                            const createdAtStr = record.created_at
                                ? new Date(record.created_at).toLocaleDateString("en-GB", {
                                    day: "2-digit", month: "short", year: "numeric"
                                })
                                : "";
                            const createdAtMatch = createdAtStr.toLowerCase()
                                .includes(columnFilters.created_at.toLowerCase());
                            // Check created_at filter if provided.
                            const dateValid = record.created_at ? filterByDate(record.created_at, selectedFilter) : true;
                            return winningMatch && loseMatch && betMatch && winValueMatch && createdAtMatch && dateValid;
                        });

                        // Apply sorting to the filtered records.
                        const sortedRecords = useMemo(() => {
                            if (!sortConfig.field) return filteredRecords;
                            return filteredRecords.slice().sort((a, b) => {
                                let aValue = a[sortConfig.field];
                                let bValue = b[sortConfig.field];
                                if (sortConfig.field === "bet" || sortConfig.field === "win_value") {
                                    aValue = Number(aValue);
                                    bValue = Number(bValue);
                                }
                                if (sortConfig.field === "created_at") {
                                    aValue = new Date(aValue);
                                    bValue = new Date(bValue);
                                }
                                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
                                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
                                return 0;
                            });
                        }, [filteredRecords, sortConfig]);

                        // Determine current page for this game.
                        const currentPage = paginationStates[gameId] || 1;
                        const totalPages = Math.ceil(sortedRecords.length / rowsPerPage);
                        const startIndex = (currentPage - 1) * rowsPerPage;
                        const paginatedResults = sortedRecords.slice(startIndex, startIndex + rowsPerPage);

                        // Aggregated summary calculations.
                        const totalBet = filteredRecords.reduce((sum, record) => sum + Number(record.bet), 0);
                        const totalWinValue = filteredRecords.reduce((sum, record) => sum + Number(record.win_value), 0);
                        // Use the first record to fetch the game name.
                        const gameName = filteredRecords[0]?.games?.game_name || `Game ${gameId}`;

                        return (
                            <div
                                key={gameId}
                                className="bg-white shadow-md rounded-lg p-6 overflow-x-auto w-[80%] ml-auto"
                            >
                                {/* Top header for the table */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Name: {gameName}</h3>
                                    <h3 className="text-lg font-bold">Player Name</h3>
                                </div>

                                {/* Summary Section */}
                                <div className="mb-4 p-4 bg-gray-50 rounded border">
                                    <p className="text-sm">
                                        <span className="font-medium">Total Bet:</span> {totalBet}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium">Total Win Value:</span> {totalWinValue}
                                    </p>
                                </div>

                                {/* Table for this game */}
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-sm text-red">
                                            <th
                                                className="p-2 border-b cursor-pointer"
                                                onClick={() => handleSort("game_name")}
                                            >
                                                Name<SortIndicator field="game_name" />
                                            </th>
                                            <th className="p-2 border-b">Player Name</th>
                                            <th
                                                className="p-2 border-b cursor-pointer"
                                                onClick={() => handleSort("bet")}
                                            >
                                                Bet<SortIndicator field="bet" />
                                            </th>
                                            <th
                                                className="p-2 border-b cursor-pointer"
                                                onClick={() => handleSort("win_value")}
                                            >
                                                Win Value<SortIndicator field="win_value" />
                                            </th>
                                            <th
                                                className="p-2 border-b cursor-pointer"
                                                onClick={() => handleSort("created_at")}
                                            >
                                                Created At<SortIndicator field="created_at" />
                                            </th>
                                            <th className="p-2 border-b">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedResults.length ? (
                                            paginatedResults.map((record, index) => (
                                                <tr key={index} className="hover:bg-gray-50 text-sm">
                                                    <td className="p-2 border-b">
                                                        {record.games?.game_name || `Game ${gameId}`}
                                                    </td>
                                                    <td className="p-2 border-b">
                                                        {record.client?.first_name || "---"} {record.client?.last_name || "---"}
                                                    </td>
                                                    <td className="p-2 border-b">{record.bet ?? "N/A"}</td>
                                                    <td className="p-2 border-b">{record.win_value ?? 0}</td>
                                                    <td className="p-2 border-b">
                                                        {record.created_at ? new Date(record.created_at).toLocaleDateString("en-GB", {
                                                            day: "2-digit", month: "short", year: "numeric"
                                                        }) : 'N/A'}
                                                    </td>
                                                    <td className="p-2 border-b text-gray-600 cursor-pointer">
                                                        {/* Action buttons/links can be added here */}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="p-2 text-center text-sm">
                                                    No records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination controls for this game table */}
                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        <button
                                            onClick={() => goToPage(gameId, currentPage - 1, totalPages)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border rounded mr-2"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => goToPage(gameId, currentPage + 1, totalPages)}
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
                                            className="border border-gray-300 rounded py-1 text-sm"
                                            value={rowsPerPage}
                                            onChange={(e) => {
                                                setRowsPerPage(Number(e.target.value));
                                                // Reset pagination for this game on rows change.
                                                setPaginationStates(prev => ({
                                                    ...prev,
                                                    [gameId]: 1,
                                                }));
                                            }}
                                        >
                                            {rowsPerPageOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option} rows
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default View;
