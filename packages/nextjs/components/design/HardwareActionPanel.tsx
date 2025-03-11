"use client";

import { useState } from "react";
import ApproveForSaleModal from "./ApproveForSaleModal";
import BuyTokenModal from "./BuyTokenModal";
import Modal from "./Modal";
import toast, { Toaster } from "react-hot-toast";

type HardwareActionPanelProps = {
  hardware: any;
};

export const HardwareActionPanel = ({ hardware }: HardwareActionPanelProps) => {
  const [isBuyTokenModalOpen, setIsBuyTokenModal] = useState(false);
  const [isApproveModalOpen, setIsApproveTokenModal] = useState(false);
  const handleRentClick = () => {
    const heading = "Rental Proposal";
    const description = "Your request to rent this hardware has been submitted  to the DAO for voting.";
    // Use toast.custom to render a structured toast
    toast.custom(
      t => (
        <div
          className={`bg-white border border-gray-200 rounded-lg shadow-md p-4 max-w-sm transition-all ${
            t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-800">{heading}</h4>
            <button onClick={() => toast.dismiss(t.id)} className="text-gray-500 hover:text-gray-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-gray-600 text-sm mb-2">{description}</div>
        </div>
      ),
      {
        duration: 4000,
        position: "bottom-right",
      },
    );
  };
  return (
    <div className="w-1/3 p-4">
      <Toaster />
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-3xl mt-3 font-bold">Take Action</h3>
        <div className="">
          <div className="mb-4 text-gray-400">Rent this hardware or buy ownership tokens</div>
          <div className="grid grid-cols-2 gap-y-2 mx-3 my-6">
            <div className="text-gray-400 font-medium text-left text-lg">Token Price</div>
            <div className=" text-left text-xl">{hardware?.token?.tokenPrice || "N/A"}</div>
            <div className="text-gray-400 font-medium text-left text-lg">Rental Price</div>
            <div className=" text-left text-xl">{hardware?.hardware?.rentalPrice || "N/A"}</div>
          </div>
          <div className="m-2 p-5 bg-gray-50">
            <div className="text-xl font-bold">Ownership Details</div>
            <div className="text-gray-600 mb-4">
              Purchase tokens to own a share of this hardware and earn rental income.
            </div>
            <div className="w-full mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-600">Available Tokens</div>
                <div>
                  {hardware?.token?.availableForSale} / {hardware?.token?.totalSupply}
                </div>
              </div>
              <div
                className="bg-black h-2.5 rounded-full mb-4"
                style={{ width: `${hardware.token.availableForSale / hardware.token.totalSupply}) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-2 p-4">
            <button
              onClick={handleRentClick}
              className="mt-4 mb-2 bg-black text-white px-4 py-3 text-lg rounded w-full"
            >
              Rent Hardware
            </button>
            <button
              onClick={() => setIsBuyTokenModal(true)}
              className="mt-4 bg-white text-black px-4 py-2 rounded w-full border border-gray-300 hover:bg-gray-50"
            >
              Buy Tokens
            </button>
            <button
              onClick={() => setIsApproveTokenModal(true)}
              className="mt-4 bg-white px-4 text-black border py-3 text-lg rounded w-full"
            >
              {" "}
              ✓ Approve For Sale
            </button>
          </div>
        </div>
      </div>
      {/* Modal */}
      <Modal
        isOpen={isBuyTokenModalOpen}
        onClose={() => setIsBuyTokenModal(false)}
        title="Buy Hardware Tokens"
        description="Enter the number of tokens you want to purchase."
      >
        <BuyTokenModal hardware={hardware} />
      </Modal>
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveTokenModal(false)}
        title="Approve Tokens For Sale"
        description="Select how many tokens you want to make available for sale on the marketplace."
      >
        <ApproveForSaleModal hardware={hardware} />
      </Modal>
    </div>
  );
};
