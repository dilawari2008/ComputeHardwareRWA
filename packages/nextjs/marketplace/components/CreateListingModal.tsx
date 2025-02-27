"use client";

import { useState } from "react";
import { parseEther } from "viem";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CreateListingModal: React.FC<CreateListingModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    nftName: "",
    nftSymbol: "",
    tokenName: "",
    tokenSymbol: "",
    initialSupply: "",
    initialTokenPrice: "",
    initialRentalPrice: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For numerical inputs, validate and convert
    if (["initialSupply", "initialTokenPrice", "initialRentalPrice"].includes(name)) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert string values to BigInt for contract
    const processedData = {
      ...formData,
      initialSupply: BigInt(parseEther(formData.initialSupply || "0")),
      initialTokenPrice: BigInt(parseEther(formData.initialTokenPrice || "0")),
      initialRentalPrice: BigInt(parseEther(formData.initialRentalPrice || "0")),
    };

    onSubmit(processedData);
  };

  return (
    <div
      className={`z-[5] bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center ${
        !isOpen && "hidden"
      }`}
    >
      <div className="flex flex-col bg-base-100">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-base-content hover:text-base-content/80 transition duration-150 ease-in-out"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-base-content">Create New Compute Listing</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-1">
            <div className="space-y-2">
              <label htmlFor="nftName" className="block text-sm font-medium text-base-content">
                NFT Name
              </label>
              <input
                type="text"
                name="nftName"
                id="nftName"
                className="mt-1 block w-full rounded-md border-black border-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.nftName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="nftSymbol" className="block text-sm font-medium text-base-content">
                NFT Symbol
              </label>
              <input
                type="text"
                name="nftSymbol"
                id="nftSymbol"
                className="mt-1 block w-full rounded-md border-black border-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.nftSymbol}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tokenName" className="block text-sm font-medium text-base-content">
                Token Name
              </label>
              <input
                type="text"
                name="tokenName"
                id="tokenName"
                className="mt-1 block w-full rounded-md border-black border-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.tokenName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tokenSymbol" className="block text-sm font-medium text-base-content">
                Token Symbol
              </label>
              <input
                type="text"
                name="tokenSymbol"
                id="tokenSymbol"
                className="mt-1 block w-full rounded-md border-black border-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.tokenSymbol}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="initialSupply" className="block text-sm font-medium text-base-content">
                Initial Supply (ETH)
              </label>
              <input
                type="text"
                name="initialSupply"
                id="initialSupply"
                className="mt-1 block w-full rounded-md border-black border-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.initialSupply}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="initialTokenPrice" className="block text-sm font-medium text-base-content">
                Initial Token Price (ETH)
              </label>
              <input
                type="text"
                name="initialTokenPrice"
                id="initialTokenPrice"
                className="mt-1 block w-full rounded-md border-black border-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.initialTokenPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="initialRentalPrice" className="block text-sm font-medium text-base-content">
                Initial Rental Price (ETH)
              </label>
              <input
                type="text"
                name="initialRentalPrice"
                id="initialRentalPrice"
                className="mt-1 block w-full rounded-md border-black border-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.initialRentalPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-base-content bg-base-200 rounded hover:bg-base-300 focus:outline-none focus:ring-2 focus:ring-base-300 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-base-content bg-primary rounded hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {isLoading ? "Creating..." : "Create Listing"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListingModal;
