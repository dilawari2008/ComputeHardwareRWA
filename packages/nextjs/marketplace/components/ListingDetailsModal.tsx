"use client";

// import { useState } from "react";
// import { useAccount, useContractWrite, useTransaction } from "wagmi";
// import { RWADAO_ABI } from "~~/marketplace/contracts/contractsInfo";
import React from "react";

interface ListingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    daoAddress: string;
    nftContract: string;
    tokenContract: string;
    tokenPrice: string;
    rentalPrice: string;
    isRented: boolean;
    currentTenant?: string;
  };
}
const ListingDetailsModal = ({ isOpen, onClose, listing }: ListingDetailsModalProps) => {
  console.log("isOpen", isOpen);
  console.log("listing", listing);
  // const { address } = useAccount();
  // const [isRenting, setIsRenting] = useState(false);

  // Add useEffect to log when props change
  React.useEffect(() => {
    console.log("Modal props changed - isOpen:", isOpen);
  }, [isOpen, listing]);

  // Format ETH values for display
  const formatEth = (value: string) => {
    return (Number(value) / 1e18).toString();
  };

  // Become Tenant contract interaction
  // const {
  //   writeAsync: becomeTenant,
  //   isLoading: isRentingPending,
  //   data: rentData,
  // } = useContractWrite({
  //   address: listing?.daoAddress,
  //   abi: RWADAO_ABI,
  //   functionName: "becomeTenant",
  //   value: listing?.rentalPrice,
  // });

  // const { isLoading: isRentWaiting, isSuccess: isRentSuccess } = useTransaction({
  //   hash: rentData?.hash,
  // });

  // const handleRent = async () => {
  //   try {
  //     setIsRenting(true);
  //     await becomeTenant();
  //   } catch (error) {
  //     console.error("Failed to rent:", error);
  //   } finally {
  //     setIsRenting(false);
  //   }
  // };

  // // Close modal on successful rental
  // if (isRentSuccess) {
  //   onClose();
  // }

  if (!listing) {
    return null;
  }

  // Use a direct rendering approach for Dialog
  return (
    <>
      {isOpen && (
        <div
          className="z-[5] bg-opacity-60 overflow-hidden h-screen w-full flex items-center justify-center"
          id="my-modal"
          onClick={onClose}
        >
          <div
            className="p-4 max-w-sm bg-white shadow-lg rounded-md border-2 border-black text-black transform"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                className="text-black hover:text-gray-700 w-6 h-6 flex items-center justify-center"
                onClick={onClose}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-black">Compute Asset Details</h2>
              <p className="mt-2 text-sm text-gray-800">View details and rent this compute asset</p>
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="font-semibold text-black">DAO Address:</div>
                  <div className="font-mono break-all text-black">{listing.daoAddress}</div>

                  <div className="font-semibold text-black">NFT Contract:</div>
                  <div className="font-mono break-all text-black">{listing.nftContract}</div>

                  <div className="font-semibold text-black">Token Contract:</div>
                  <div className="font-mono break-all text-black">{listing.tokenContract}</div>

                  <div className="font-semibold text-black">Token Price:</div>
                  <div className="text-black">{formatEth(listing.tokenPrice)} ETH</div>

                  <div className="font-semibold text-black">Rental Price:</div>
                  <div className="text-black">{formatEth(listing.rentalPrice)} ETH</div>

                  <div className="font-semibold text-black">Status:</div>
                  <div>
                    {listing.isRented ? (
                      <span className="text-red-500">Currently Rented</span>
                    ) : (
                      <span className="text-green-500">Available for Rent</span>
                    )}
                  </div>

                  {listing.isRented && (
                    <>
                      <div className="font-semibold text-black">Current Tenant:</div>
                      <div className="font-mono break-all text-black">{listing.currentTenant}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListingDetailsModal;
