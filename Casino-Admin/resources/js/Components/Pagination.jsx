// Pagination.jsx
import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  setCurrentPage,
}) => {
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-300">
      {/* Rows Per Page Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-2 py-1 text-sm min-w-20 focus:outline-none focus:border-red-500"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-4">
        {/* Previous Button */}
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-white text-sm ${
            currentPage === 1
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red hover:bg-red-700'
          }`}
        >
          Previous
        </button>

        {/* Page Info */}
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next Button */}
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-white text-sm ${
            currentPage === totalPages
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red hover:bg-red'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
