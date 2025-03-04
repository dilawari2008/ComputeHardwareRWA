"use client";

// Define a type for hardware (optional, see below)

export interface Hardware {
  id: number;
  name: string;
  specs: string;
  location: string;
  imageUrl: string;
}

type HardwareCardProps = {
  hardware: Hardware;
};

export const HardwareCard = ({ hardware }: HardwareCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col">
      <div className="w-full h-64 bg-gray-300 flex items-center justify-center mb-4">
        <span className="text-gray-500">🖥️</span> {/* Placeholder for image */}
      </div>
      <div className="p-4 ">
        <h3 className="text-lg font-semibold">{hardware.name}</h3>
        <p className="text-gray-600">Specs: {hardware.specs}</p>
        <p className="text-gray-600">Location: {hardware.location}</p>
        <button className="mt-4 bg-black text-white px-4 py-2 rounded">View Details</button>
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
