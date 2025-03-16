import React from "react";

interface KeyValuePair {
  key: string;
  value: any;
  onClick?: () => void;
  icon?: React.ReactNode;
  important?: boolean;
  separator?: boolean;
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
              className={`text-left text-md ${item.important ? "font-bold text-black underline" : "font-medium text-gray-400"}`}
            >
              {item.key}
            </div>
            <div
              className={`text-left text-md cursor-pointer ${
                item.important ? "font-bold text-black" : item.separator ? "text-gray-400" : ""
              }`}
              // @ts-ignore
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
