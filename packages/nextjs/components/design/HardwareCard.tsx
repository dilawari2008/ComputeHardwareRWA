"use client";

import { useRouter } from "next/navigation";

// Define a type for hardware (optional, see below)

export interface Hardware {
  id: number;
  name: string;
  specs: string;
  location: string;
  image: string;
  cpu: string;
  daoAddress: string;
  memory: string;
}

type HardwareCardProps = {
  hardware: Hardware;
};

export const HardwareCard = ({ hardware }: HardwareCardProps) => {
  const router = useRouter(); // Initialize router for navigation

  const handleViewDetails = () => {
    router.push(`/marketplace/hardware/${hardware?.daoAddress}`);
  };
  return (
    <div className="bg-white rounded-lg shadow-md border-b border-gray-200 flex flex-col mb-4">
      <div className="w-full h-64">
        {hardware?.image ? (
          <img src={hardware.image} alt={hardware.name} className="w-full h-full object-cover rounded-t-lg" />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">🖥️</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{hardware.name}</h3>
        <div className="flex justify-between items-center w-full mb-2">
          <div className="text-gray-600">Specifications</div>
          <div className="text-gray-600">
            {hardware.cpu} {hardware.memory}
          </div>
        </div>
        <div className="flex justify-between items-center w-full">
          <div className="text-gray-600">Location</div>
          <div className="text-gray-600">{hardware.location}</div>
        </div>
      </div>
      <button
        onClick={handleViewDetails} // Add onClick handler
        className="mt-2  bg-black text-white px-4 py-1 rounded-b-md  w-[100%] "
      >
        View Details
      </button>
    </div>
  );
};

// Optional: Define a type for Hardware
export interface Hardware {
  id: number;
  name: string;
  specs: string;
  location: string;
  imageUrl: string;
}
