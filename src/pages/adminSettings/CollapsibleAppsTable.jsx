import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {icons} from "../../assets/icons";
import appContext from "../../context/AppContext";

function CollapsibleAppsTable({
  filteredApps,
  selectedItems,
  onToggleSelect,
  expandedCategories,
  setExpandedCategories,
}) {
  const navigate = useNavigate();

  // Categories for the dropdown
  const categories = [
    {id: 1, name: "Inventory"},
    {id: 2, name: "Productivity"},
  ];

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === Number(categoryId));
    return category ? category.name : "";
  };

  // Group apps by category
  const groupedApps = filteredApps.reduce((acc, app) => {
    const categoryName = getCategoryName(app.category);
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(app);
    return acc;
  }, {});

  // Sort categories alphabetically
  const sortedGroupedApps = Object.keys(groupedApps)
    .sort()
    .reduce((acc, key) => {
      acc[key] = groupedApps[key];
      return acc;
    }, {});

  // Get all visible apps (from expanded categories)
  const visibleApps = Object.entries(groupedApps).reduce(
    (acc, [category, apps]) => {
      if (
        Array.isArray(expandedCategories) &&
        expandedCategories.includes(category)
      ) {
        return [...acc, ...apps];
      }
      return acc;
    },
    []
  );

  // Check if all visible apps are selected
  const allVisibleSelected =
    visibleApps.length > 0 &&
    visibleApps.every((app) => selectedItems.includes(app.id));

  /* Handle category expansion */
  const handleCategoryExpand = (category) => {
    const currentExpanded = Array.isArray(expandedCategories)
      ? expandedCategories
      : [];

    if (currentExpanded.includes(category)) {
      setExpandedCategories(currentExpanded.filter((cat) => cat !== category));
    } else {
      setExpandedCategories([...currentExpanded, category]);
    }
  };

  /* Handle select all visible */
  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      onToggleSelect(
        visibleApps.map((app) => app.id),
        false
      );
    } else {
      onToggleSelect(
        visibleApps.map((app) => app.id),
        true
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl relative">
      <header className="px-5 py-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          All Applications{" "}
          <span className="text-gray-400 dark:text-gray-500 font-medium">
            {filteredApps.length}
          </span>
        </h2>
      </header>
      <div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-300">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 border-t border-b border-gray-100 dark:border-gray-700/60">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
                  <div className="flex items-center">
                    <label className="inline-flex">
                      <span className="sr-only">Select all</span>
                      <input
                        className="form-checkbox"
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={handleSelectAllVisible}
                        disabled={visibleApps.length === 0}
                      />
                    </label>
                  </div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Name</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Icon</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">URL</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Category</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Description</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {Object.entries(sortedGroupedApps).map(([category, apps]) => (
                <React.Fragment key={category}>
                  {/* Category header */}
                  <tr className="bg-gray-200/80 dark:bg-gray-900/20 cursor-pointer hover:bg-gray-300/80 dark:hover:bg-gray-800/70">
                    <td
                      colSpan="6"
                      className="px-2 first:pl-5 last:pr-5 py-3"
                      onClick={() => handleCategoryExpand(category)}
                    >
                      <div className="flex items-center">
                        <svg
                          className={`w-4 h-4 mr-2 fill-current text-gray-500 dark:text-gray-400 ${
                            Array.isArray(expandedCategories) &&
                            expandedCategories.includes(category)
                              ? "transform rotate-90"
                              : ""
                          }`}
                          viewBox="0 0 16 16"
                        >
                          <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z" />
                        </svg>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          {category}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium ml-2">
                          ({apps.length})
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Category apps */}
                  {Array.isArray(expandedCategories) &&
                    expandedCategories.includes(category) &&
                    apps.map((app) => (
                      <tr
                        key={app.id}
                        className={`${
                          apps.indexOf(app) % 2 === 0
                            ? "bg-white dark:bg-gray-700/20"
                            : "bg-gray-50/50 dark:bg-gray-700/10"
                        } hover:bg-gray-100 dark:hover:bg-gray-700/50`}
                      >
                        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
                          <div className="flex items-center">
                            <label className="inline-flex">
                              <span className="sr-only">Select</span>
                              <input
                                className="form-checkbox"
                                type="checkbox"
                                checked={selectedItems.includes(app.id)}
                                onChange={() => onToggleSelect(app.id)}
                              />
                            </label>
                          </div>
                        </td>
                        <td
                          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/admin/apps/${app.id}`)}
                        >
                          <div className="font-medium text-gray-800 dark:text-gray-100 ">
                            {app.name}
                          </div>
                        </td>
                        <td
                          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/admin/apps/${app.id}`)}
                        >
                          <div className="w-6 h-auto shrink-0 mr-2 sm:mr-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-6 h-6 text-gray-600 dark:text-gray-300"
                            >
                              <path d={icons[app.icon].svgPath} />
                            </svg>
                          </div>
                        </td>
                        <td
                          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/admin/apps/${app.id}`)}
                        >
                          <div className="text-left">{app.url}</div>
                        </td>
                        <td
                          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/admin/apps/${app.id}`)}
                        >
                          <div className="text-left text-gray-600 dark:text-gray-300 ">
                            {getCategoryName(app.category)}
                          </div>
                        </td>
                        <td
                          className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/admin/apps/${app.id}`)}
                        >
                          <div className="text-left max-w-md truncate">
                            {app.description}
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
              {Object.keys(sortedGroupedApps).length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400"
                  >
                    <div className="text-center w-full">No apps found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CollapsibleAppsTable;
