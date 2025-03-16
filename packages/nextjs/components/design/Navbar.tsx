"use client";

import { useState } from "react";
import Link from "next/link";
import { RainbowKitCustomConnectButton } from "../scaffold-eth";
import { FiMenu, FiX } from "react-icons/fi";

// Use Feather icons

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between px-64 py-5 border-b-2 bg-white shadow-sm">
      {/* Left Side: Logo and Navigation Links - On Medium+ Screens */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-gray-800 mr-8">
          XCompute
        </Link>

        {/* Navigation Links - Hidden on Mobile, Shown on Medium+ Screens */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-600 hover:text-gray-800 text-md  font-medium transition-colors">
            Home
          </Link>
          <Link
            href="/marketplace"
            className="text-gray-600 hover:text-gray-800 text-md  font-medium transition-colors"
          >
            Marketplace
          </Link>
          <a href="#" className="text-gray-600 hover:text-gray-800 text-md  font-medium transition-colors">
            How It Works
          </a>
        </div>
      </div>

      {/* Right Side: Buttons - Hidden on Mobile, Shown on Medium+ Screens */}
      <div className="hidden md:flex items-center space-x-4">
        <RainbowKitCustomConnectButton />
        <Link
          href="/create-listing"
          className="px-4 py-2 text-white bg-gray-900 rounded hover:bg-gray-800 text-sm  font-medium transition-colors"
        >
          List Your Hardware
        </Link>
      </div>

      {/* Hamburger/Toggle Icon for Mobile - Hidden on Medium+ Screens */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Full-Screen Menu - Shown only on Mobile when isMenuOpen is true */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white bg-opacity-95 z-50 flex flex-col items-center justify-center space-y-8 p-6 shadow-lg animate-slideIn">
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors"
            aria-label="Close menu"
          >
            <FiX className="text-2xl" />
          </button>
          <div className="flex flex-col items-center space-y-6">
            <Link
              href="/"
              className="text-gray-800 hover:text-gray-600 text-xl font-medium transition-colors"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <a
              href="#"
              className="text-gray-800 hover:text-gray-600 text-xl font-medium transition-colors"
              onClick={toggleMenu}
            >
              Marketplace
            </a>
            <a
              href="#"
              className="text-gray-800 hover:text-gray-600 text-xl font-medium transition-colors"
              onClick={toggleMenu}
            >
              How It Works
            </a>
            <a
              href="#"
              className="text-gray-800 hover:text-gray-600 text-xl font-medium transition-colors"
              onClick={toggleMenu}
            >
              Features
            </a>
            <RainbowKitCustomConnectButton />
            <Link
              href="/create-listing"
              className="px-4 py-2 text-white bg-gray-900 rounded hover:bg-gray-800 text-md  font-medium transition-colors"
              onClick={toggleMenu}
            >
              List Your Hardware
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
