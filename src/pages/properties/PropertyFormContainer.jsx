import React, {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";

const propertyProfile = {
  id: "PROP-4521",
  address: "1287 Westbrook Avenue",
  city: "Evergreen",
  state: "CO",
  zip: "80401",
  price: 785000,
  rooms: 4,
  squareFeet: 2680,
  healthScore: 82,
  mainPhoto:
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  summary:
    "Recently updated colonial home with modern systems, solar, smart security, and low-maintenance landscaping.",
  agentId: "USR-002",
  homeownerIds: ["USR-201", "USR-204"],
  healthHighlights: [
    {
      label: "Roof",
      status: "Good",
      note: "Replaced in 2021 with 30-year architectural shingles.",
    },
    {
      label: "HVAC",
      status: "Needs Attention",
      note: "Annual service overdue by two months.",
    },
    {
      label: "Foundation",
      status: "Good",
      note: "No cracks detected in latest inspection.",
    },
  ],
  photos: [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  ],
  maintenanceHistory: [
    {
      id: "MT-2311",
      date: "2024-08-04",
      title: "Quarterly HVAC Service",
      status: "Scheduled",
      notes: "Filter replacement and condenser cleaning.",
    },
    {
      id: "MT-2265",
      date: "2024-04-17",
      title: "Exterior Paint Refresh",
      status: "Completed",
      notes: "Repainted siding and trim. Touch-up required in spring.",
    },
    {
      id: "MT-2198",
      date: "2023-12-02",
      title: "Gutter Cleaning",
      status: "Completed",
      notes: "Cleared all gutters and installed new guards.",
    },
  ],
  documents: [
    {
      id: "DOC-8841",
      name: "Inspection Report - May 2024.pdf",
      type: "PDF",
      size: "2.1 MB",
      updatedAt: "2024-05-22",
    },
    {
      id: "DOC-8732",
      name: "Solar Performance Summary.csv",
      type: "CSV",
      size: "780 KB",
      updatedAt: "2024-03-18",
    },
    {
      id: "DOC-8510",
      name: "Insurance Policy - 2024.pdf",
      type: "PDF",
      size: "1.4 MB",
      updatedAt: "2024-01-08",
    },
  ],
};

const platformUsers = [
  {id: "USR-001", name: "Amelia Barton", role: "Agent"},
  {id: "USR-002", name: "Marcus Reed", role: "Agent"},
  {id: "USR-003", name: "Olivia Park", role: "Agent"},
  {id: "USR-201", name: "Jordan Lee", role: "Homeowner"},
  {id: "USR-202", name: "Priya Patel", role: "Homeowner"},
  {id: "USR-203", name: "Noah Garcia", role: "Homeowner"},
  {id: "USR-204", name: "Lena Ortiz", role: "Homeowner"},
];

const tabs = [
  {id: "info", label: "Information"},
  {id: "photos", label: "Photos"},
  {id: "maintenance", label: "Maintenance History"},
  {id: "documents", label: "Documents"},
];

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const createInitialPropertyState = () => ({
  ...propertyProfile,
  homeownerIds: [...propertyProfile.homeownerIds],
  photos: [...propertyProfile.photos],
  healthHighlights: propertyProfile.healthHighlights.map((highlight) => ({
    ...highlight,
  })),
  maintenanceHistory: propertyProfile.maintenanceHistory.map((item) => ({
    ...item,
  })),
  documents: propertyProfile.documents.map((doc) => ({...doc})),
});

function PropertyFormContainer() {
  const navigate = useNavigate();
  const [propertyData, setPropertyData] = useState(createInitialPropertyState);
  const [activeTab, setActiveTab] = useState("info");
  const [formChanged, setFormChanged] = useState(false);

  const agentOptions = useMemo(
    () => platformUsers.filter((user) => user.role === "Agent"),
    []
  );

  const homeownerOptions = useMemo(
    () => platformUsers.filter((user) => user.role === "Homeowner"),
    []
  );

  const handleInputChange = (event) => {
    const {name, value} = event.target;
    setPropertyData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "squareFeet" || name === "rooms"
          ? Number(value)
          : value,
    }));
    setFormChanged(true);
  };

  const handleAgentChange = (event) => {
    const agentId = event.target.value;
    setPropertyData((prev) => ({...prev, agentId}));
    setFormChanged(true);
  };

  const handleHomeownerToggle = (id) => {
    setPropertyData((prev) => {
      const homeownerIds = prev.homeownerIds.includes(id)
        ? prev.homeownerIds.filter((homeownerId) => homeownerId !== id)
        : [...prev.homeownerIds, id];
      return {...prev, homeownerIds};
    });
    setFormChanged(true);
  };

  const handleBackToProperties = () => navigate("/properties");
  const handleNewProperty = () => navigate("/properties/new");

  const handleCancelChanges = () => {
    setPropertyData(createInitialPropertyState());
    setFormChanged(false);
  };

  const handleUpdate = () => {
    // Placeholder for future API integration
    setFormChanged(false);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          className="btn text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 shadow-none px-0"
          onClick={handleBackToProperties}
        >
          <svg
            className="fill-current shrink-0 mr-2"
            width="18"
            height="18"
            viewBox="0 0 18 18"
          >
            <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
          </svg>
          <span className="text-base font-medium">Properties</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            className="btn bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
            onClick={handleNewProperty}
          >
            Add Property
          </button>
        </div>
      </div>

      <header className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/5">
          <div className="relative overflow-hidden rounded-2xl h-64 md:h-full bg-gray-100">
            <img
              src={propertyData.mainPhoto}
              alt={propertyData.address}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold tracking-wide uppercase text-gray-400">
              Property ID
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200">
              {propertyData.id}
            </span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white">
              {propertyData.address}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {propertyData.city}, {propertyData.state} {propertyData.zip}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500">Price</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency.format(propertyData.price)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500">Rooms</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {propertyData.rooms}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500">Square Ft</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {propertyData.squareFeet.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500">Health Score</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {propertyData.healthScore}%
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {propertyData.summary}
          </p>
        </div>
      </header>

      <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Property Health
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6">
            <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
              Overall Health
            </p>
            <p className="text-5xl font-semibold text-indigo-900 dark:text-white mt-2">
              {propertyData.healthScore}%
            </p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2">
              Trending ↑ 4% vs last quarter
            </p>
          </div>
          <div className="flex-1 space-y-4">
            {propertyData.healthHighlights.map((highlight) => (
              <div
                key={highlight.label}
                className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {highlight.label}
                  </p>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      highlight.status === "Good"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {highlight.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {highlight.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-800 px-6">
          <nav className="flex flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 text-sm font-medium transition border-b-2 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {activeTab === "info" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Property Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={propertyData.address}
                      onChange={handleInputChange}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={propertyData.city}
                      onChange={handleInputChange}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={propertyData.state}
                      onChange={handleInputChange}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Zip
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={propertyData.zip}
                      onChange={handleInputChange}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={propertyData.price}
                      onChange={handleInputChange}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Rooms
                    </label>
                    <input
                      type="number"
                      name="rooms"
                      value={propertyData.rooms}
                      onChange={handleInputChange}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Square Feet
                    </label>
                    <input
                      type="number"
                      name="squareFeet"
                      value={propertyData.squareFeet}
                      onChange={handleInputChange}
                      className="form-input w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Summary
                    </label>
                    <textarea
                      name="summary"
                      value={propertyData.summary}
                      onChange={handleInputChange}
                      className="form-input w-full min-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  People
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Assigned Agent
                    </label>
                    <select
                      value={propertyData.agentId}
                      onChange={handleAgentChange}
                      className="form-select w-full"
                    >
                      <option value="">Select an agent</option>
                      {agentOptions.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Homeowners
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {homeownerOptions.map((homeowner) => (
                        <label
                          key={homeowner.id}
                          className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${
                            propertyData.homeownerIds.includes(homeowner.id)
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={propertyData.homeownerIds.includes(
                              homeowner.id
                            )}
                            onChange={() => handleHomeownerToggle(homeowner.id)}
                            className="form-checkbox text-indigo-600"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {homeowner.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "photos" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {propertyData.photos.map((photo, index) => (
                <div
                  key={photo}
                  className="relative overflow-hidden rounded-2xl h-48 bg-gray-100"
                >
                  <img
                    src={photo}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-4">
              {propertyData.maintenanceHistory.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <p className="text-sm text-gray-400">{item.date}</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.notes}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      item.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-3">
              {propertyData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {doc.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {doc.type} · {doc.size}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">
                    Updated {doc.updatedAt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {formChanged && (
        <div className="sticky bottom-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md px-6 py-4 flex flex-wrap items-center justify-end gap-3">
          <button
            className="btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200"
            onClick={handleCancelChanges}
          >
            Cancel
          </button>
          <button
            className="btn bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleUpdate}
          >
            Update Property
          </button>
        </div>
      )}
    </div>
  );
}

export default PropertyFormContainer;
