import React, {useReducer, useEffect, useContext} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {AlertCircle, Mail, User} from "lucide-react";
import Banner from "../../partials/containers/Banner";
import ModalBlank from "../../components/ModalBlank";
import {useTranslation} from "react-i18next";
import DropdownFilter from "../../components/DropdownFilter";
import UserContext from "../../context/UserContext";
import contactContext from "../../context/ContactContext";
import {useAutoCloseBanner} from "../../hooks/useAutoCloseBanner";
import AppApi from "../../api/api";
import SelectDropdown from "../contacts/SelectDropdown";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  role: "",
  contact: "",
};

const initialState = {
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  user: null,
  isNew: false,
  bannerOpen: false,
  dangerModalOpen: false,
  bannerType: "success",
  bannerMessage: "",
  formDataChanged: false,
  isInitialLoad: true,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: {...state.formData, ...action.payload},
        formDataChanged: !state.isInitialLoad,
      };
    case "SET_ERRORS":
      return {...state, errors: action.payload};
    case "SET_SUBMITTING":
      return {...state, isSubmitting: action.payload};
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isNew: !action.payload,
        formData: action.payload
          ? {...initialFormData, ...action.payload}
          : initialFormData,
        formDataChanged: false,
        isInitialLoad: true,
      };
    case "SET_BANNER":
      return {
        ...state,
        bannerOpen: action.payload.open,
        bannerType: action.payload.type,
        bannerMessage: action.payload.message,
      };
    case "SET_DANGER_MODAL":
      return {...state, dangerModalOpen: action.payload};
    case "SET_FORM_CHANGED":
      return {
        ...state,
        formDataChanged: action.payload,
        isInitialLoad: false,
      };
    default:
      return state;
  }
}

