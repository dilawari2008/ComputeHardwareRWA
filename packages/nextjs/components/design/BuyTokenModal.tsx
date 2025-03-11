import React, { useState } from "react";
import KeyValueGrid from "./KeyValueGrid";
import toast from "react-hot-toast";
import Api from "~~/utils/api";
import { useWeb3Store } from "~~/utils/web3Store";

const BuyTokenModal = ({ hardware }: any) => {
  const max = hardware?.token?.availableForSale || 0;
  const [tokenAmount, setTokenAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyTokens = async () => {
    if (!tokenAmount || parseInt(tokenAmount) <= 0 || parseInt(tokenAmount) > max) {
      toast.error("Please enter a valid token amount (1 to " + max + ").");
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
      const response = await Api.post("/compute/buy-tokens", {
        numberOfTokens: parseInt(tokenAmount),
        daoAddress: hardware?.dao?.address,
        userAddress: finalAccount,
      });

      console.log("Buy Tokens TX:", response.data);
      toast.success("Tokens purchased successfully!");
      setTokenAmount(""); // Reset input after success
    } catch (error) {
      console.error("Error buying tokens:", error);
      toast.error("Failed to buy tokens. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate Total Cost dynamically (optional, based on tokenAmount and tokenPrice)
  const totalCost =
    tokenAmount && hardware?.token?.tokenPrice
      ? (parseInt(tokenAmount) * parseFloat(hardware?.token?.tokenPrice)).toFixed(2) + " ETH"
      : "0.00 ETH";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="tokenAmount" className="block text-gray-700 text-sm font-medium mb-1">
          Number of Tokens
        </label>
        <input
          type="number"
          id="tokenAmount"
          name="tokenAmount"
          min="1"
          max={max}
          value={tokenAmount}
          onChange={e => setTokenAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter token amount"
        />
      </div>
      <KeyValueGrid
        items={[
          { key: "Available Tokens", value: hardware?.token?.availableForSale },
          { key: "Token Price", value: `${hardware?.token?.tokenPrice} / token` },
          { key: "Rental Price", value: `${hardware?.hardware?.rentalPrice}` },
          { key: "Total Cost", value: totalCost },
        ]}
      />
      <div className="mt-6 flex justify-end gap-4">
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={handleBuyTokens}
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Buy Tokens"}
        </button>
      </div>
    </div>
  );
};

export default BuyTokenModal;
