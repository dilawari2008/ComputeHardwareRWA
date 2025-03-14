// Hero.js
import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-35vh)] bg-gradient-to-r from-zinc-50 to-zinc-100 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out animate-fadeInUp">
      {/* Main Title */}
      <h1 className="md:text-6xl text-4xl font-bold text-gray-900 mb-6 text-center opacity-0 transform translate-y-10 transition-all duration-1000 ease-out animate-fadeInUp">
        Fractional Ownership
        <br />
        of Computing Hardware
      </h1>

      {/* Subtitle */}
      <p className="md:text-xl text-sm text-gray-600 mb-8 text-center max-w-2xl opacity-0 transform translate-y-10 transition-all duration-1000 ease-out animate-fadeInUp">
        Own a share of high-performance GPUs, ASICs, and other computing hardware. Earn passive income from rentals, or
        sell your share on our marketplace.
      </p>

      {/* Buttons */}
      <div className="space-x-8 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out animate-fadeInUp">
        <Link
          href="/marketplace"
          className="md:px-6 px-10 py-3 md:py-4 text-white bg-gray-900 rounded hover:bg-gray-800"
        >
          Explore Marketplace
        </Link>
        <Link
          href="/create-listing"
          className="md:px-10 px-10 py-4 md:py-3 bg-white text-gray-900 border border-gray-300 rounded hover:bg-gray-100"
        >
          List Your Hardware
        </Link>
      </div>
    </section>
  );
};

export default Hero;
