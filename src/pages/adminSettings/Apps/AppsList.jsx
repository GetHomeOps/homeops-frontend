import React, {useReducer, useEffect, useContext, useMemo} from "react";
import {useNavigate, useLocation} from "react-router-dom";

import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import DropdownButton from "../../../partials/buttons/ListDropdown";
import PaginationClassic from "../../../components/PaginationClassic";
import AppsTable from "../../../partials/apps/AppsTable";
import appContext from "../../../context/AppContext";
import CollapsibleAppsTable from "../../../partials/apps/CollapsibleAppsTable";
import ModalBlank from "../../../components/ModalBlank";
import Banner from "../../../partials/containers/Banner";
import ViewModeDropdown from "../../../components/ViewModeDropdown";

import {useTranslation} from "react-i18next";

const PAGE_STORAGE_KEY = "apps_list_page";

const initialState = {
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
    case "SET_CURRENT_PAGE":
      return {...state, currentPage: action.payload};
    case "SET_ITEMS_PER_PAGE":
      return {...state, itemsPerPage: action.payload};
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
      return {
        ...state,
        filteredApps: action.payload,
      };
    case "SET_SIDEBAR_OPEN":
      return {...state, sidebarOpen: action.payload};
    default:
      return state;
  }
}

/*
List of Apps + Create new App button

Props:

State:
- filteredApps:
- currentPage:
- itemsPerPage:
- searchTerm:
- isSubmitting:
- dangerModalOpen:
- bannerOpen:

Appslist -> AppsTable, CollapsibleAppsTable

*/
function AppsList() {
  const {
    apps,
    deleteApp,
    viewMode,
    setViewMode,
    expandedCategories,
    setExpandedCategories,
    selectedItems,
    handleToggleSelection,
    bulkDuplicateApps,
    categories,
    listSortedItems,
    groupSortedItems,
  } = useContext(appContext);

  // Set up component's initial state
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    currentPage: localStorage.getItem(PAGE_STORAGE_KEY)
      ? Number(localStorage.getItem(PAGE_STORAGE_KEY))
      : 1,
  });
  const navigate = useNavigate();
  const {t, i18n} = useTranslation();

  // Initialize appsList when apps change
  useEffect(() => {
    if (apps && apps.length > 0) {
      dispatch({type: "SET_FILTERED_APPS", payload: apps});
    }
  }, [apps]);

  // Update localStorage when page changes
  useEffect(() => {
    localStorage.setItem(PAGE_STORAGE_KEY, state.currentPage);
  }, [state.currentPage]);

  // Handle navigation to app details
  const handleAppClick = (appId) => {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    let currentIndex;
    let totalItems;
    let visibleAppIds;

    if (viewMode === "list") {
      currentIndex = listSortedItems.findIndex((a) => a.id === appId) + 1;
      totalItems = listSortedItems.length;
      visibleAppIds = listSortedItems.map((a) => a.id);
    } else {
      // For group view, we need to maintain the order of apps as they appear in the UI
      const sortedVisibleApps = Object.entries(groupedItems)
        .sort(([categoryIdA], [categoryIdB]) => {
          const categoryNameA = getCategoryName(
            categoryIdA,
            categories
          ).toLowerCase();
          const categoryNameB = getCategoryName(
            categoryIdB,
            categories
          ).toLowerCase();
          return categoryNameA.localeCompare(categoryNameB);
        })
        .reduce((acc, [categoryId, apps]) => {
          if (
            expandedCategories.includes(getCategoryName(categoryId, categories))
          ) {
            // Sort apps within each category by name
            const sortedApps = [...apps].sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            );
            return [...acc, ...sortedApps];
          }
          return acc;
        }, []);

      // Reverse the array to match the visual order
      const reversedApps = [...sortedVisibleApps].reverse();
      currentIndex = reversedApps.findIndex((a) => a.id === appId) + 1;
      totalItems = reversedApps.length;
      visibleAppIds = reversedApps.map((a) => a.id);
    }

    navigate(`/admin/apps/${appId}`, {
      state: {
        currentIndex,
        totalItems,
        visibleAppIds,
      },
    });
  };

  // Handle navigation to new app form
  const handleNewApp = () => {
    navigate(`/admin/apps/new`);
  };

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === Number(categoryId));
    return category ? category.name : "";
  };

  // Memoize filtered apps based on search term
  const filteredApps = useMemo(() => {
    if (!apps || apps.length === 0) return [];

    // If no search term, return all apps
    if (!state.searchTerm) return apps;

    // Filter the apps based on search term
    const searchLower = state.searchTerm.toLowerCase();
    const filtered = apps.filter((app) => {
      const appName = app.name.toLowerCase();
      const categoryName =
        getCategoryName(app.category_id)?.toLowerCase() || "";
      const description = (app.description || "").toLowerCase();
      const url = (app.url || "").toLowerCase();

      return (
        appName.includes(searchLower) ||
        categoryName.includes(searchLower) ||
        description.includes(searchLower) ||
        url.includes(searchLower)
      );
    });

    // Update expanded categories to show categories with results
    if (viewMode === "group" && filtered.length > 0) {
      const categoriesWithResults = [
        ...new Set(filtered.map((app) => getCategoryName(app.category_id))),
      ];
      setExpandedCategories((prev) => {
        const currentExpanded = Array.isArray(prev) ? prev : [];
        return [...new Set([...currentExpanded, ...categoriesWithResults])];
      });
    }

    return filtered;
  }, [state.searchTerm, apps, viewMode, categories]);

  // Memoize the apps to display in list view (filtered and sorted)
  const appsToDisplay = useMemo(() => {
    // If there's a search term, use filtered apps, otherwise use sorted items from context
    if (state.searchTerm) {
      return filteredApps;
    }
    return listSortedItems;
  }, [state.searchTerm, filteredApps, listSortedItems]);

  // Update filtered apps in state whenever they change
  useEffect(() => {
    dispatch({type: "SET_FILTERED_APPS", payload: filteredApps});
  }, [filteredApps]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    dispatch({type: "SET_CURRENT_PAGE", payload: 1});
  }, [state.searchTerm]);

  // Group apps by category for group view
  const groupedItems = useMemo(() => {
    if (viewMode !== "list") {
      return state.filteredApps.reduce((acc, app) => {
        const categoryName = getCategoryName(app.category_id);
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(app);
        return acc;
      }, {});
    }
    return {};
  }, [state.filteredApps, viewMode, categories]);

  // Memoize visible apps for group view
  const visibleApps = useMemo(() => {
    if (viewMode !== "list") {
      return Object.entries(groupedItems)
        .filter(([categoryName]) => expandedCategories.includes(categoryName))
        .flatMap(([_, apps]) => apps);
    }
    return [];
  }, [groupedItems, expandedCategories, viewMode]);

  // Memoize allVisibleSelected
  const allVisibleSelected = useMemo(() => {
    if (viewMode === "list") {
      return (
        appsToDisplay.length > 0 &&
        appsToDisplay.every((app) => selectedItems.includes(app.id))
      );
    }
    return (
      visibleApps.length > 0 &&
      visibleApps.every((app) => selectedItems.includes(app.id))
    );
  }, [visibleApps, selectedItems, appsToDisplay, viewMode]);

  // Handle items per page change
  function handleItemsPerPageChange(value) {
    dispatch({type: "SET_ITEMS_PER_PAGE", payload: Number(value)});
  }

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
    if (selectedItems.length === 0) {
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
    if (selectedItems.length === 0) return;

    dispatch({type: "SET_SUBMITTING", payload: true});
    try {
      const duplicatedApps = await bulkDuplicateApps(selectedItems);

      // Show success message
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "success",
          message: `${duplicatedApps.length} app${
            duplicatedApps.length !== 1 ? "s" : ""
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
    if (selectedItems.length === 0) return;

    // Close modal immediately when Accept is clicked
    dispatch({type: "SET_DANGER_MODAL", payload: false});

    dispatch({type: "SET_SUBMITTING", payload: true});
    try {
      // Store the IDs of successfully deleted apps
      const deletedIds = [];

      // Delete each selected app
      for (const appId of selectedItems) {
        try {
          const res = await deleteApp(appId);
          if (res) {
            deletedIds.push(appId);
          }
        } catch (error) {
          console.error(`Error deleting app ${appId}:`, error);
          // Continue with other deletions even if one fails
        }
      }

      // Only show success if at least one app was deleted
      if (deletedIds.length > 0) {
        // Clear all successfully deleted items from selection at once
        handleToggleSelection(deletedIds, false);

        // If we're on a page that might be empty after deletion, go back one page
        const remainingItems = state.filteredApps.length - deletedIds.length;
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
            message: `${deletedIds.length} app${
              deletedIds.length !== 1 ? "s" : ""
            } deleted successfully`,
          },
        });
      } else {
        // Show error message only if no apps were deleted
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "error",
            message: "No apps were deleted. Please try again.",
          },
        });
      }
    } catch (error) {
      console.error("Error in bulk deletion:", error);
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error deleting apps. Please try again.`,
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
                    Delete {selectedItems.length} app
                    {selectedItems.length !== 1 ? "s" : ""}?
                  </div>
                </div>
                {/* Modal content */}
                <div className="text-sm mb-10">
                  <div className="space-y-2">
                    <p>
                      {t("appDeleteConfirmationMessage")}
                      {selectedItems.length !== 1 ? "s" : ""}?{" "}
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
                {/* Filter button */}
                {selectedItems.length > 0 && (
                  <DropdownButton
                    align="right"
                    onDelete={handleDeleteClick}
                    onDuplicate={handleDuplicate}
                  />
                )}

                {/* Add App button */}
                <button
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                  onClick={handleNewApp}
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
                <ViewModeDropdown
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </div>
            </div>

            {/* Table or Grouped View */}
            {viewMode === "list" ? (
              <>
                <AppsTable
                  apps={appsToDisplay}
                  onToggleSelect={handleToggleSelection}
                  selectedItems={selectedItems}
                  totalApps={appsToDisplay.length}
                  currentPage={state.currentPage}
                  itemsPerPage={state.itemsPerPage}
                  onAppClick={handleAppClick}
                  categories={categories}
                />
                {/* Pagination */}
                {appsToDisplay.length > 0 && (
                  <div className="mt-8">
                    <PaginationClassic
                      currentPage={state.currentPage}
                      totalItems={appsToDisplay.length}
                      itemsPerPage={state.itemsPerPage}
                      onPageChange={(page) =>
                        dispatch({type: "SET_CURRENT_PAGE", payload: page})
                      }
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <CollapsibleAppsTable
                filteredApps={state.filteredApps}
                selectedItems={selectedItems}
                onToggleSelect={handleToggleSelection}
                expandedCategories={expandedCategories}
                setExpandedCategories={setExpandedCategories}
                categories={categories}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
export default AppsList;
