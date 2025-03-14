import React from "react";

interface KeyValuePair {
  key: string;
  value: string | number | undefined;
  onClick?: () => void;
  icon?: React.ReactNode;
  important?: boolean;
}

interface KeyValueGridProps {
  items: KeyValuePair[];
  className?: string;
}

const KeyValueGrid: React.FC<KeyValueGridProps> = ({ items, className = "" }) => {
  return (
    <div className={`p-4 ${className}`}>
      <div className="grid grid-cols-2 gap-y-2">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div
              className={` text-left text-md ${item.important ? "font-bold text-black" : "font-medium text-gray-400"}`}
            >
              {item.key}
            </div>
            <div
              className={`text-left text-md cursor-pointer ${item.important ? "font-bold text-black" : ""}`}
              onClick={item.onClick ? () => item.onClick() : undefined}
            >
              {item.value || "N/A"}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default KeyValueGrid;
