import {createContext, useContext, useState, useEffect} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import AppApi from "../api/api";
import {jwtDecode as decode} from "jwt-decode";

// Key name for storing token in localStorage for "remember me" re-login
export const TOKEN_STORAGE_ID = "app-token";

/* Context for Authentication */
const AuthContext = createContext();

/* Custom hook to use the AuthContext */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/* Provider for the AuthContext */
export function AuthProvider({children}) {
  const [currentUser, setCurrentUser] = useState({
    data: null,
    isLoading: true,
  });
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);

  /* Get the current user */
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

  /** Handles site-wide login */
  async function login(loginData) {
    try {
      let token = await AppApi.login(loginData);
      setToken(token);

      // Wait for user data to be loaded
      const {email} = decode(token);
      AppApi.token = token;
      const currentUser = await AppApi.getCurrentUser(email);

      const userDatabases = await AppApi.getUserDatabases(currentUser.id);

      setCurrentUser({
        isLoading: false,
        data: {...currentUser, databases: userDatabases},
      });

      return token;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /** Handles site-wide signup */
  async function signup(signupData) {
    try {
      // Step 1: Sign up and get token
      const signupResponse = await AppApi.signup(signupData);
      let token;
      let signupUser = null;

      // Extract token and user from response
      // Backend may return: { token, user } or just { token }
      if (signupResponse.token) {
        token = signupResponse.token;
        signupUser = signupResponse.user || null;
      } else if (typeof signupResponse === "string") {
        // Fallback: if response is just a string token
        token = signupResponse;
      } else {
        // Fallback: use response as token if it's not an object
        token = signupResponse;
      }

      console.log("Signup response:", signupResponse);
      console.log("Extracted token:", token);
      console.log("Extracted user from signup:", signupUser);

      setToken(token);

      // Step 2: Set token for API calls
      AppApi.token = token;

      // Step 3: Get current user (use signup response user if available, otherwise fetch)
      const decodedToken = decode(token);
      const {email} = decodedToken;

      // Try to get user ID from token first (some tokens include user_id)
      const tokenUserId =
        decodedToken.user_id || decodedToken.userId || decodedToken.id;

      // Use user from signup response if available, otherwise fetch
      let currentUser = signupUser;
      if (!currentUser) {
        currentUser = await AppApi.getCurrentUser(email);
      }

      console.log("Retrieved user after signup:", currentUser);
      console.log("Decoded token:", decodedToken);
      console.log("User ID from token:", tokenUserId);
      console.log("User from signup response:", signupUser);

      if (!currentUser) {
        throw new Error("Failed to retrieve user after signup: user is null");
      }

      // Use id from user object, or userId, or from token
      const userId = currentUser.id || currentUser.userId || tokenUserId;

      if (!userId) {
        console.error("User object missing ID:", currentUser);
        console.error("Token payload:", decodedToken);
        throw new Error(
          `Failed to retrieve user ID after signup. User object: ${JSON.stringify(
            currentUser
          )}, Token: ${JSON.stringify(decodedToken)}`
        );
      }

      console.log("Using user ID:", userId);

      // Step 4: Get user databases (handle case where user has no databases)
      let userDatabases = [];
      try {
        userDatabases = await AppApi.getUserDatabases(userId);
      } catch (error) {
        // If error is "No databases found", that's expected for new users
        const errorMessage = Array.isArray(error)
          ? error.join(" ")
          : error.message || error.toString() || "";

        if (errorMessage.includes("No databases found")) {
          console.log("New user has no databases yet, will create one");
          userDatabases = [];
        } else {
          // Re-throw if it's a different error
          console.error("Error fetching user databases:", error);
          throw error;
        }
      }

      // Step 5: Create database if user has none
      if (!userDatabases || userDatabases.length === 0) {
        // Generate a default database name from user's full name or email
        const dbName = currentUser.fullName
          ? `${currentUser.fullName}'s Database`
          : `${email.split("@")[0]}-database`;

        // Create URL-friendly version (lowercase, replace spaces with hyphens)
        const dbUrl = dbName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        console.log("Creating database for new user:", {
          name: dbName,
          url: dbUrl,
          userId: userId,
        });

        // Validate userId before proceeding
        if (!userId) {
          throw new Error(
            `Cannot create database: user ID is missing. User object: ${JSON.stringify(
              currentUser
            )}`
          );
        }

        try {
          // Step 1: Create the database (without user_id)
          const newDatabase = await AppApi.createDatabase({
            name: dbName,
            url: dbUrl,
          });

          console.log("Database created successfully:", newDatabase);

          // Validate database ID
          if (!newDatabase || !newDatabase.id) {
            throw new Error(
              `Database creation failed: database ID is missing. Database object: ${JSON.stringify(
                newDatabase
              )}`
            );
          }

          // Step 2: Create user_database record to link user to database
          console.log("Creating user-database link with:", {
            userId: userId,
            databaseId: newDatabase.id,
            role: "admin",
          });

          const userDatabaseRecord = await AppApi.addUserToDatabase({
            userId: userId,
            databaseId: newDatabase.id,
            role: "admin", // Default role for the database creator
          });

          console.log(
            "User-database link created successfully:",
            userDatabaseRecord
          );

          // Step 3: Refresh user databases after creation
          try {
            userDatabases = await AppApi.getUserDatabases(userId);
            console.log("User databases after creation:", userDatabases);
          } catch (refreshError) {
            // If refresh fails, use the newly created database
            console.warn(
              "Could not refresh databases, using newly created one:",
              refreshError
            );
            userDatabases = [newDatabase];
          }
        } catch (createError) {
          console.error(
            "Error creating database or user-database link:",
            createError
          );
          const errorMessage = Array.isArray(createError)
            ? createError.join(" ")
            : createError.message || createError.toString() || "Unknown error";
          throw new Error(`Failed to create database: ${errorMessage}`);
        }
      }

      // Step 6: Update current user state with databases
      // Ensure user object has id property
      const userWithId = {
        ...currentUser,
        id: userId,
        databases: userDatabases,
      };

      setCurrentUser({
        isLoading: false,
        data: userWithId,
      });

      // Return user object with databases for navigation
      return {
        user: userWithId,
        token,
      };
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  /** Handle user logout */
  function logout() {
    // Clear the token from storage and API
    localStorage.removeItem(TOKEN_STORAGE_ID);
    AppApi.token = null;

    // Clear all app-related localStorage items
    const keysToRemove = [
      TOKEN_STORAGE_ID,
      "apps_list_page", // Current page state
      "apps-view-mode", // View mode preference
      "expanded-categories", // Expanded categories state
      "apps-list-sort", // List view sorting
      "apps-group-sort", // Group view sorting
      "contacts_list_page", // Contacts list page state
      "categories_list_page", // Categories list page state
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Set default sort configurations
    const defaultListSort = {
      key: "name",
      direction: "asc",
    };
    const defaultGroupSort = {
      key: "category",
      direction: "asc",
    };

    localStorage.setItem("apps-list-sort", JSON.stringify(defaultListSort));
    localStorage.setItem("apps-group-sort", JSON.stringify(defaultGroupSort));

    // Reset user state
    setCurrentUser({
      isLoading: false,
      data: null,
    });
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser: currentUser.data,
        isLoading: currentUser.isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
