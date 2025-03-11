import React, { useState } from "react";
import KeyValueGrid from "./KeyValueGrid";
import toast from "react-hot-toast";
import Api from "~~/utils/api";
import { useWeb3Store } from "~~/utils/web3Store";

const PraposeRentPrieModal = ({ hardware }: any) => {
  const [newRentalPrice, setNewRentalPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitProposal = async () => {
    if (!newRentalPrice || parseFloat(newRentalPrice) <= 0) {
      toast.error("Please enter a valid rental price (greater than 0).");
      return;
    }
    const { isConnected, connectWallet, account } = useWeb3Store.getState(); // Get initial state from Zustand

    if (!isConnected || !account) {
      console.log("Wallet not connected, prompting MetaMask...");
      try {
        await connectWallet(); // Connect wallet
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Please connect your wallet to proceed.");
        return;
      }

      const updatedAccount = useWeb3Store.getState().account;
      if (!updatedAccount) {
        alert("Wallet connection failed. Please try again.");
        return;
      }
    }

    // ✅ Use the updated state
    const finalAccount = useWeb3Store.getState().account;
    console.log("Connected wallet:", finalAccount);

    setIsLoading(true);
    try {
      const response = await Api.post("/compute/propose-new-rental-price", {
        daoAddress: hardware?.dao?.address,
        userAddress: finalAccount,
        newRentalPrice: parseFloat(newRentalPrice),
      });

      console.log("Proposal TX:", response.data);
      toast.success("Proposal submitted successfully!");
      setNewRentalPrice("");
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("Failed to submit proposal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="tokenAmount" className="block text-gray-700 text-lg font-medium mb-1">
          New Daily Rental Price (ETH)
        </label>
        <input
          type="number"
          id="tokenAmount"
          name="tokenAmount"
          min="0.01" // Minimum reasonable rental price
          step="0.01"
          value={newRentalPrice}
          onChange={e => setNewRentalPrice(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter rental price"
        />
      </div>
      <KeyValueGrid items={[{ key: "Current Price", value: `${hardware?.hardware?.rentalPrice} ETH` }]} />
      <div className="mt-2 ml-4 text-md text-gray-400">Your proposal requires a 60% majority vote to pass.</div>
      <div className="mt-6 flex justify-end gap-4">
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={handleSubmitProposal}
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Submit Proposal"}
        </button>
      </div>
    </div>
  );
};

export default PraposeRentPrieModal;
