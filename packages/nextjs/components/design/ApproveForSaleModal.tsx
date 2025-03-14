import React, { useState } from "react";
import KeyValueGrid from "./KeyValueGrid";
import toast from "react-hot-toast";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Api from "~~/utils/api";
import { signAndSendTransaction } from "~~/utils/web3Utils";

const ApproveForSaleModal = ({ hardware, onClose }: any) => {
  const max = hardware?.token?.totalSupply - hardware?.token?.availableForSale;
  const [tokenAmount, setTokenAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const handleApproveForSale = async () => {
    if (!tokenAmount || parseInt(tokenAmount) <= 0 || parseInt(tokenAmount) > max) {
      toast.error("Please enter a valid token amount (1 to " + max + ").");
      return;
    }

    // ✅ Use the updated state
    if (!isConnected) {
      connect({ connector: injected() });
    }
    console.log("connected", address);

    setIsLoading(true);
    try {
      const response = await Api.post("/get-token-approval-tx", {
        numberOfTokens: parseInt(tokenAmount),
        daoAddress: hardware?.dao?.address,
        userAddress: address,
      });

      const signTxn = await signAndSendTransaction(window.ethereum, response?.data?.tx);

      if (signTxn) {
        console.log("transaction signed successfully");
        console.log("Token Approval TX:", response?.data?.tx);

        const fractionalizeResponse = await Api.post("/get-fractionalize-tokens-tx", {
          numberOfTokens: parseInt(tokenAmount),
          daoAddress: hardware?.dao?.address,
          userAddress: address,
        });

        const signTxnFractionalize = await signAndSendTransaction(window.ethereum, fractionalizeResponse?.data?.tx);
        console.log("Fractionalize Tokens TX:", signTxnFractionalize);
      }

      toast.success("Token approval transaction generated successfully!");
      onClose();
    } catch (error) {
      console.error("Error approving tokens:", error);
      toast.error("Failed to approve tokens. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          max={max}
          value={tokenAmount}
          onChange={e => setTokenAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter token amount"
        />
      </div>
      <KeyValueGrid
        items={[
          { key: "Token Price", value: `${hardware?.token?.tokenPrice}` },
          { key: "Total Value", value: totalCost }, // Could be calculated as tokenAmount * tokenPrice if needed
        ]}
      />
      <div className="mt-6 flex justify-end gap-4">
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={handleApproveForSale}
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Approve For Sale"}
        </button>
      </div>
    </div>
  );
};

export default ApproveForSaleModal;
