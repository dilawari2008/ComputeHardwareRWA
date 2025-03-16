import React, { useState } from "react";
import KeyValueGrid from "./KeyValueGrid";
import toast from "react-hot-toast";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Api from "~~/utils/api";
import { signAndSendTransaction } from "~~/utils/web3Utils";

const BuyTokenModal = ({ hardware, onClose }: any) => {
  const max = hardware?.token?.availableForSale || 0;
  const [tokenAmount, setTokenAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const handleBuyTokens = async () => {
    if (!tokenAmount || parseInt(tokenAmount) <= 0 || parseInt(tokenAmount) > max) {
      toast.error("Please enter a valid token amount (1 to " + max + ").");
      return;
    }

    if (!isConnected) {
      connect({ connector: injected() });
    }
    console.log("connected", address);

    setIsLoading(true);
    try {
      const response = await Api.post("/buy-tokens", {
        numberOfTokens: parseInt(tokenAmount),
        daoAddress: hardware?.dao?.address,
        userAddress: address,
      });

      // @ts-ignore
      console.log("Buy Tokens TX:", response?.data?.tx);
      // @ts-ignore
      const signTxn = await signAndSendTransaction(window.ethereum, response?.data?.tx);
      if (signTxn) {
        toast.success("Tokens purchased successfully!");
        setTokenAmount(""); // Reset input after success
        onClose();
      }
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
          { key: "Token Price", value: `${hardware?.token?.tokenPrice}` },
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
