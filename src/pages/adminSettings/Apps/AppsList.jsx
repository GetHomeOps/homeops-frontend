import React, {useReducer, useEffect, useContext, useMemo} from "react";
import {useNavigate, useLocation} from "react-router-dom";

import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import DropdownButton from "../ListDropdown";
import PaginationClassic from "../../../components/PaginationClassic";
import AppsTable from "../../../partials/apps/AppsTable";
import appContext from "../../../context/AppContext";
import CollapsibleAppsTable from "../../../partials/apps/CollapsibleAppsTable";
import ModalBlank from "../../../components/ModalBlank";
import Banner from "../../../partials/containers/Banner";

import {useTranslation} from "react-i18next";

const initialState = {
  appsList: [],
  selectedItems: [],
  currentPage: 1,
  itemsPerPage: 10,
  searchTerm: "",
  isSubmitting: false,
  dangerModalOpen: false,
  bannerOpen: false,
  bannerType: "success",
  bannerMessage: "",
  filteredApps: [],
  sidebarOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_APPS_LIST":
      return {...state, appsList: action.payload, filteredApps: action.payload};
    case "SET_SELECTED_ITEMS":
      return {...state, selectedItems: action.payload};
    case "SET_CURRENT_PAGE":
      return {...state, currentPage: action.payload};
    case "SET_ITEMS_PER_PAGE":
      return {...state, itemsPerPage: action.payload, currentPage: 1};
    case "SET_SEARCH_TERM":
      return {...state, searchTerm: action.payload};
    case "SET_SUBMITTING":
      return {...state, isSubmitting: action.payload};
    case "SET_DANGER_MODAL":
      return {...state, dangerModalOpen: action.payload};
    case "SET_BANNER":
      return {
        ...state,
        bannerOpen: action.payload.open,
        bannerType: action.payload.type,
        bannerMessage: action.payload.message,
      };
    case "SET_FILTERED_APPS":
      return {...state, filteredApps: action.payload};
    case "SET_SIDEBAR_OPEN":
      return {...state, sidebarOpen: action.payload};
    default:
      return state;
  }
}

// Categories for the dropdown
const CATEGORIES = [
  {id: 1, name: "Inventory"},
  {id: 2, name: "Productivity"},
];

