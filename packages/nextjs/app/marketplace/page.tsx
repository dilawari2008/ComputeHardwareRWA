"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HardwareCard } from "~~/components/design/HardwareCard";
import Api from "~~/utils/api";

export interface Hardware {
  id: number;
  name: string;
  specs: string;
  location: string;
  imageUrl: string;
}

const Marketplace = () => {
  const [hardware, setHardware] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hardware data on component mount
  useEffect(() => {
    const fetchHardware = async () => {
      try {
        const data = await Api.get("/listing");
        setHardware(data?.data); // Assuming the API returns an array of Hardware objects
      } catch (err) {
        setError("Failed to fetch hardware listings. Please try again later.");
        console.error("Error fetching hardware:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHardware();
  }, []); // Empty dependency array ensures the effect runs only once on mount

  const filteredHardware = hardware.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center w-full bg-white">
      <main className="flex-1 mx-10 py-4 mb-4" style={{ width: "80vw", minHeight: "100vh" }}>
        <div className="opacity-0 transform translate-y-10 transition-all duration-1000 ease-out animate-fadeInUp">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out animate-fadeInUp">
          {filteredHardware.map(hardware => (
            <HardwareCard key={hardware.id} hardware={hardware} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
