import React, {useState, useEffect} from "react";
import {icons} from "../../assets/icons";
import styles from "./AppCard.module.css";

function AppCard({title, iconId}) {
  const [svgContent, setSvgContent] = useState("");

  return (
    <div
      className={`${styles.appCard} flex flex-wrap gap-4 justify-center items-center bg-white sm:w-auto h-auto min-h-[118px] sm:min-h-[118px] min-w-[120px] dark:bg-gray-800 shadow-xs rounded-xl`}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-building-warehouse"
          >
            <path d={icons[iconId].svgPath} />
          </svg>
        </div>
        <h1 className="text-center text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white mt-2">
          {title}
        </h1>
      </div>
    </div>
  );
}

export default AppCard;
