import React, {useState, useEffect} from "react";
import AppsTableItem from "./AppsTableItem";
import {useNavigate} from "react-router-dom";

/* AppsTable component */
function AppsTable({
  apps,
  onToggleSelectAll,
  onToggleSelect,
  selectedItems,
  totalApps,
  handleClick,
}) {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedApps, setCheckedApps] = useState([]);

  const navigate = useNavigate();

  /* set select all and checked apps */
  useEffect(() => {
    setSelectAll(apps.length > 0 && selectedItems.length === apps.length);
    setCheckedApps(selectedItems);
  }, [apps, selectedItems]);

  /* handle select */
  function handleSelect(e) {
    const id = Number(e.target.id);
    onToggleSelect(id);
  }

  /* handle select all */
  function handleSelectAll() {
    onToggleSelectAll();
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl relative">
      <header className="px-5 py-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          All Applications{" "}
          <span className="text-gray-400 dark:text-gray-500 font-medium">
            {totalApps}
          </span>
        </h2>
      </header>
      <div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-300">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
                  <div className="flex items-center">
                    <label className="inline-flex">
                      <span className="sr-only">Select all</span>
                      <input
                        className="form-checkbox"
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        disabled={apps.length === 0}
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
              {apps.length > 0 ? (
                apps.map((app) => (
                  <AppsTableItem
                    key={app.id}
                    id={app.id}
                    name={app.name}
                    icon={app.icon}
                    url={app.url}
                    category={app.category}
                    description={app.description}
                    handleSelect={handleSelect}
                    handleClick={() => handleClick(app.id)}
                    isChecked={checkedApps.includes(app.id)}
                    isAlternate={apps.indexOf(app) % 2 !== 0}
                  />
                ))
              ) : (
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

export default AppsTable;
