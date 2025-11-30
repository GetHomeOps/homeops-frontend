import React, {useState, useEffect} from "react";

import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";

import AppCard from "../partials/apps/AppCard";
import AppApi from "../api/api";
import {useContext} from "react";
import {useApp} from "../context/AppContext";

import CampaignsCard from "../partials/campaigns/CampaignsCard";

import styles from "./style/Main.module.css";

function Main() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {currentUser, currentDb, categories, apps, getCategoryName} = useApp();

  useEffect(() => {
    async function getApps() {
      try {
        console.log("currentDb: ", currentDb);
      } catch {}
    }
    getApps();
  }, []);

  console.log("apps: ", apps);
  console.log("categories: ", categories);
  console.log("Current User: ", currentUser);
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
            <h1>Welcome {currentUser.fullName} !</h1>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Main;
