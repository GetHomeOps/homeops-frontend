import React, {useState, useEffect} from "react";

import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";

import AppCard from "../partials/apps/AppCard";
import AppApi from "../api/api";
import {useContext} from "react";
import UserContext from "../context/AppContext";

import CampaignsCard from "../partials/campaigns/CampaignsCard";

import styles from "./style/Main.module.css";

const items = [
  {
    id: 0,
    category: "1",
    title: "Inventory",
    content: "Inventory",
    type: "One-Time",
    icon: 0,
    // icon: (
    //   <svg
    //     xmlns="http://www.w3.org/2000/svg"
    //     width="48"
    //     height="48"
    //     viewBox="0 0 24 24"
    //     fill="none"
    //     stroke="currentColor"
    //     stroke-width="1"
    //     stroke-linecap="round"
    //     stroke-linejoin="round"
    //     class="icon icon-tabler icons-tabler-outline icon-tabler-building-warehouse"
    //   >
    //     <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    //     <path d="M3 21v-13l9 -4l9 4v13" />
    //     <path d="M13 13h4v8h-10v-6h6" />
    //     <path d="M13 21v-9a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v3" />
    //   </svg>
    // ),
  },
  {
    id: 1,
    category: "2",
    title: "Point of Sale",
    content: "Point of Sale",
    type: "One-Time",
    icon: 1,
  },
  {
    id: 2,
    category: "1",
    title: "Inventory",
    content: "Inventory",
    type: "One-Time",
    icon: 2,
  },
  {
    id: 3,
    category: "2",
    title: "Point of Sale",
    content: "Point of Sale",
    type: "One-Time",
    icon: 3,
  },
  {
    id: 4,
    category: "1",
    title: "Inventory",
    content: "Inventory",
    type: "One-Time",
    icon: 4,
  },
  {
    id: 5,
    category: "2",
    title: "Point of Sale",
    content: "Point of Sale",
    type: "One-Time",
    icon: 0,
  },
];

function Main() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {currentUser, currentDb} = useContext(UserContext);

  useEffect(() => {
    async function getApps() {
      try {
        console.log("currentDb: ", currentDb);
      } catch {}
    }
    getApps();
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
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto mx-auto">
            <h1 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-2">
              Inventory
            </h1>

            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className={`mb-4 sm:mb-0 ${styles["apps-menu__container"]}`}>
                <div className={`grid ${styles["apps-menu"]}`}>
                  {items.map((item) => {
                    return (
                      <AppCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        category={item.category}
                        iconId={item.icon}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Main;
