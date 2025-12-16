import { useState, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";
import { useAuth } from "../context/AuthContext";
import AppApi from "../api/api";

/**
 * Hook to manage current database selection
 * Handles initialization and updates when user changes
 */
export default function useCurrentDb() {
  const { currentUser } = useAuth();
  const [currentDb, setCurrentDb] = useLocalStorage("current-db", null);

  // Initialize currentDb with first database when user is available
  useEffect(() => {
    if (
      currentUser &&
      currentUser.databases &&
      currentUser.databases.length > 0
    ) {
      // Only set if currentDb is null or if the stored ID doesn't match any current database
      const shouldUpdate =
        !currentDb ||
        !currentDb.id ||
        !currentUser.databases.some((db) => db.id === currentDb.id);

      if (shouldUpdate) {
        const firstDb = currentUser.databases[0];
        setCurrentDb({
          id: firstDb.id,
          name: firstDb.name,
          url: firstDb.url?.replace(/^\/+/, "") || firstDb.name,
        });
      }
    }
  }, [currentUser, currentDb, setCurrentDb]);

  const setSelectedDb = (dbIdentifier) => {
    if (!currentUser || !currentUser.databases) return;

    let db;
    // Check if it's a database object or an ID
    if (typeof dbIdentifier === "object" && dbIdentifier.id) {
      db = dbIdentifier;
    } else {
      // Find database by ID
      db = currentUser.databases.find(
        (d) => d.id === dbIdentifier || d.id === Number(dbIdentifier)
      );
    }

    if (db) {
      setCurrentDb({
        id: db.id,
        name: db.name,
        url: db.url?.replace(/^\/+/, "") || db.name,
      });
    }
  };

  return { currentDb, setSelectedDb };
}

