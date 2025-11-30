import React, {createContext, useState, useContext, useEffect} from "react";
import AppApi from "../api/api";
import {useAuth} from "./AuthContext";

const UserContext = createContext();

/* Context for Users */
export function UserProvider({children}) {
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const {currentUser, isLoading} = useAuth();

  useEffect(() => {
    async function getAllUsers() {
      if (isLoading || !currentUser) return;
      try {
        let fetchedUsers = await AppApi.getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("There was an error retrieving all users:", err);
      }
    }
    getAllUsers();
  }, [isLoading, currentUser]);

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
