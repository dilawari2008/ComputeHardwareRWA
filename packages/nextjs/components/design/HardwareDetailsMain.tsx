"use client";

import { useState } from "react";
import ApproveForSaleModal from "./ApproveForSaleModal";
import KeyValueGrid from "./KeyValueGrid";
import Modal from "./Modal";
import PraposeRentPrieModal from "./PraposeRentPrieModal";

type HardwareDetailsMainProps = {
  hardware: any;
};

export const HardwareDetailsMain = ({ hardware }: HardwareDetailsMainProps) => {
  const [activeTab, setActiveTab] = useState("Specification");
  const [isApproveModalOpen, setIsApproveTokenModal] = useState(false);
  const [isPraposeRentModalOpen, setIsPraposeRentModal] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Specification":
        return (
          <KeyValueGrid
            items={[
              { key: "Hardware", value: hardware?.hardware?.name },
              { key: "Performance", value: hardware?.hardware?.performance },
              { key: "Location", value: hardware?.hardware?.location },
              { key: "Created", value: hardware?.hardware?.created },
              { key: "Status", value: hardware?.hardware?.status },
              { key: "Rental Price", value: hardware?.hardware?.rentalPrice },
            ]}
          />
        );
      case "Token Info":
        return (
          <KeyValueGrid
            items={[
              { key: "Token Name", value: hardware?.token?.name },
              { key: "Symbol", value: hardware?.token?.symbol },
              {
                key: "Total Supply",
                value: hardware?.token?.totalSupply ? `${hardware.token.totalSupply} tokens` : undefined,
              },
              {
                key: "Available for Sale",
                value: hardware?.token?.availableForSale ? `${hardware.token.availableForSale} tokens` : undefined,
              },
              {
                key: "Token Price",
                value: hardware?.token?.tokenPrice ? `${hardware.token.tokenPrice} / token` : undefined,
              },
            ]}
          />
        );

      case "DAO":
        return (
          <KeyValueGrid
            items={[
              { key: "DAO Address", value: hardware?.dao?.address },
              { key: "Governance", value: hardware?.dao?.governance },
              { key: "Vote Threshold", value: hardware?.dao?.voteThreshold },
              { key: "Fee Structure", value: hardware?.dao?.feeStructure },
            ]}
          />
        );
      case "RWA Info":
        return (
          <KeyValueGrid
            items={[
              { key: "NFT Address", value: hardware?.nft?.address },
              { key: "NFT ID", value: hardware?.nft?.id },
              { key: "Legal Binding", value: hardware?.nft?.legalBinding },
              { key: "Hardware Verification", value: hardware?.nft?.hardwareVerification },
            ]}
          />
        );
      case "Governance":
        return (
          <div className="space-y-2 p-4">
            <button
              onClick={() => setIsPraposeRentModal(true)}
              className="mt-4 mb-2 bg-black text-white px-4 py-3 text-lg rounded w-full"
            >
              Purpose Rent Price Change
            </button>
            <button
              onClick={() => setIsApproveTokenModal(true)}
              className="mt-4 bg-white px-4 border py-3 text-lg rounded w-full"
            >
              {" "}
              ✓ Approve For Sale
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-2/3 p-4">
      <div className="bg-gray-100 rounded-lg shadow-md flex items-center justify-center" style={{ height: "70vh" }}>
        {hardware?.hardware?.image ? (
          <img
            src={hardware?.hardware?.image}
            alt={hardware?.hardware?.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center">
            <span className="text-gray-500">🖥️</span> {/* Placeholder for image */}
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            {hardware?.hardware?.status === "Available" ? (
              <p className="text-green-500 bg-green-100 inline-block px-2 pt-1 rounded">Available</p>
            ) : (
              <p className="text-yellow-500 bg-yellow-100 inline-block px-2 pt-1 rounded">Currently rented</p>
            )}
            <h2 className="text-3xl font-bold mb-2">{hardware?.hardware?.name}</h2>
          </div>
          <div>
            <h1 className="text-gray-600 text-right">DAO Address</h1>
            <h2 className="text-md font-bold mb-2">
              {hardware?.dao?.address?.length > 16
                ? `${hardware.dao.address.substring(0, 16)}...`
                : hardware?.dao?.address}
            </h2>
          </div>
        </div>

        <ul
          className="flex ml-3 rounded-lg flex-wrap text-sm font-medium text-center dark:text-gray-400 mt-4 w-full"
          role="tablist"
        >
          {[
            { name: "Specification", enabled: true },
            { name: "Token Info", enabled: true },
            { name: "DAO", enabled: true },
            { name: "RWA Info", enabled: true },
            { name: "Governance", enabled: true },
          ].map((tab: any) => (
            <li key={tab.name} className="bg-gray-100">
              <button
                onClick={() => tab.enabled && setActiveTab(tab.name)}
                className={`inline-block p-3 m-1 rounded-lg text-lg transition-colors ${
                  activeTab === tab.name && tab.enabled
                    ? "text-blue-600 bg-white active dark:bg-gray-800 dark:text-blue-500"
                    : tab.enabled
                      ? "hover:text-gray-600 hover:bg-gray-50 bg-gray-100"
                      : "text-gray-400 cursor-not-allowed dark:text-gray-500"
                }`}
                role="tab"
                aria-selected={activeTab === tab.name}
                aria-controls={`${tab.name.toLowerCase().replace(/\s/g, "-")}-panel`}
                disabled={!tab.enabled}
              >
                {tab.name}
              </button>
            </li>
          ))}
        </ul>

        <div id={`${activeTab.toLowerCase().replace(/\s/g, "-")}-panel`} role="tabpanel" className="mt-4">
          {renderTabContent()}
        </div>

        <button className="mt-4 mb-2 bg-black text-white px-4 py-3 text-lg rounded w-full">Deploy To Hardware</button>
      </div>
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveTokenModal(false)}
        title="Approve Tokens For Sale"
        description="Select how many tokens you want to make available for sale on the marketplace."
      >
        <ApproveForSaleModal hardware={hardware} />
      </Modal>
      <Modal
        isOpen={isPraposeRentModalOpen}
        onClose={() => setIsPraposeRentModal(false)}
        title="Propose New Rent Price"
        description="As a DAO member, you can propose a new rental price for this hardware."
      >
        <PraposeRentPrieModal hardware={hardware} />
      </Modal>
    </div>
  );
};
