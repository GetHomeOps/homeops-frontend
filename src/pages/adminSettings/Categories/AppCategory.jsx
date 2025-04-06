import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";

import CategoryFormContainer from "../../../partials/containers/CategoryFormContainer";

function AppCategory({categoryToEdit}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isEditing = !!categoryToEdit;
  const navigate = useNavigate();

  // Dynamic title based on edit mode and app name
  const getPageTitle = () => {
    if (isEditing) {
      return `Edit ${categoryToEdit.name}`;
    }
    return "New Category";
  };

  const handleBackClick = () => {
    navigate("/admin/categories");
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              {/* Left: Back button and Title */}
              <div>
                {/* Only show back button if not in a modal or if specifically requested */}

                <button
                  className="btn text-gray-500 hover:text-gray-800  dark:text-gray-300 dark:hover:text-gray-600 mb-2 pl-0 focus:outline-none shadow-none"
                  onClick={handleBackClick}
                >
                  <svg
                    className="fill-current shrink-0 mr-1"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
                  </svg>
                  <span>Categories</span>
                </button>
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {getPageTitle()}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {isEditing
                    ? `Update the details for ${appToEdit.name}`
                    : "Create a new category record"}
                </p>
              </div>

              {/* Right side: potential additional actions */}

              <div className="mt-4 sm:mt-4 md:mt-18 mr-4">
                <button className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300">
                  <span>New</span>
                </button>
              </div>

              {isEditing && (
                <div className="mt-4 sm:mt-0 flex-shrink-0">
                  <button
                    className="btn bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => {
                      /* Handle delete action */
                      if (
                        window.confirm(
                          `Are you sure you want to delete ${appToEdit.name}?`
                        )
                      ) {
                        // Delete logic here
                        navigate("/apps");
                      }
                    }}
                  >
                    Delete App
                  </button>
                </div>
              )}
            </div>

            {/* Form */}
            <CategoryFormContainer
              appData={categoryToEdit}
              onCancel={handleBackClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppCategory;
