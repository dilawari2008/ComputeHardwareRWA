import React from "react";

interface KeyValuePair {
  key: string;
  value: string | number | undefined;
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
            <div className="text-gray-400 font-medium text-left text-lg">{item.key}</div>
            <div className=" text-left text-lg">{item.value || "N/A"}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default KeyValueGrid;
