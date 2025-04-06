import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useLocation} from "react-router-dom";

import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import DeleteButton from "../../../partials/actions/DeleteButton";
import FilterButton from "../../../components/DropdownFilter";
import PaginationClassic from "../../../components/PaginationClassic";
import CategoriesTable from "../../../partials/categories/CategoriesTable";
import CategoryApi from "../../../api/api";

const cats = [
  {id: 1, name: "Inventory", description: "Category 1 description"},
  {id: 2, name: "Sales", description: "Category 2 description"},
  {id: 3, name: "Category 3", description: "Category 3 description"},
  {id: 4, name: "Category 4", description: "Category 4 description"},
  {id: 5, name: "Category 1", description: "Category 1 description"},
  {id: 6, name: "Category 2", description: "Category 2 description"},
  {id: 7, name: "Category 3", description: "Category 3 description"},
  {id: 8, name: "Category 4", description: "Category 4 description"},
];

function Categories() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [categories, setCategories] = useState(cats);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectedItems = (selectedItems) => {
    setSelectedItems([...selectedItems]);
  };

  function handlePageChange(page) {
    setCurrentPage(page);
  }

  // Categories pagination
  const indexOfLastCategory = currentPage * itemsPerPage;
  const indexOfFirstCategory = indexOfLastCategory - itemsPerPage;
  const currentCategories = categories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  useEffect(() => {
    async function getAllCategories() {
      try {
        let categories = await CategoryApi.getAllCategories();
        setCategories(categories);
      } catch (err) {
        console.error("There was an error retrieving all categories: ", err);
      }
    }
    getAllCategories();
  }, []);

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
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  Categories
                </h1>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Delete button */}
                <DeleteButton selectedItems={selectedItems} />

                {/* Filter button */}
                <FilterButton align="right" />

                {/* Add Category button */}
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
                  <span className="max-xs:sr-only">Add Category</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <CategoriesTable
              categories={currentCategories}
              totalItems={categories.length}
              selectedItems={handleSelectedItems}
            />

            {/* Pagination */}
            <div className="mt-8">
              <PaginationClassic
                currentPage={currentPage}
                totalItems={categories.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Categories;
