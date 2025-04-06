import React from "react";

function PaginationClassic({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  // Calculate total number of pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Ensure currentPage stays within range
  const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;
  const prevPage = currentPage > 1 ? currentPage - 1 : 1;

  // Display range of items (e.g., 1-10, 11-20, 21-30, etc.)
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem =
    currentPage * itemsPerPage > totalItems
      ? totalItems
      : currentPage * itemsPerPage;

  // Handle items per page change
  function handleItemsPerPageChange(value) {
    onItemsPerPageChange(value);
    onPageChange(1); // Reset to first page when changing items per page
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-1">
      <nav
        className="mb-4 sm:mb-0 sm:order-1"
        role="navigation"
        aria-label="Navigation"
      >
        <ul className="flex justify-center">
          {/* Previous Button */}
          <li className="ml-3 first:ml-0">
            <button
              onClick={() => onPageChange(prevPage)}
              className={
                currentPage === 1
                  ? "btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-300 dark:text-gray-600"
                  : "btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              }
              disabled={currentPage === 1}
            >
              &lt;- Previous
            </button>
          </li>
          {/* Next Buton */}
          <li className="ml-3 first:ml-0">
            <button
              onClick={() => onPageChange(nextPage)}
              className={
                currentPage !== totalPages
                  ? "btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                  : "btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-300 dark:text-gray-600"
              }
              disabled={currentPage === totalPages}
            >
              Next -&gt;
            </button>
          </li>
        </ul>
      </nav>

      {/* Items per page Selector */}
      <div className="flex items-center justify-center mb-4 sm:mb-0">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
          Show
        </span>
        <select
          className="form-select w-18 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg shadow-sm text-sm text-gray-500 dark:text-gray-400"
          value={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(e.target.value)}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          results
        </span>
      </div>

      {/* Show range of results */}
      <div className="text-sm text-gray-500 text-center sm:text-left">
        Showing{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {startItem}
        </span>{" "}
        to{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {endItem}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {totalItems}
        </span>{" "}
        results
      </div>
    </div>
  );
}

export default PaginationClassic;
