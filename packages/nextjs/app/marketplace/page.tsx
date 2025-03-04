"use client";

import { useState } from "react";
import Link from "next/link";
import { HardwareCard } from "~~/components/design/HardwareCard";

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const hardwareData = [
    {
      id: 1,
      name: "NVIDIA A100",
      specs: "NVIDIA A100 80GB",
      location: "US East",
      imageUrl: "/path/to/nvidia-a100.jpg",
    },
    {
      id: 2,
      name: "AMD MI250X",
      specs: "AMD Instinct MI250X 128GB",
      location: "EU Central",
      imageUrl: "/path/to/amd-mi250x.jpg",
    },
    {
      id: 3,
      name: "Google TPU v4",
      specs: "Google TPU v4 64GB",
      location: "Asia Pacific",
      imageUrl: "/path/to/google-tpu-v4.jpg",
    },
    {
      id: 4,
      name: "Intel Gaudi 2",
      specs: "Intel Gaudi 2 96GB",
      location: "US West",
      imageUrl: "/path/to/intel-gaudi-2.jpg",
    },
  ];

  const filteredHardware = hardwareData.filter(
    hardware =>
      hardware.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hardware.specs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hardware.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <main className="flex-1 mx-auto p-4" style={{ width: "80vw", height: "100vh" }}>
      <h1 className="text-3xl font-bold mb-4 mt-4">Compute Hardware Marketplace</h1>
      <p className="text-gray-600 mb-6">
        Browse all available high-performance computing hardware for fractional ownership and rental.
      </p>
      <div className="mb-12 flex items-center justify-between w-full">
        <input
          type="text"
          placeholder="Search hardware..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="p-2 border rounded"
          style={{ width: "80%" }}
        />
        <Link
          href="/create-listing"
          className="px-4 py-2 text-white bg-gray-900 rounded hover:bg-gray-800 text-lg font-medium transition-colors"
        >
          List Your Hardware
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {filteredHardware.map(hardware => (
          <HardwareCard key={hardware.id} hardware={hardware} />
        ))}
      </div>
    </main>
  );
};

export default Marketplace;
