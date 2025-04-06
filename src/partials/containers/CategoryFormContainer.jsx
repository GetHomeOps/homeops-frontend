import React, {useState, useEffect} from "react";
import {AlertCircle} from "lucide-react";
import {icons} from "../../assets/icons";

function CategoryFormContainer({appData}) {
  const isEditing = !!appData;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    url: "",
    description: "",
    icon: null,
    selectedIcon: "", // New field for icon selection
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories for the dropdown
  const categories = [
    "Productivity",
    "Finance",
    "Social",
    "Entertainment",
    "Education",
    "Utility",
    "Other",
  ];

  // Populate form data when in edit mode
  useEffect(() => {
    if (appData) {
      setFormData({
        name: appData.name || "",
        category: appData.category || "",
        url: appData.url || "",
        description: appData.description || "",
        icon: appData.icon || null,
        selectedIcon: appData.selectedIcon || "",
      });
    }
  }, [appData]);

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

  const handleIconChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        icon: e.target.files[0],
      }));

      if (errors.icon) {
        setErrors((prev) => ({
          ...prev,
          icon: null,
        }));
      }
    }
  };

  const handleIconSelection = (e) => {
    const selectedIcon = e.target.value;
    setFormData((prev) => ({
      ...prev,
      selectedIcon,
    }));

    if (errors.selectedIcon) {
      setErrors((prev) => ({
        ...prev,
        selectedIcon: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        console.log(`${isEditing ? "Updated" : "Created"} app:`, formData);
        setIsSubmitting(false);
        // You would typically redirect or show success message here
      }, 1000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl relative">
      <form onSubmit={handleSubmit}>
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* App Name */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Category Name <span className="text-red-500">*</span>
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
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              className="btn border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
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
      </form>
    </div>
  );
}

export default CategoryFormContainer;
