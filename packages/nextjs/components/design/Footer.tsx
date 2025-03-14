// Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white py-8 px-8">
      {/* Top Section: Three Columns */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Left Column: Title */}
        <div className="flex-1 p-4 mr-4">
          <h3 className="text-2xl font-bold mb-4">Fractional Compute Marketplace</h3>
          <p className="text-gray-400 text-md w-3/5">
            A revolutionary platform for fractionalized ownership and rental of high-performance computing hardware
            through decentralized autonomous organizations.
          </p>
        </div>

        <div className="flex-1 p-4 mr-4 flex-col">
          <div className="flex flex-col md:flex-row w-full">
            <div className="flex-1 p-4">
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Marketplace
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Statistics
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Column: Resources */}
            <div className="flex-1 p-4">
              <h4 className="text-xl font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright and Links */}
      <div className="w-full mt-8 border-t border-gray-800 pt-4 px-4 text-gray-500 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 Fractional Compute Marketplace. All rights reserved.</p>
          <div className="space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
