"use client";

import { useState } from "react";
import ApproveForSaleModal from "./ApproveForSaleModal";
import BuyTokenModal from "./BuyTokenModal";
import Modal from "./Modal";
import toast, { Toaster } from "react-hot-toast";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Api from "~~/utils/api";
import { useWeb3Store } from "~~/utils/web3Store";
import { signAndSendTransaction } from "~~/utils/web3Utils";

export const HardwareActionPanel = ({ refetch }: any) => {
  const [isBuyTokenModalOpen, setIsBuyTokenModal] = useState(false);
  const [isApproveModalOpen, setIsApproveTokenModal] = useState(false);

  // Properly subscribe to Zustand store
  const { isDaoMember, isMarketplaceOwner, hardware } = useWeb3Store();

  const availablePercentage =
    (parseFloat(hardware.token.availableForSale) / parseFloat(hardware.token.totalSupply)) * 100;

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const handleRentClick = async () => {
    console.log("Renting hardware...");
    if (!isConnected) {
      connect({ connector: injected() });
      return; // Exit early to let the connection happen first
    }

    console.log("Connected:", address);
    try {
      const response = await Api.post("/become-tenant", {
        daoAddress: hardware?.dao?.address,
        userAddress: address,
      });

      if (response?.data?.tx) {
        const signTxn = await signAndSendTransaction(window.ethereum, response?.data?.tx);

        if (signTxn) {
          console.log("Transaction signed successfully");
          toast.success("Transaction signed successfully.");

          // Refresh the tenant status after successful transaction
          try {
            const { setIsTenant } = useWeb3Store.getState();
            setIsTenant(true);
            refetch();
          } catch (err) {
            console.error("Failed to update tenant status:", err);
          }
        }
      } else {
        // Handle failed API response
        toast.error("Failed to submit rental proposal. Please try again.");
      }
    } catch (error) {
      console.error("Error during rent API call:", error);
      toast.error("An error occurred while submitting your rental proposal.");
    }
  };

  // Debug render
  console.log("Rendering with isMarketplaceOwner:", isMarketplaceOwner);

  return (
    <>
      <div className="w-1/3 border-[1px] border-gray-200 rounded-lg h-full opacity-0 transform translate-y-10 transition-all duration-1000 ease-out animate-fadeInUp">
        <Toaster />
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-2xl mt-3 font-bold">Take Action</h3>
          <div className="">
            <div className="mb-4 text-gray-400">Rent this hardware or buy ownership tokens</div>
            <div className="grid grid-cols-2 gap-y-2 mx-3 my-6">
              <div className="text-gray-400 font-medium text-left text-md">Token Price</div>
              <div className=" text-left text-md">{hardware?.token?.tokenPrice || "N/A"}</div>
              <div className="text-gray-400 font-medium text-left text-md">Rental Price</div>
              <div className=" text-left text-md">{hardware?.hardware?.rentalPrice || "N/A"}</div>
            </div>
            <div className="m-2 p-5 bg-gray-50">
              <div className="text-md font-bold">Ownership Details</div>
              <div className="text-gray-600 text-sm mb-4">
                Purchase tokens to own a share of this hardware and earn rental income.
              </div>
              <div className="w-full mb-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-gray-600">Available Tokens</div>
                  <div>
                    {hardware?.token?.availableForSale} / {hardware?.token?.totalSupply}
                  </div>
                </div>
                <div className="w-full h-2 rounded-full mb-4 bg-gray-300">
                  {/* Black part representing availableForSale */}
                  <div
                    className="h-2 rounded-l-full bg-black"
                    style={{
                      width: `${availablePercentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {hardware?.hardware?.status === "Available" ? (
                <button
                  onClick={handleRentClick}
                  className="mt-4 mb-2 bg-black text-white px-3 py-2 text-md rounded w-full"
                >
                  Rent Hardware
                </button>
              ) : (
                <button
                  disabled
                  className="mt-4 mb-2 bg-gray-100 border-black text-black px-3 py-2 text-md rounded w-full"
                >
                  Currently rented
                </button>
              )}
              <button
                onClick={() => setIsBuyTokenModal(true)}
                className="mt-4 bg-white text-md text-black px-3 py-2 rounded w-full border border-gray-300 hover:bg-gray-50"
              >
                Buy Tokens
              </button>

              {/* Conditionally render based on isDaoMember or isMarketplaceOwner */}
              {(isDaoMember || isMarketplaceOwner) && (
                <button
                  onClick={() => setIsApproveTokenModal(true)}
                  className="mt-4 bg-white px-3 text-black border py-2 text-md rounded w-full"
                >
                  {" "}
                  ✓ Approve For Sale
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      <Modal
        isOpen={isBuyTokenModalOpen}
        onClose={() => setIsBuyTokenModal(false)}
        title="Buy Hardware Tokens"
        description="Enter the number of tokens you want to purchase."
      >
        <BuyTokenModal
          onClose={() => {
            setIsBuyTokenModal(false);
            refetch();
          }}
          hardware={hardware}
        />
      </Modal>
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveTokenModal(false)}
        title="Approve Tokens For Sale"
        description="Select how many tokens you want to make available for sale on the marketplace."
      >
        <ApproveForSaleModal
          onClose={() => {
            setIsApproveTokenModal(false);
            refetch();
          }}
          hardware={hardware}
        />
      </Modal>
    </>
  );
};
