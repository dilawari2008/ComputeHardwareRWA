import React, { useEffect, useState } from "react";
import KeyValueGrid from "./KeyValueGrid";
import toast from "react-hot-toast";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Api from "~~/utils/api";
import { signAndSendTransaction } from "~~/utils/web3Utils";

const PraposeRentPrieModal = ({ hardware, onClose }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const [rentalPrice, setRentalPrice] = useState("");
  const [averageCpuUtilization, setAverageCpuUtilization] = useState("");
  const [newRentalPrice, setNewRentalPrice] = useState("");

  const [isLoadingCpu, setIsLoadingCpu] = useState(true);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!hardware?.dao?.address) return;

      try {
        // Fetch both API endpoints in parallel
        const [cpuResponse, priceResponse] = await Promise.all([
          Api.post("/average-cpu-utilization", {
            daoAddress: hardware.dao.address,
          }),
          Api.post("/rental-price", {
            daoAddress: hardware.dao.address,
          }),
        ]);

        // @ts-ignore
        setAverageCpuUtilization(cpuResponse?.data || "0");
        // @ts-ignore
        const price = priceResponse?.data?.rentalPriceEth || "0";
        setRentalPrice(price);
        setNewRentalPrice(price); // Set initial value of input field
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setIsLoadingCpu(false);
        setIsLoadingPrice(false);
      }
    };

    fetchData();
  }, [hardware?.dao?.address]);

  const handleSubmitProposal = async () => {
    if (!newRentalPrice || parseFloat(newRentalPrice) <= 0) {
      toast.error("Please enter a valid rental price (greater than 0).");
      return;
    }
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }
    console.log("connected", address);

    setIsLoading(true);
    try {
      const response = await Api.post("/propose-new-rental-price", {
        daoAddress: hardware?.dao?.address,
        userAddress: address,
        newRentalPrice: parseFloat(newRentalPrice),
      });

      console.log("Proposal TX:", response.data);
      // @ts-ignore
      const signTxn = await signAndSendTransaction(window.ethereum, response?.data?.tx);
      if (signTxn) {
        toast.success("Proposal submitted successfully!");
        setNewRentalPrice(""); // Reset input after success
        onClose();
      }
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
      <KeyValueGrid
        items={[
          { key: "Current Price", value: `${hardware?.hardware?.rentalPrice}` },
          { key: " ", value: " " },
          { key: " ", value: " " },
          { key: " ", value: " " },
          { key: "------------------------------------", value: "------------------------------", separator: true },
          { key: "Smart Insights", value: " ", important: true },
          {
            key: "Smart Price Suggestion",
            value: isLoadingPrice ? (
              <div className="w-16 h-5 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              `${rentalPrice} ETH / day`
            ),
          },
          {
            key: "Average CPU Utilization",
            value: isLoadingCpu ? (
              <div className="w-16 h-5 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              `${averageCpuUtilization} %`
            ),
          },
          { key: "------------------------------------", value: "------------------------------", separator: true },
        ]}
      />
      <div className="mt-2 ml-4 text-md text-gray-400">Your proposal requires a 60% majority vote to pass.</div>
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitProposal}
          disabled={isLoading || isLoadingCpu || isLoadingPrice}
          className="px-4 py-2 bg-black text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Submit Proposal"}
        </button>
      </div>
    </div>
  );
};

export default PraposeRentPrieModal;
