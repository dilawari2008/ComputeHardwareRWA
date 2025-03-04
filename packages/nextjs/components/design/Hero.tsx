// Hero.js
import React from "react";

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Main Title */}
      <h1 className="md:text-6xl text-3xl font-bold text-gray-900 mb-6 text-center">
        Fractional Ownership
        <br />
        of Computing Hardware
      </h1>

      {/* Subtitle */}
      <p className="md:text-xl text-sm text-gray-600 mb-8 text-center max-w-2xl">
        Own a share of high-performance GPUs, ASICs, and other computing hardware. Earn passive income from rentals, or
        sell your share on our marketplace.
      </p>

      {/* Buttons */}
      <div className="space-x-4">
        <button className="md:px-6 px-4 py-2 md:py-3 text-white bg-gray-900 rounded hover:bg-gray-800">
          Explore Marketplace
        </button>
        <button className="md:px-6 px-4 py-2 md:py-3 text-gray-900 border border-gray-300 rounded hover:bg-gray-100">
          List Your Hardware
        </button>
      </div>
    </section>
  );
};

export default Hero;
