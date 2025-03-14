"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ApproveForSaleModal from "./ApproveForSaleModal";
import KeyValueGrid from "./KeyValueGrid";
import Modal from "./Modal";
import PraposeRentPrieModal from "./PraposeRentPrieModal";
import toast from "react-hot-toast";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Api from "~~/utils/api";
import { useWeb3Store } from "~~/utils/web3Store";
import { signAndSendTransaction } from "~~/utils/web3Utils";

export const HardwareDetailsMain = ({ refetch }: any) => {
  const [activeTab, setActiveTab] = useState("Specification");
  const [isApproveModalOpen, setIsApproveTokenModal] = useState(false);
  const [isDelistTokenModal, setIsDelistTokenModal] = useState(false);
  const [isPraposeRentModalOpen, setIsPraposeRentModal] = useState(false);
  const { isDaoMember, isTenant, isMarketplaceOwner, hardware, currentProposal } = useWeb3Store();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const voteApi = async (vote: boolean) => {
    try {
      // setIsLoading(true);
      const voteResponse = await Api.post<any>("/vote-on-proposal", {
        userAddress: address,
        daoAddress: hardware.dao.address,
        inFavor: vote,
      });
      if (voteResponse) {
        const signTxn = await signAndSendTransaction(window.ethereum, voteResponse?.data?.tx);
        if (signTxn) {
          toast.success("Vote cast successfully!");
          refetch();
        }
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("Error during voting:", err);
      toast.error("You have already voted on this proposal!");
    } finally {
      // setIsLoading(false);
    }
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "Specification":
        return (
          <KeyValueGrid
            items={[
              { key: "Hardware", value: hardware?.hardware?.name },
              {
                key: "Specifications",
                value: hardware?.hardware?.performance + " " + (hardware?.hardware?.memory || ""),
              },
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
              {
                key: "Token Address",
                value: hardware?.token?.address,
                onClick: () => handleCopy(hardware?.token?.address),
              },
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
                value: hardware?.token?.tokenPrice ? `${hardware.token.tokenPrice}` : undefined,
              },
            ]}
          />
        );

      case "DAO":
        return (
          <KeyValueGrid
            items={[
              { key: "DAO Address", value: hardware?.dao?.address, onClick: () => handleCopy(hardware?.dao?.address) },
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
              { key: "NFT Address", value: hardware?.nft?.address, onClick: () => handleCopy(hardware?.nft?.address) },
              { key: "NFT ID", value: hardware?.nft?.id },
              { key: "Legal Binding", value: hardware?.nft?.legalBinding },
              { key: "Hardware Verification", value: hardware?.nft?.hardwareVerification },
            ]}
          />
        );
      case "Governance":
        return (
          <div className="px-4">
            {currentProposal && currentProposal?.active ? (
              <div className="">
                <div className="m-2 p-5 bg-yellow-50">
                  <div className="text-md font-bold">Active Proposal</div>
                  <div className="w-full mt-2 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-600 text-md">Current price</div>
                      <div>{currentProposal.currentPrice} ETH / day</div>
                    </div>
                    <div className="w-full mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-gray-600 text-md font-semibold">Proposed Price</div>
                        <div className="font-semibold">{currentProposal.proposedPrice} ETH / day</div>
                      </div>
                      <div className="w-full h-2 rounded-full mb-1 bg-gray-300">
                        {/* Black part representing availableForSale */}
                        <div
                          className="h-2 rounded-l-full bg-yellow-500"
                          style={{
                            width: `${currentProposal.votesFor}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-gray-600 text-sm">{currentProposal.votesFor}%</div>
                        <div className="text-gray-600 text-sm">{currentProposal.voteThreshold}% needed</div>
                      </div>
                      <div className="flex items-center justify-between mb-2 gap-4">
                        <button
                          onClick={() => voteApi(true)}
                          className="mt-4 mb-2 bg-black text-white border border-black px-1 py-2 text-md rounded w-full"
                        >
                          Vote For
                        </button>
                        <button
                          onClick={() => voteApi(false)}
                          className="mt-4 mb-2 bg-white text-black border border-gray-100 px-1 py-2 text-md rounded w-full"
                        >
                          Vote Against
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsPraposeRentModal(true)}
                className="mt-4 mb-2 bg-white text-black border border-gray-300 px-1 py-2 text-md rounded w-full"
              >
                Propose Rent Price Change
              </button>
            )}
            {isMarketplaceOwner && (
              <button
                onClick={() => setIsDelistTokenModal(true)}
                className="mt-4 bg-red-600 px-3 text-white border py-2 text-md rounded w-full"
              >
                {" "}
                Delist Hardware (100% Owner Only)
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  const handleDelist = async () => {
    try {
      setIsLoading(true);
      if (!isConnected) {
        connect({ connector: injected() });
      }
      console.log("connected", address);

      // Call unlist-compute API
      const unlistResponse = await Api.post<any>("/unlist-compute", {
        userAddress: address,
        daoAddress: hardware?.dao.address,
      });

      // Check if the unlist request was successful
      if (unlistResponse.data.needsApproval) {
        // Call complete-unlist API after successful unlisting
        const completeUnlistResponse = await Api.post<any>("/complete-unlist", {
          userAddress: address,
          daoAddress: hardware.dao.address, // Replace with actual DAO address
        });

        if (completeUnlistResponse) {
          toast.success("Hardware delisted successfully!");
          router.push("/marketplace");
        } else {
          toast.error("Something went wrong!");
        }
      }
    } catch (err) {
      console.error("Error during delisting:", err);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
      setIsDelistTokenModal(false); // Close modal after completion
    }
  };
  useEffect(() => {
    setActiveTab("Specification");
  }, [address]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard"); // Reset the copied state after 2 seconds
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };
  return (
    <div className="w-2/3 border-[1px] border-gray-200 rounded-lg">
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
              <p className="text-green-500 bg-green-100 inline-block px-4 py-1 rounded-full">Available</p>
            ) : (
              <p className="text-yellow-500 bg-yellow-100 inline-block px-4 py-1 rounded-full">Rented</p>
            )}
            <h2 className="text-2xl font-bold mb-2">{hardware?.hardware?.name}</h2>
          </div>
          <div onClick={() => handleCopy(hardware.dao.address)} className="cursor-pointer">
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
            ...(isDaoMember || isMarketplaceOwner ? [{ name: "Governance", enabled: true }] : []),
          ].map((tab: any) => (
            <li key={tab.name} className="bg-gray-100">
              <button
                onClick={() => tab.enabled && setActiveTab(tab.name)}
                className={`inline-block p-2 m-1 rounded-lg text-md transition-colors ${
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
        {isTenant && (
          <div className="px-4">
            <Link
              href={`/marketplace/hardware/${params.id}/deploy`}
              className="mt-4 mb-2 bg-black text-white px-3 py-2 text-md rounded w-full text-center block"
            >
              Deploy To Hardware
            </Link>
          </div>
        )}
      </div>
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
      <Modal
        isOpen={isPraposeRentModalOpen}
        onClose={() => setIsPraposeRentModal(false)}
        title="Propose New Rent Price"
        description="As a DAO member, you can propose a new rental price for this hardware."
      >
        <PraposeRentPrieModal
          hardware={hardware}
          onClose={() => {
            setIsPraposeRentModal(false);
            refetch();
          }}
        />
      </Modal>
      <Modal
        isOpen={isDelistTokenModal}
        onClose={() => setIsDelistTokenModal(false)}
        title="Are you sure about delisting hardware"
        description=""
      >
        <div className="flex flex-col justify-center">
          <p className="text-md mb-4 w-96">
            Once you delist, the hardware will be removed from the platform, and users will no longer be able to
            interact with it.
          </p>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsDelistTokenModal(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelist}
                disabled={isLoading}
                className="px-4 py-2 bg-black text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Yes"}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
