import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import React, { useState } from "react";
import { Link, usePage } from '@inertiajs/react';
import { filterByDate, filterOptions } from '@/Components/FilterUtils';

const RecentGameResults = ({ gameResults }) => {
  const gameIds = Object.keys(gameResults);
  const [selectedGame, setSelectedGame] = useState(gameIds.length ? gameIds[0] : null);
  const selectedGameName = selectedGame && gameResults[selectedGame]
    ? gameResults[selectedGame].game_name
    : 'Select Game';
  const [selectedFilter, setSelectedFilter] = useState("today");
  const [columnFilters, setColumnFilters] = useState({
    winning_number: "",
    lose_number: "",
    bet: "",
    win_value: "",
    created_at: ""
  });
  const [sortConfig, setSortConfig] = useState({ field: "win_value", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const rowsPerPageOptions = [20, 50, 100, 200, 500];

  const selectedGameResults = selectedGame
    ? gameResults[selectedGame].filter(record =>
      record.created_at ? filterByDate(record.created_at, selectedFilter) : true
    )
    : [];

  // 1️⃣ AGGREGATE BY PLAYER
  const aggregatedResults = React.useMemo(() => {
    const map = {};
    selectedGameResults.forEach(record => {
      const pid = record.client.id;
      if (!map[pid]) {
        map[pid] = {
          client: record.client,
          bet: 0,
          win_value: 0,
          created_at: record.created_at,
        };
      }
      map[pid].bet += Number(record.bet);
      map[pid].win_value += Number(record.win_value);
    });
    return Object.values(map);
  }, [selectedGameResults]);

  // Apply column filters on aggregated results
  const filteredResults = aggregatedResults.filter(record => {
    const betMatch = record.bet.toString().toLowerCase().includes(columnFilters.bet.toLowerCase());
    const winValueMatch = record.win_value.toString().toLowerCase().includes(columnFilters.win_value.toLowerCase());
    const createdAtStr = record.created_at
      ? new Date(record.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "";
    const createdAtMatch = createdAtStr.toLowerCase().includes(columnFilters.created_at.toLowerCase());
    return betMatch && winValueMatch && createdAtMatch;
  });

  // 2️⃣ APPLY SORTING to the aggregatedResults
  const sortedResults = React.useMemo(() => {
    if (!sortConfig.field) return filteredResults;
    return filteredResults.slice().sort((a, b) => {
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
  }, [filteredResults, sortConfig]);

  const totalPages = Math.ceil(sortedResults.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedResults = sortedResults.slice(startIndex, startIndex + rowsPerPage);

  const handleFilterChange = (e, field) => {
    setColumnFilters({
      ...columnFilters,
      [field]: e.target.value
    });
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const totalBet = selectedGameResults.reduce((sum, record) => sum + Number(record.bet), 0);
  const totalWinValue = selectedGameResults.reduce((sum, record) => sum + Number(record.win_value), 0);

  const { auth } = usePage().props;
  const userRoles = auth?.user?.roles || [];
  const alluserdetails = auth?.user?.userall || [];
  const commission = (alluserdetails[0]['gstin_number']) / 100 || 0;



  const SortIndicator = ({ field }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 min-w-[100%] overflow-x-auto">
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <h2 className="text-lg font-semibold">Recent Game Results</h2>
        <select
          className="border border-gray-300 rounded pe-8 py-1 text-sm"
          value={selectedFilter}
          onChange={(e) => { setSelectedFilter(e.target.value); setCurrentPage(1); }}
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {gameIds.map(gameId => {
          const gameName = gameResults[gameId]?.game_name || `Game ${gameId}`;
          return (
            <button
              key={gameId}
              className={`px-3 py-2 rounded text-sm ${selectedGame === gameId ? "bg-red text-white" : "bg-gray-100 text-gray-600"}`}
              onClick={() => { setSelectedGame(gameId); setCurrentPage(1); }}
            >{gameName}</button>
          );
        })}
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded border">
        <h3 className="text-md font-bold mb-2">Summary for Game {selectedGame}</h3>
        <p className="text-sm"><span className="font-medium">Total Bet:</span> {totalBet}</p>
        <p className="text-sm"><span className="font-medium">Total Win Value:</span> {totalWinValue}</p>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-sm text-red">
            <th className="p-2 border-b">Game name</th>
            <th className="p-2 border-b">Username</th>
            <th className="p-2 border-b">Player Name</th>
            <th className="p-2 border-b">Parent </th>
            <th className="p-2 border-b">Balance </th>
            <th className="p-2 border-b cursor-pointer" onClick={() => handleSort("bet")}>Total Bet<SortIndicator field="bet" /></th>
            <th className="p-2 border-b cursor-pointer" onClick={() => handleSort("win_value")}>Total Won<SortIndicator field="win_value" /></th>
            <th className="p-2 border-b">Casino Profit</th>
            <th className="p-2 border-b">NTP</th>
            {/* <th className="p-2 border-b cursor-pointer" onClick={() => handleSort("created_at")}><SortIndicator field="created_at" /></th> */}
            <th className="p-2 border-b">Action </th>
          </tr>
          <tr className="text-xs">
            <th className="p-2 border-b"></th>
            <th className="p-2 border-b"></th>
            <th className="p-2 border-b">
              <input type="text" value={columnFilters.bet} onChange={e => handleFilterChange(e, 'bet')} placeholder="Search" className="w-full border border-gray-300 rounded p-1 text-xs" />
            </th>
            <th className="p-2 border-b"></th>
            <th className="p-2 border-b"></th>
            <th className="p-2 border-b">
              <input type="text" value={columnFilters.win_value} onChange={e => handleFilterChange(e, 'win_value')} placeholder="Search" className="w-full border border-gray-300 rounded p-1 text-xs" />
            </th>
            <th className="p-2 border-b"></th>
            <th className="p-2 border-b"></th>
            <th className="p-2 border-b">
              <input type="text" value={columnFilters.created_at} onChange={e => handleFilterChange(e, 'created_at')} placeholder="Search" className="w-full border border-gray-300 rounded p-1 text-xs" />
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedResults.length ? paginatedResults.map(record => (
            <tr key={record.client.id} className="hover:bg-gray-50 text-sm">
              <td className="p-2 border-b">Poker Roulette </td>
              <td className="p-2 border-b">{record.client.username} </td>
              <td className="p-2 border-b">{record.client.first_name} {record.client.last_name}</td>
              <td className="p-2 border-b">
                {record.client.retailer
                  ? `${record.client.retailer.name}`
                  : '—'}
              </td>
              <td className="p-2 border-b">{record.client.points} </td>
              <td className="p-2 border-b">{record.bet}</td>
              <td className="p-2 border-b">{record.win_value}</td>
              <td className="p-2 border-b">{record.bet - record.win_value}</td>
              <td className="p-2 border-b">{(record.bet - record.win_value) * commission}</td>
              {/* <td className="p-2 border-b">{record.created_at ? new Date(record.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : 'N/A'}</td> */}
              <td className="p-2 border-b"></td>
            </tr>
          )) : (
            <tr><td colSpan="4" className="p-2 text-center text-sm">No records found.</td></tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <div>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded mr-2">Previous</button>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border rounded">Next</button>
        </div>
        <div>
          <span className="text-sm mr-2">Page {currentPage} of {totalPages}</span>
          <select className="border border-gray-300 rounded py-1 text-sm" value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            {rowsPerPageOptions.map(opt => <option key={opt} value={opt}>{opt} rows</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default RecentGameResults;
