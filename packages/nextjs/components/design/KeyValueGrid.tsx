import React from "react";
import Image from "next/image";

interface KeyValuePair {
  key: string;
  value: string | number | undefined;
  onClick?: () => void;
  icon?: React.ReactNode;
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
            <div className="text-gray-400 font-medium text-left text-md">
              {item.key}
              {item.icon && <Image src={item.icon} alt="icon" className="inline-block w-4 h-4 ml-2" />}
            </div>
            <div className="text-left text-md cursor-pointer" onClick={item.onClick ? () => item.onClick() : undefined}>
              {item.value || "N/A"}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default KeyValueGrid;