function UsersFormContainer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {id} = useParams();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {users, setUsers} = useContext(UserContext);
  const {contacts} = useContext(contactContext);

  // Fetch user based on URL's user id
  useEffect(() => {
    async function fetchUser() {
      if (id && id !== "new") {
        try {
          const existingUser = users.find(
            (user) => Number(user.id) === Number(id)
          );
          if (existingUser) {
            dispatch({type: "SET_USER", payload: existingUser});
          } else {
            throw new Error(t("userNotFoundErrorMessage") || "User not found");
          }
        } catch (err) {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "error",
              message: `Error finding user: ${err}`,
            },
          });
        }
      } else {
        dispatch({type: "SET_USER", payload: null});
      }
    }
    fetchUser();
  }, [id, users, t]);

  // Banner timeout useEffect with the custom hook
  useAutoCloseBanner(state.bannerOpen, state.bannerMessage, () =>
    dispatch({
      type: "SET_BANNER",
      payload: {
        open: false,
        type: state.bannerType,
        message: state.bannerMessage,
      },
    })
  );

  // Populate form data when user changes
  useEffect(() => {
    if (state.user) {
      const userData = {
        name: state.user.name || state.user.fullName || "",
        email: state.user.email || "",
        role: state.user.role || "",
        phone: state.user.phone || "",
        contact: state.user.contact || "",
      };
      dispatch({
        type: "SET_FORM_DATA",
        payload: userData,
      });
    } else {
      dispatch({type: "SET_FORM_DATA", payload: initialFormData});
    }
  }, [state.user]);

  /* Handles form change */
  const handleChange = (e) => {
    const {id, value} = e.target;
    dispatch({type: "SET_FORM_DATA", payload: {[id]: value}});

    // Clear error when field is being edited
    if (state.errors[id]) {
      dispatch({type: "SET_ERRORS", payload: {...state.errors, [id]: null}});
    }

    // Mark form as changed after initial load
    if (state.isInitialLoad) {
      dispatch({type: "SET_FORM_CHANGED", payload: true});
    }
  };

  /* Handles submit button */
  async function handleSubmit(evt) {
    evt.preventDefault();

    if (!validateForm()) return;

    const userData = {
      name: state.formData.name,
      email: state.formData.email,
      phone: state.formData.phone,
      role: state.formData.role,
      contact: state.formData.contact,
    };

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      // TODO: Add createUser API method
      // For now, using signup as a placeholder - you may need to add a proper createUser endpoint
      const res = await AppApi.signup(userData);

      if (res) {
        // Refresh users list
        const fetchedUsers = await AppApi.getAllUsers();
        setUsers(fetchedUsers);

        // Find the newly created user by email
        const newUser = fetchedUsers.find((u) => u.email === userData.email);

        if (newUser) {
          // Navigate to the new user
          navigate(`/users/${newUser.id}`, {
            state: {
              currentIndex: fetchedUsers.length,
              totalItems: fetchedUsers.length,
              visibleUserIds: fetchedUsers.map((user) => user.id),
            },
          });

          // Show success banner
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "success",
              message:
                t("userCreatedSuccessfullyMessage") ||
                "User created successfully",
            },
          });
        }
      }
    } catch (err) {
      console.error("Error creating user:", err);
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error creating user: ${err.message || err}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  /* Handles update button */
  async function handleUpdate(evt) {
    evt.preventDefault();

    if (!validateForm()) return;

    const userData = {
      name: state.formData.name,
      email: state.formData.email,
      phone: state.formData.phone,
      role: state.formData.role,
      contact: state.formData.contact,
    };

    dispatch({type: "SET_SUBMITTING", payload: true});

    try {
      // TODO: Add updateUser API method or use saveProfile
      // Using saveProfile for now - you may need to adjust this
      const res = await AppApi.saveProfile(state.formData.email, userData);

      if (res) {
        // Update the user in the state
        dispatch({
          type: "SET_USER",
          payload: {...userData, id: Number(id)},
        });

        // Refresh users list
        const fetchedUsers = await AppApi.getAllUsers();
        setUsers(fetchedUsers);

        // Show success banner
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message:
              t("userUpdatedSuccessfullyMessage") ||
              "User updated successfully",
          },
        });
      }
    } catch (err) {
      console.error("Error updating user:", err);
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error updating user: ${err.message || err}`,
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  /* Validation Errors */
  const validateForm = () => {
    const newErrors = {};

    if (!state.formData.name) {
      newErrors.name = t("nameValidationErrorMessage") || "Name is required";
    }

    if (!state.formData.email) {
      newErrors.email = t("emailValidationErrorMessage") || "Email is required";
    } else if (!isValidEmail(state.formData.email)) {
      newErrors.email =
        t("emailValidationErrorMessage") || "Invalid email format";
    }

    dispatch({type: "SET_ERRORS", payload: newErrors});
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /* Navigates to users list */
  function handleBackClick() {
    navigate("/users");
  }

  /* If editing a user -> return the user's name
  If new -> return 'New User' */
  function getPageTitle() {
    if (state.user) {
      return state.user.name || state.user.fullName || "";
    }
    return t("newUser") || "New User";
  }

  const displayName =
    state.user?.name || state.user?.fullName || getPageTitle();
  const displayEmail = state.user?.email || "";

  const userImage =
    state.user?.image ||
    state.user?.avatar ||
    state.user?.avatarUrl ||
    state.user?.profileImage ||
    "";

  const userInitial = displayName?.trim()?.charAt(0)?.toUpperCase() || "U";

  /* Handles New User button click */
  function handleNewUser() {
    dispatch({type: "SET_USER", payload: null});
    dispatch({type: "SET_FORM_DATA", payload: initialFormData});
    dispatch({type: "SET_ERRORS", payload: {}});
    navigate("/users/new");
  }

  /* Handles delete button */
  function handleDelete() {
    dispatch({type: "SET_DANGER_MODAL", payload: true});
  }

  /* Handles delete confirmation on modal */
  async function confirmDelete() {
    try {
      dispatch({type: "SET_DANGER_MODAL", payload: false});

      // TODO: Add deleteUser API method
      // For now, this is a placeholder
      // await AppApi.deleteUser(id);

      // Navigate to users list
      navigate(`/users/`);

      // Show success banner
      setTimeout(() => {
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message:
              t("userDeletedSuccessfullyMessage") ||
              "User deleted successfully",
          },
        });
      }, 100);
    } catch (error) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Error deleting user: ${error}`,
        },
      });
    }
  }

  function handleCancel() {
    if (state.user) {
      // For existing users, reset to original user data
      const originalData = {
        name: state.user.name || state.user.fullName || "",
        email: state.user.email || "",
        phone: state.user.phone || "",
        role: state.user.role || "",
        contact: state.user.contact || "",
      };

      dispatch({
        type: "SET_FORM_DATA",
        payload: originalData,
      });

      dispatch({type: "SET_FORM_CHANGED", payload: false});
      dispatch({type: "SET_ERRORS", payload: {}});
    } else {
      // For new users, reset to initial form data
      dispatch({
        type: "SET_FORM_DATA",
        payload: initialFormData,
      });
      dispatch({type: "SET_FORM_CHANGED", payload: false});
      dispatch({type: "SET_ERRORS", payload: {}});
      navigate("/users");
    }
  }

  // Role options for the select dropdown
  const roleOptions = [
    {id: "admin", name: "Admin"},
    {id: "user", name: "User"},
    {id: "manager", name: "Manager"},
    {id: "viewer", name: "Viewer"},
  ];

  // Handler for role change
  function handleRoleChange(value) {
    dispatch({
      type: "SET_FORM_DATA",
      payload: {role: value},
    });

    // Clear error when field is being edited
    if (state.errors.role) {
      dispatch({
        type: "SET_ERRORS",
        payload: {...state.errors, role: null},
      });
    }

    // Mark form as changed after initial load
    if (state.isInitialLoad) {
      dispatch({type: "SET_FORM_CHANGED", payload: true});
    }
  }

  // Handler for contact change
  function handleContactChange(value) {
    dispatch({
      type: "SET_FORM_DATA",
      payload: {contact: value},
    });

    // Clear error when field is being edited
    if (state.errors.contact) {
      dispatch({
        type: "SET_ERRORS",
        payload: {...state.errors, contact: null},
      });
    }

    // Mark form as changed after initial load
    if (state.isInitialLoad) {
      dispatch({type: "SET_FORM_CHANGED", payload: true});
    }
  }

  // Get contact options from contacts
  const contactOptions = contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
  }));

  // Add a helper function for label classes
  const getLabelClasses = () => {
    return "block text-sm font-medium mb-1 text-gray-500 dark:text-gray-400";
  };

  // Add a helper function for input field classes
  const getInputClasses = (fieldName) => {
    const baseClasses = "form-input w-full";
    const errorClasses = state.errors[fieldName]
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : "";
    return `${baseClasses} ${errorClasses}`;
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-gray-50)] dark:bg-gray-900">
      <div className="fixed top-18 right-0 w-auto sm:w-full z-50">
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
          className="transition-opacity duration-300"
        >
          {state.bannerMessage}
        </Banner>
      </div>

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
                  {state.user ? `Delete ${state.user.name}?` : "Delete User?"}
                </div>
              </div>
              {/* Modal content */}
              <div className="text-sm mb-10">
                <div className="space-y-2">
                  <p>
                    {t("userDeleteConfirmationMessage") ||
                      "Are you sure you want to delete this user?"}{" "}
                    {t("actionCantBeUndone") || "This action cannot be undone."}
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
                  {t("cancel") || "Cancel"}
                </button>
                <button
                  className="btn-sm bg-red-500 hover:bg-red-600 text-white"
                  onClick={confirmDelete}
                >
                  {t("accept") || "Accept"}
                </button>
              </div>
            </div>
          </div>
        </ModalBlank>
      </div>

      <div className="px-4 sm:px-6 lg:px-1">
        {/* Navigation and Actions */}
        <div className="flex justify-between items-center mb-2">
          <button
            className="btn text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-600 mb-2 pl-0 focus:outline-none shadow-none"
            onClick={handleBackClick}
          >
            <svg
              className="fill-current shrink-0 mr-1"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
            </svg>
            <span className="text-lg">{t("users") || "Users"}</span>
          </button>

          <div className="flex items-center gap-3">
            {state.user && (
              <DropdownFilter onDelete={handleDelete} align="right" />
            )}
            <button
              className="btn bg-[#456564] hover:bg-[#34514f] text-white transition-colors duration-200 shadow-sm"
              onClick={handleNewUser}
            >
              {t("new") || "New"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* User Name and Info */}
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 shrink-0">
                  <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-700 flex items-center justify-center">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23E5E7EB'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <span className="text-3xl font-semibold text-[#456564]">
                        {userInitial}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {displayName}
                    </h1>
                    {state.user?.role ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f7d46b] text-[#594500] dark:bg-[#f7d46b]/80 dark:text-[#3a3000]">
                        {state.user.role}
                      </span>
                    ) : null}
                  </div>

                  {/* User Details */}
                  <div className="space-y-2">
                    {displayEmail && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Mail className="w-4 h-4 mr-2 text-[#456564] shrink-0" />
                        <span className="truncate">{displayEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Information Form - Always Visible */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <form onSubmit={state.isNew ? handleSubmit : handleUpdate}>
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#456564]" />
                    {t("userInformation") || "User Information"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className={getLabelClasses()} htmlFor="name">
                        {t("name") || "Name"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        className={getInputClasses("name")}
                        type="text"
                        value={state.formData.name}
                        onChange={handleChange}
                        placeholder={t("namePlaceholder") || "Enter name"}
                      />
                      {state.errors.name && (
                        <div className="mt-1 flex items-center text-sm text-red-500">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>{state.errors.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className={getLabelClasses()} htmlFor="email">
                        {t("email") || "Email"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        className={`${getInputClasses("email")} ${
                          !state.isNew
                            ? "bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed"
                            : ""
                        }`}
                        type="email"
                        value={state.formData.email}
                        readOnly={!state.isNew}
                        onChange={handleChange}
                        placeholder={t("emailPlaceholder") || "Enter email"}
                      />
                      {state.errors.email && (
                        <div className="mt-1 flex items-center text-sm text-red-500">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>{state.errors.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className={getLabelClasses()} htmlFor="phone">
                        {t("phone") || "Phone"}
                      </label>
                      <input
                        id="phone"
                        className={getInputClasses("phone")}
                        type="tel"
                        value={state.formData.phone}
                        onChange={handleChange}
                        placeholder={
                          t("phonePlaceholder") || "Enter phone number"
                        }
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className={getLabelClasses()} htmlFor="role">
                        {t("role") || "Role"}
                      </label>
                      <SelectDropdown
                        options={roleOptions}
                        value={state.formData.role}
                        onChange={handleRoleChange}
                        placeholder={t("selectRole") || "Select role"}
                        name="role"
                        id="role"
                        clearable={true}
                      />
                    </div>

                    {/* Contact */}
                    <div>
                      <label className={getLabelClasses()} htmlFor="contact">
                        {t("contact") || "Contact"}
                      </label>
                      <SelectDropdown
                        options={contactOptions}
                        value={state.formData.contact}
                        onChange={handleContactChange}
                        placeholder={t("selectContact") || "Select contact"}
                        name="contact"
                        id="contact"
                        clearable={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${
                state.formDataChanged || state.isNew ? "sticky" : "hidden"
              } bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-lg transition-all duration-200`}
            >
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#8fa3a2] dark:hover:border-[#8fa3a2] text-gray-800 dark:text-gray-300 transition-colors duration-200 shadow-sm"
                  onClick={handleCancel}
                >
                  {t("cancel") || "Cancel"}
                </button>
                <button
                  type="submit"
                  className="btn bg-[#456564] hover:bg-[#34514f] text-white transition-colors duration-200 shadow-sm min-w-[100px]"
                  disabled={state.isSubmitting}
                >
                  {state.isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("saving") || "Saving"}
                    </div>
                  ) : state.isNew ? (
                    t("save") || "Save"
                  ) : (
                    t("update") || "Update"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UsersFormContainer;