function AppsList() {
  const {
    apps,
    deleteApp,
    updateApp,
    createApp,
    viewMode,
    setViewMode,
    expandedCategories,
    setExpandedCategories,
  } = useContext(appContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  const {t, i18n} = useTranslation();

  // Initialize view mode from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlViewMode = params.get("view");
    if (urlViewMode && (urlViewMode === "filter" || urlViewMode === "group")) {
      setViewMode(urlViewMode);
    }
  }, [location.search]);

  // Initialize appsList when apps change
  useEffect(() => {
    dispatch({type: "SET_APPS_LIST", payload: apps});
  }, [apps]);

  /* Toggles selection of an app. If the app is already selected, it is removed from the selection. If the app is not selected, it is added to the selection. */
  function handleToggleSelection(ids, isSelected) {
    let newSelectedItems;
    if (Array.isArray(ids)) {
      if (isSelected === false) {
        newSelectedItems = state.selectedItems.filter(
          (item) => !ids.includes(item)
        );
      } else {
        newSelectedItems = [...state.selectedItems];
        ids.forEach((id) => {
          if (!newSelectedItems.includes(id)) {
            newSelectedItems.push(id);
          }
        });
      }
    } else {
      const id = ids;
      if (state.selectedItems.includes(id)) {
        newSelectedItems = state.selectedItems.filter((item) => item !== id);
      } else {
        newSelectedItems = [...state.selectedItems, id];
      }
    }
    dispatch({type: "SET_SELECTED_ITEMS", payload: newSelectedItems});
  }

  /* Toggles selection of all apps. If all apps are already selected, it deselects all apps. If all apps are not selected, it selects all apps. */
  function handleToggleSelectAll() {
    // Get IDs of all visible apps in the current page
    const currentAppIds = currentApps.map((app) => app.id);

    // Check if all current visible apps are selected
    const allCurrentSelected = currentAppIds.every((id) =>
      state.selectedItems.includes(id)
    );

    if (allCurrentSelected) {
      // If all current apps are selected, remove them from selection
      const newSelectedItems = state.selectedItems.filter(
        (id) => !currentAppIds.includes(id)
      );
      dispatch({type: "SET_SELECTED_ITEMS", payload: newSelectedItems});
    } else {
      // If not all current apps are selected, add the unselected ones
      const newSelectedItems = [...state.selectedItems];
      currentAppIds.forEach((id) => {
        if (!newSelectedItems.includes(id)) {
          newSelectedItems.push(id);
        }
      });
      dispatch({type: "SET_SELECTED_ITEMS", payload: newSelectedItems});
    }

    // if (state.selectedItems.length === state.appsList.length) {
    //   dispatch({type: "SET_SELECTED_ITEMS", payload: []});
    // } else {
    //   dispatch({
    //     type: "SET_SELECTED_ITEMS",
    //     payload: state.appsList.map((app) => app.id),
    //   });
    // }
  }

  /* Handles page change */
  function handlePageChange(page) {
    dispatch({type: "SET_CURRENT_PAGE", payload: page});
  }

  // Get category name from ID
  const getCategoryName = useMemo(() => {
    return (categoryId) => {
      const category = CATEGORIES.find((cat) => cat.id === Number(categoryId));
      return category ? category.name : "";
    };
  }, []);

  // Memoize filtered apps
  const filteredApps = useMemo(() => {
    if (!state.appsList || state.appsList.length === 0) return [];

    return state.appsList.filter((app) => {
      const searchLower = state.searchTerm.toLowerCase();
      const categoryName = getCategoryName(app.category)?.toLowerCase() || "";
      return (
        app.name.toLowerCase().includes(searchLower) ||
        categoryName.includes(searchLower)
      );
    });
  }, [state.searchTerm, state.appsList]);

  useEffect(() => {
    dispatch({type: "SET_FILTERED_APPS", payload: filteredApps});
  }, [filteredApps]);

  // Get unique categories from filtered apps
  const uniqueCategories = useMemo(() => {
    return [...new Set(state.filteredApps.map((app) => app.category))].sort();
  }, [state.filteredApps]);

  // Group apps by category
  const groupedApps = useMemo(() => {
    return state.filteredApps.reduce((acc, app) => {
      const categoryName = getCategoryName(app.category);
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(app);
      return acc;
    }, {});
  }, [state.filteredApps]);

  // Sort categories alphabetically
  const sortedGroupedApps = useMemo(() => {
    return Object.keys(groupedApps)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groupedApps[key];
        return acc;
      }, {});
  }, [groupedApps]);

  // Memoize current apps for pagination
  const currentApps = useMemo(() => {
    const indexOfLastApp = state.currentPage * state.itemsPerPage;
    const indexOfFirstApp = indexOfLastApp - state.itemsPerPage;
    return state.filteredApps.slice(indexOfFirstApp, indexOfLastApp);
  }, [state.currentPage, state.itemsPerPage, state.filteredApps]);

  // Memoize visible apps
  const visibleApps = useMemo(() => {
    return Object.entries(groupedApps).reduce((acc, [category, apps]) => {
      if (expandedCategories.includes(category)) {
        return [...acc, ...apps];
      }
      return acc;
    }, []);
  }, [groupedApps, expandedCategories]);

  // Memoize allVisibleSelected
  const allVisibleSelected = useMemo(() => {
    return (
      visibleApps.length > 0 &&
      visibleApps.every((app) => state.selectedItems.includes(app.id))
    );
  }, [visibleApps, state.selectedItems]);

  // Handle items per page change
  function handleItemsPerPageChange(value) {
    dispatch({type: "SET_ITEMS_PER_PAGE", payload: Number(value)});
  }

  // Reset current page when filtered apps change
  useEffect(() => {
    dispatch({type: "SET_CURRENT_PAGE", payload: 1});
  }, [state.filteredApps.length]);

  // Handle banner timeout
  useEffect(() => {
    if (state.bannerOpen) {
      const timer = setTimeout(() => {
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: false,
            type: state.bannerType,
            message: state.bannerMessage,
          },
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.bannerOpen, state.bannerType, state.bannerMessage]);

  /* Handles delete button click */
  function handleDeleteClick() {
    if (state.selectedItems.length === 0) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: "Please select at least one app to delete",
        },
      });
      return;
    }
    dispatch({type: "SET_DANGER_MODAL", payload: true});
  }

  /* Handles bulk duplication of selected apps */
  async function handleDuplicate() {
    if (state.selectedItems.length === 0) return;

    dispatch({type: "SET_SUBMITTING", payload: true});
    let duplicatedCount = 0;
    try {
      // Duplicate each selected app
      for (const appId of state.selectedItems) {
        const appToDuplicate = apps.find((app) => app.id === appId);
        if (appToDuplicate) {
          const appData = {
            name: `${appToDuplicate.name} (Copy)`,
            icon: appToDuplicate.icon,
            url: `${appToDuplicate.url}-copy`,
            category: appToDuplicate.category,
            description: appToDuplicate.description,
          };
          await createApp(appData);
          duplicatedCount++;
        }
      }

      // Clear selection after successful duplication
      dispatch({type: "SET_SELECTED_ITEMS", payload: []});

      // Show success message
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "success",
          message: `${duplicatedCount} app${
            duplicatedCount !== 1 ? "s" : ""
          } duplicated successfully`,
        },
      });
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error duplicating apps. Error: ${error}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  /* Handles bulk deletion of selected apps */
  async function handleDelete() {
    if (state.selectedItems.length === 0) return;

    // Close modal immediately when Accept is clicked
    dispatch({type: "SET_DANGER_MODAL", payload: false});

    dispatch({type: "SET_SUBMITTING", payload: true});
    try {
      // Delete each selected app
      for (const appId of state.selectedItems) {
        await deleteApp(appId);
      }

      // Clear selection after successful deletion
      dispatch({type: "SET_SELECTED_ITEMS", payload: []});

      // If we're on a page that might be empty after deletion, go back one page
      const remainingItems =
        state.filteredApps.length - state.selectedItems.length;
      const currentPageItems = state.itemsPerPage;
      if (
        state.currentPage > 1 &&
        remainingItems <= (state.currentPage - 1) * currentPageItems
      ) {
        dispatch({type: "SET_CURRENT_PAGE", payload: state.currentPage - 1});
      }

      // Show success message
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "success",
          message: `${state.selectedItems.length} app${
            state.selectedItems.length !== 1 ? "s" : ""
          } deleted successfully`,
        },
      });
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error deleting apps. Error: ${error}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={state.sidebarOpen}
        setSidebarOpen={(open) =>
          dispatch({type: "SET_SIDEBAR_OPEN", payload: open})
        }
      />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header
          sidebarOpen={state.sidebarOpen}
          setSidebarOpen={(open) =>
            dispatch({type: "SET_SIDEBAR_OPEN", payload: open})
          }
        />

        {/* Banner */}
        <div className="fixed right-0 w-auto sm:w-full z-50">
          <Banner
            type={state.bannerType}
            open={state.bannerOpen}
            setOpen={(open) =>
              dispatch({
                type: "SET_BANNER",
                payload: {
                  open,
                  type: state.bannerType,
                  message: state.bannerMessage,
                },
              })
            }
            className={`transition-opacity duration-600 ${
              state.bannerOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {state.bannerMessage}
          </Banner>
        </div>

        {/* Danger Modal */}
        <div className="m-1.5">
          <ModalBlank
            id="danger-modal"
            modalOpen={state.dangerModalOpen}
            setModalOpen={(open) =>
              dispatch({type: "SET_DANGER_MODAL", payload: open})
            }
          >
            <div className="p-5 flex space-x-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-700">
                <svg
                  className="shrink-0 fill-current text-red-500"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
                </svg>
              </div>
              {/* Content */}
              <div>
                {/* Modal header */}
                <div className="mb-2">
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Delete {state.selectedItems.length} app
                    {state.selectedItems.length !== 1 ? "s" : ""}?
                  </div>
                </div>
                {/* Modal content */}
                <div className="text-sm mb-10">
                  <div className="space-y-2">
                    <p>
                      {t("appDeleteConfirmationMessage")}
                      {state.selectedItems.length !== 1 ? "s" : ""}?{" "}
                      {t("actionCantBeUndone")}
                    </p>
                  </div>
                </div>
                {/* Modal footer */}
                <div className="flex flex-wrap justify-end space-x-2">
                  <button
                    className="btn-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({type: "SET_DANGER_MODAL", payload: false});
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-sm bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleDelete}
                    disabled={state.isSubmitting}
                  >
                    {state.isSubmitting ? "Deleting..." : "Accept"}
                  </button>
                </div>
              </div>
            </div>
          </ModalBlank>
        </div>

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {t("applications")}
                </h1>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Delete button */}

                {/* Filter button */}
                <DropdownButton
                  align="right"
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicate}
                />

                {/* Add App button */}
                <button
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                  onClick={() => navigate(`${location.pathname}/new`)}
                >
                  <svg
                    className="fill-current shrink-0 xs:hidden"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="max-xs:sr-only">{t("addApp")}</span>
                </button>
              </div>
            </div>

            {/* Search bar with integrated view mode selector */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="form-input w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg shadow-sm "
                    placeholder={t("searchAppsPlaceholder")}
                    value={state.searchTerm}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_SEARCH_TERM",
                        payload: e.target.value,
                      })
                    }
                  />
                  <div className="absolute inset-0 flex items-center pointer-events-none pl-3">
                    <svg
                      className="shrink-0 fill-current text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-1 mr-2"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                      <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                    </svg>
                  </div>
                </div>
                <select
                  className="form-select w-40 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg shadow-sm text-sm text-gray-500 dark:text-gray-400"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                >
                  <option value="filter">{t("listView")}</option>
                  <option value="group">{t("groupByCategory")}</option>
                </select>
              </div>
            </div>

            {/* Table or Grouped View */}
            {viewMode === "filter" ? (
              <>
                <AppsTable
                  apps={currentApps}
                  onToggleSelectAll={handleToggleSelectAll}
                  onToggleSelect={handleToggleSelection}
                  selectedItems={state.selectedItems}
                  totalApps={state.filteredApps.length}
                />
                {/* Pagination */}
                {state.filteredApps.length > 0 && (
                  <div className="mt-8">
                    <PaginationClassic
                      currentPage={state.currentPage}
                      totalItems={state.filteredApps.length}
                      itemsPerPage={state.itemsPerPage}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <CollapsibleAppsTable
                filteredApps={state.filteredApps}
                selectedItems={state.selectedItems}
                onToggleSelect={handleToggleSelection}
                expandedCategories={expandedCategories}
                setExpandedCategories={setExpandedCategories}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppsList;
