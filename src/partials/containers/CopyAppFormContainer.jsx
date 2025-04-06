mport React, {useState, useEffect, useContext} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {AlertCircle} from "lucide-react";
import {icons} from "../../assets/icons";
import appContext from "../../context/AppContext";
import AppApi from "../../api/api";
import AppDropdownFilter from "./AppDropdownFilter";
import Banner from "./Banner";
import ModalBlank from "../../components/ModalBlank";

const initialFormData = {
  name: "",
  category: "",
  url: "",
  description: "",
  icon: "",
};

/* Tabs */
const tabs = [{id: 1, label: "General"}];

// Categories for the dropdown
const categories = [
  {id: 1, name: "Inventory"},
  {id: 2, name: "Productivity"},
];

/** Form for Creating/Editing an app
 *
 * Props: None
 *
 * State:
 * - formData: Object {}
 * - errors: {}
 * - isSubmitting: true/false
 * - appToEdit: null/{}
 * - activeTab: Number
 * - isEditing: true/false
 *
 * App -> AppFormContainer
 **/
function AppFormContainer() {
  const {createApp, updateApp, deleteApp, apps} = useContext(appContext);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appToEdit, setAppToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [dangerModalOpen, setDangerModalOpen] = useState(false);
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [bannerType, setBannerType] = useState("success");
  const [bannerAction, setBannerAction] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const {id} = useParams();
  const navigate = useNavigate();

  // Show banner after navigation
  useEffect(() => {
    if (bannerMessage && bannerType) {
      setBannerOpen(true);
      const timer = setTimeout(() => {
        setBannerOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [id, bannerMessage, bannerType]);

  // Populate form data when in edit mode
  useEffect(() => {
    if (isEditing && appToEdit) {
      setFormData({
        name: appToEdit.name,
        category: appToEdit.category,
        url: appToEdit.url,
        description: appToEdit.description,
        icon: appToEdit.icon,
      });
    } else {
      // Reset form data when creating new app
      setFormData({
        name: "",
        category: "",
        url: "",
        description: "",
        icon: "",
      });
    }
  }, [isEditing, appToEdit]);

  /* Fetch appToEdit base on URL's app id */
  useEffect(() => {
    async function fetchApp() {
      if (id && id !== "new") {
        try {
          const app = await AppApi.getApp(id);
          setAppToEdit(app);
          setIsEditing(true);
        } catch (err) {
          setBannerType("error");
          setBannerMessage(`Error fetching app: ${err}`);
          setBannerOpen(true);
          setTimeout(() => {
            setBannerOpen(false);
          }, 2000);
          navigate("/admin/apps");
        }
      } else {
        setAppToEdit(null);
      }
    }
    fetchApp();
  }, [id, navigate]);

  // Update current app index when appToEdit changes
  useEffect(() => {
    if (appToEdit && apps.length > 0) {
      const index = apps.findIndex(
        (app) => Number(app.id) === Number(appToEdit.id)
      );
      setCurrentAppIndex(index);
    }
  }, [appToEdit, apps]);

  /* Handles form change (except icon) */
  const handleChange = (e) => {
    const {id, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error when field is being edited
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: null,
      }));
    }
  };

  /* Handles Icon change */
  function handleIconSelection(evt) {
    const selectedIcon = evt.target.value;
    setFormData((prevData) => ({
      ...prevData,
      icon: selectedIcon,
    }));

    if (errors.icon) {
      setErrors((prev) => ({
        ...prev,
        icon: null,
      }));
    }
  }

  /* Handles submit button */
  async function handleSubmit(evt) {
    evt.preventDefault();

    if (!validateForm()) return;

    const appData = {
      name: formData.name,
      icon: formData.icon,
      url: formData.url,
      category: Number(formData.category),
      description: formData.description,
    };

    setIsSubmitting(true);

    try {
      const res = await createApp(appData);

      if (res && res.id) {
        onCreate(res);
        setBannerType("success");
        setBannerMessage("App created successfully");
        setBannerSuccessOpen(true);

        setTimeout(() => {
          setBannerSuccessOpen(false);
        }, 3000);

        navigate(`/admin/apps/${res.id}`);
      }
    } catch (err) {
      setBannerType("error");
      setBannerMessage(`Error creating app: ${err}`);
      setBannerOpen(true);
      setTimeout(() => {
        setBannerOpen(false);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* Handles update button */
  async function handleUpdate(evt) {
    evt.preventDefault();

    if (!validateForm()) return;

    const appData = {
      name: formData.name,
      icon: formData.icon,
      url: formData.url,
      category: Number(formData.category),
      description: formData.description,
    };

    setIsSubmitting(true);

    try {
      const res = await updateApp(id, appData);
      if (res) {
        onCreate(appData);
        setBannerType("success");
        setBannerMessage("App updated successfully");
        setBannerOpen(true);

        setTimeout(() => {
          setBannerOpen(false);
        }, 2000);
      }
    } catch (err) {
      setBannerType("error");
      setBannerMessage(
        `An error occurred while updating the app. Please try again. Error: ${err}`
      );
      setBannerOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* Validation Errors */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "App name is required";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.url) {
      newErrors.url = "URL is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Only require icon if creating a new app
    if (formData.icon === "") {
      newErrors.icon = "App icon is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* Navigates to previous page */
  function handleBackClick() {
    navigate("/admin/apps");
  }

  /* If editing an app -> return the app's name
  If new -> return 'New App' */
  function getPageTitle() {
    if (appToEdit) {
      return `${appToEdit.name}`;
    }
    return "New App";
  }

  /* Resets appToEdit upon selecting new app button */
  function onCreate(newApp) {
    setAppToEdit(newApp);
    setIsEditing(true);
    setBannerOpen(true);
  }

  /* Changes active tab */
  function handleTabChange(tabId) {
    setActiveTab(tabId);
  }

  /* Handles New App button click */
  function handleNewApp() {
    setAppToEdit(null);
    setFormData(initialFormData);
    setIsEditing(false);
    setErrors({});
  }

  /* Handles delete button */
  function handleDelete() {
    setDangerModalOpen(true);
  }

  /* Handles delete confirmation on modal */
  async function confirmDelete() {
    try {
      // Close modal immediately when Accept is clicked
      setDangerModalOpen(false);

      // Find the next app to navigate to before deletion
      const appIndex = apps.findIndex((app) => app.id === Number(id));
      const nextApp = apps[appIndex + 1];

      // Delete the app
      await deleteApp(id);

      // Navigate to next app or list
      if (nextApp) {
        navigate(`/admin/apps/${nextApp.id}`);
      } else {
        navigate("/admin/apps");
      }

      // Show success banner after navigation
      setBannerType("success");
      setBannerAction("delete");
      setBannerMessage("App deleted successfully");
      setBannerOpen(true);
      setTimeout(() => {
        setBannerOpen(false);
      }, 2000);
    } catch (error) {
      setBannerType("error");
      setBannerMessage(`Error deleting app: ${error}`);
      setBannerOpen(true);
    }
  }

  /* Handles app duplication */
  async function duplicateApp() {
    if (!appToEdit) return;

    const appData = {
      name: `${appToEdit.name} (Copy)`,
      icon: appToEdit.icon,
      url: `${appToEdit.url}-copy`,
      category: appToEdit.category,
      description: appToEdit.description,
    };

    setIsSubmitting(true);

    try {
      const res = await createApp(appData);

      if (res && res.id) {
        setBannerType("success");
        setBannerMessage("App duplicated successfully");
        navigate(`/admin/apps/${res.id}`);
      }
    } catch (err) {
      setBannerType("error");
      setBannerMessage(
        `An error occurred while duplicating the app. Please try again. Error: ${err}`
      );
      setBannerOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Navigation handlers
  const handlePrevApp = () => {
    if (currentAppIndex > 0) {
      const prevApp = apps[currentAppIndex - 1];
      navigate(`/admin/apps/${prevApp.id}`);
    }
  };

  const handleNextApp = () => {
    if (currentAppIndex < apps.length - 1) {
      const nextApp = apps[currentAppIndex + 1];
      navigate(`/admin/apps/${nextApp.id}`);
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-18 right-0 w-auto sm:w-full z-50">
        <Banner
          type={bannerType}
          open={bannerOpen}
          setOpen={setBannerOpen}
          className={`transition-opacity duration-600 ${
            bannerOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {bannerMessage}
        </Banner>
      </div>

      <div className="m-1.5">
        <ModalBlank
          id="danger-modal"
          modalOpen={dangerModalOpen}
          setModalOpen={setDangerModalOpen}
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
                  {appToEdit ? `Delete ${appToEdit.name}?` : "Delete App?"}
                </div>
              </div>
              {/* Modal content */}
              <div className="text-sm mb-10">
                <div className="space-y-2">
                  <p>
                    Are you sure you want to delete this app? This action cannot
                    be undone.
                  </p>
                </div>
              </div>
              {/* Modal footer */}
              <div className="flex flex-wrap justify-end space-x-2">
                <button
                  className="btn-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDangerModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-sm bg-red-500 hover:bg-red-600 text-white"
                  onClick={confirmDelete}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </ModalBlank>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl relative">
        <div className="px-4 sm:px-6 lg:px-8 pt-8 w-full max-w-[96rem] mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <button
                className="btn text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-600 mb-2 pl-0 focus:outline-none shadow-none"
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
                <span>Back to Apps</span>
              </button>
            </div>

            <div className="flex">
              {isEditing && (
                <div className="m-1.5">
                  {/* Filter button */}
                  <AppDropdownFilter
                    onDelete={handleDelete}
                    onDuplicate={duplicateApp}
                    align="right"
                  />
                </div>
              )}

              <div className="m-1.5">
                <button
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                  onClick={handleNewApp}
                >
                  New
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
              {getPageTitle()}
            </h1>

            <div className="flex items-center pr-1">
              {isEditing && apps.length > 1 && (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    {currentAppIndex + 1} / {apps.length}
                  </span>
                  <button
                    className={`btn shadow-none p-1`}
                    title="Previous"
                    onClick={handlePrevApp}
                    disabled={currentAppIndex <= 0}
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        currentAppIndex <= 0
                          ? "text-gray-200 dark:text-gray-700"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-600"
                      }`}
                      width="24"
                      height="24"
                      viewBox="0 0 18 18"
                    >
                      <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
                    </svg>
                  </button>

                  <button
                    className={`btn shadow-none p-1`}
                    title="Next"
                    onClick={handleNextApp}
                    disabled={currentAppIndex >= apps.length - 1}
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        currentAppIndex >= apps.length - 1
                          ? "text-gray-200 dark:text-gray-700"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-600"
                      }`}
                      width="24"
                      height="24"
                      viewBox="0 0 18 18"
                    >
                      <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"></path>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="relative mt-4 mb-8">
              <div
                className="absolute bottom-0 w-full h-px bg-gray-200 dark:bg-gray-700/60"
                aria-hidden="true"
              ></div>
              <ul className="relative text-sm font-medium flex flex-nowrap -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-scroll no-scrollbar">
                {tabs.map((tab) => (
                  <li
                    key={tab.id}
                    className="mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8"
                  >
                    <button
                      className={`pb-3 whitespace-nowrap border-b-2 ${
                        activeTab === tab.id
                          ? "text-violet-500 border-violet-500"
                          : "text-gray-500 border-transparent"
                      }`}
                      onClick={() => handleTabChange(tab.id)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-8 w-full max-w-[96rem] mx-auto">
          <form onSubmit={isEditing ? handleUpdate : handleSubmit}>
            {activeTab === 1 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* App Name */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      App Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      className={`form-input w-full ${
                        errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter app name"
                    />
                    {errors.name && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Icon Selection (Replacing Category) */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="selectedIcon"
                    >
                      Icon <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      {/* Icon Dropdown */}
                      <select
                        id="icon"
                        className={`form-select flex-1 ${
                          errors.icon
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                        value={formData.icon}
                        onChange={handleIconSelection}
                      >
                        <option value="">Select an icon</option>
                        {icons.map((icon, index) => (
                          <option key={index} value={index}>
                            {icon.label}
                          </option>
                        ))}
                      </select>

                      {/* Icon Preview */}
                      <div className="h-10 w-10 min-w-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                        {formData.icon ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-6 h-6 text-gray-600 dark:text-gray-300"
                          >
                            <path d={icons[formData.icon].svgPath} />
                          </svg>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs text-center">
                            No icon
                          </span>
                        )}
                      </div>
                    </div>
                    {errors.icon && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{errors.icon}</span>
                      </div>
                    )}
                  </div>

                  {/* URL */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="url"
                    >
                      App URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="url"
                      className={`form-input w-full ${
                        errors.url
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      type="text"
                      value={formData.url}
                      onChange={handleChange}
                      placeholder="/url"
                    />
                    {errors.url && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{errors.url}</span>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="category"
                    >
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      className={`form-select w-full ${
                        errors.category
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option
                          key={category.id}
                          id={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{errors.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Description - Full width */}
                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="description"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      className={`form-textarea w-full h-24 ${
                        errors.description
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe what this app does"
                    />
                    {errors.description && (
                      <div className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{errors.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="btn border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                    onClick={handleBackClick}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-gray-800"
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
                        Saving...
                      </>
                    ) : isEditing ? (
                      "Update"
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AppFormContainer;
