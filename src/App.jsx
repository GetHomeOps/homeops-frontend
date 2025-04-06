import React, {useState, useEffect} from "react";
import {Routes, Route, useLocation} from "react-router-dom";
import useLocalStorage from "./hooks/useLocalStorage";
import RoutesList from "./pages/routes-nav/RoutesList";
import AppContext from "./context/AppContext";
import AppApi from "./api/api";
import {jwtDecode as decode} from "jwt-decode";

import "./css/style.css";

// Key name for storing token in localStorage for "remember me" re-login
export const TOKEN_STORAGE_ID = "app-token";

/** POS application.
 *
 * - currentUser: user obj from API. This becomes the canonical way to tell
 *   if someone is logged in. This is passed around via context throughout app,
 *   isLoading: has user data been pulled from API?
 *
 * - token: for logged in users, this is their authentication JWT.
 *   Is required to be set for most API calls. This is initially read from
 *   localStorage and synced to there via the useLocalStorage hook.
 *
 *
 * App -> Routes
 */
function App() {
  const [currentUser, setCurrentUser] = useState({
    data: null,
    isLoading: true,
  });
  const [currentDb, setCurrentDb] = useLocalStorage("current-db", null);
  const [databaseApps, setDatabaseApps] = useState([]);
  const [apps, setApps] = useState([]);
  const [viewMode, setViewMode] = useLocalStorage("apps-view-mode", "filter");
  const [expandedCategories, setExpandedCategories] = useLocalStorage(
    "expanded-categories",
    []
  );

  // Key name for storing token in localStorage for "remember me" re-login
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);

  const location = useLocation();

  useEffect(() => {
    async function getCurrentUser() {
      if (token) {
        try {
          let {email} = decode(token);
          // put the token on the Api class so it can use it to call the API.
          AppApi.token = token;

          let currentUser = await AppApi.getCurrentUser(email);

          // Debug check
          console.log("Retrieved user:", currentUser);

          if (!currentUser || !currentUser.id) {
            console.error("Current user or user ID is undefined");
            setCurrentUser({
              isLoading: false,
              data: null,
            });
            return;
          }

          let userDatabases = await AppApi.getUserDatabases(currentUser.id);

          setCurrentUser({
            isLoading: false,
            data: {...currentUser, databases: userDatabases},
          });
        } catch (err) {
          console.error("App loadUserInfo: problem loading", err);
          setCurrentUser({
            isLoading: false,
            data: null,
          });
        }
      } else {
        setCurrentUser({
          isLoading: false,
          data: null,
        });
      }
    }
    getCurrentUser();
  }, [token]);

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({top: 0});
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]); // triggered on route change

  /** Handles site-wide login.
   *
   * Logs in a user
   *
   * Make sure you await this function to see if any error happens.
   */
  async function login(loginData) {
    let token = await AppApi.login(loginData);
    setToken(token);
  }

  /** Handles site-wide signup.
   *
   * Automatically logs them in (set token) upon signup.
   *
   * Make sure you await this function to see if any error happens.
   */
  async function signup(signupData) {
    let token = await AppApi.signup(signupData);
    setToken(token);
  }

  /* Get apps linked to current Database and stores them on state */
  useEffect(() => {
    async function loadApps() {
      let dbApps = await AppApi.getAppsByDb(currentDb);
      setDatabaseApps(dbApps);
    }
    loadApps();
  }, [currentDb]);

  /* Gell All Apps (Only for Super_Admin) */
  useEffect(() => {
    async function getAllApps() {
      try {
        let apps = await AppApi.getAllApps();
        setApps(apps);
      } catch (err) {
        console.error("There was an error retrieving all apps: ", err);
      }
    }
    getAllApps();
  }, []);

  /** Handles site-wide logout */
  function logout() {
    setCurrentUser({
      isLoading: true,
      data: null,
    });
    setToken(null);
    setCurrentDb(null);
  }

  /* Handles site-wide database id */
  function setSelectedDb(dbId) {
    setCurrentDb(dbId);
  }

  /* Creates app on database */
  async function createApp(appData) {
    try {
      let res = await AppApi.addApp({
        name: appData.name,
        icon: appData.icon,
        url: appData.url,
        category: appData.category,
        description: appData.description,
      });

      if (res) {
        setApps((prevApps) =>
          [...prevApps, res].sort((a, b) => a.name.localeCompare(b.name))
        );
        return res;
      }
      return res;
    } catch (error) {
      console.error("Error creating new app:", error);
      throw error;
    }
  }

  /* Updates app in database */
  async function updateApp(id, appData) {
    try {
      let res = await AppApi.updateApp(id, {
        name: appData.name,
        icon: appData.icon,
        url: appData.url,
        category: appData.category,
        description: appData.description,
      });

      if (res) {
        setApps((prevApps) => {
          const updatedApps = prevApps.map((app) =>
            app.id === Number(id) ? res : app
          );
          return updatedApps;
        });
        return res;
      }
    } catch (error) {
      console.error("Error updating app:", error);
      throw error;
    }
  }

  /* Deletes app from database */
  async function deleteApp(id) {
    try {
      let res = await AppApi.deleteApp(id);

      if (res) {
        setApps((prevApps) => prevApps.filter((app) => app.id !== Number(id)));
        return res;
      }
    } catch (error) {
      console.error("Error deleting app:", error);
      throw error;
    }
  }

  if (currentUser.isLoading) return <div>Loading...</div>;

  return (
    <AppContext.Provider
      value={{
        currentUser: currentUser.data,
        setCurrentUser,
        login,
        signup,
        logout,
        setSelectedDb,
        currentDb,
        apps,
        createApp,
        updateApp,
        deleteApp,
        viewMode,
        setViewMode,
        expandedCategories,
        setExpandedCategories,
      }}
    >
      <RoutesList
        currentUser={currentUser.data}
        login={login}
        signup={signup}
        logout={logout}
        createApp={createApp}
      />
    </AppContext.Provider>
  );
}

export default App;
