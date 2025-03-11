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
    <div className="bg-white rounded-lg shadow-md flex flex-col">
      <div className="w-full h-64 mb-4">
        {hardware?.image ? (
          <img src={hardware.image} alt={hardware.name} className="w-full h-full object-cover rounded-t-lg" />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">🖥️</span>
          </div>
        )}
      </div>
      <div className="p-4 ">
        <h3 className="text-lg font-semibold">{hardware.name}</h3>
        <p className="text-gray-600">
          Specs: {hardware.cpu} {hardware.memory}
        </p>
        <p className="text-gray-600">Location: {hardware.location}</p>
        <button
          onClick={handleViewDetails} // Add onClick handler
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          View Details
        </button>
      </div>
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
