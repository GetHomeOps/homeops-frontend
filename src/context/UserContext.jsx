import React, {createContext, useState, useContext, useEffect} from "react";
import AppApi from "../api/api";
import {useAuth} from "./AuthContext";
import useCurrentDb from "../hooks/useCurrentDb";

const UserContext = createContext();

/* Context for Users */
export function UserProvider({children}) {
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const {currentUser, isLoading} = useAuth();
  const {currentDb} = useCurrentDb();

  useEffect(() => {
    async function fetchUsers() {
      if (isLoading || !currentUser) return;

      try {
        let fetchedUsers;

        // If user is superAdmin, get all users
        if (currentUser.role === "superAdmin") {
          fetchedUsers = await AppApi.getAllUsers();
        }
        // If user is agent, get users for the current database
        else if (currentUser.role === "agent" && currentDb?.id) {
          fetchedUsers = await AppApi.getUsersByDatabaseId(currentDb.id);
        }
        // Default: get all users (fallback for other roles or if database ID is not available)
        else {
          fetchedUsers = await AppApi.getAllUsers();
        }

        setUsers(fetchedUsers);
      } catch (err) {
        console.error("There was an error retrieving users:", err);
      }
    }
    fetchUsers();
  }, [isLoading, currentUser, currentDb]);

  /* Handle selection state */
  const handleToggleSelection = (ids, isSelected) => {
    if (Array.isArray(ids)) {
      if (typeof isSelected === "boolean") {
        setSelectedItems((prev) => {
          if (isSelected) {
            return [...new Set([...prev, ...ids])];
          } else {
            return prev.filter((id) => !ids.includes(id));
          }
        });
      } else {
        setSelectedItems(ids);
      }
    } else {
      setSelectedItems((prev) => {
        if (prev.includes(ids)) {
          return prev.filter((id) => id !== ids);
        } else {
          return [...prev, ids];
        }
      });
    }
  };

  console.log(" users: ", users);
  return (
    <UserContext.Provider
      value={{
        users,
        selectedItems,
        setSelectedItems,
        handleToggleSelection,
        setUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
