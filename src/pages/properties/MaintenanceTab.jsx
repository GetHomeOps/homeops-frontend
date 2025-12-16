import React, {useState} from "react";
import {Wrench, ChevronDown, ChevronUp} from "lucide-react";

// Collapsible Section Component
function CollapsibleSection({title, icon: Icon, isOpen, onToggle, children}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" style={{color: "#456654"}} />}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function MaintenanceTab({propertyData}) {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Group maintenance items by date or create sections
  // For now, we'll create collapsible sections for each maintenance item
  return (
    <div className="space-y-4">
      {propertyData.maintenanceHistory?.map((item, index) => {
        const sectionId = `maintenance-${item.id || index}`;
        const isOpen = expandedSections[sectionId] || false;

        return (
          <CollapsibleSection
            key={item.id || index}
            title={`${item.title} - ${item.date}`}
            icon={Wrench}
            isOpen={isOpen}
            onToggle={() => toggleSection(sectionId)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{item.date}</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.notes}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    item.status === "Completed"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
}

export default MaintenanceTab;
