/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useTransaction, useWriteContract } from "wagmi";
import CreateListingModal from "~~/marketplace/components/CreateListingModal";
import ListingDetailsModal from "~~/marketplace/components/ListingDetailsModal";
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS, RWADAO_ABI } from "~~/marketplace/contracts/contractsInfo";
import { Button } from "~~/marketplace/ui/button";
import { Card, CardContent } from "~~/marketplace/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/marketplace/ui/table";

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */

const Listing = () => {
  const { address, isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  // const [listings, setListings] = useState([]);
  const [listingDetails, setListingDetails] = useState<any[]>([]);
  const publicClient = usePublicClient();

  // Get all listings from marketplace contract
  const { data: listingAddresses, refetch: refetchListings } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "getListings",
    // watch: true,
  });

  // Create new listing
  const { data: createData, writeContract: createListing, error: createError } = useWriteContract();

  const { isLoading: isWaitingCreate, isSuccess: isCreateSuccess } = useTransaction({
    hash: createData,
  });

  // Fetch details for each listing
  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!listingAddresses || !publicClient) return;

      const details = await Promise.all(
        (Array.isArray(listingAddresses) ? listingAddresses : []).map(async (daoAddress: any) => {
          try {
            // Get basic DAO contract info
            const tokenPrice = await publicClient.readContract({
              address: daoAddress,
              abi: RWADAO_ABI,
              functionName: "tokenPrice",
            });

            const rentalPrice = await publicClient.readContract({
              address: daoAddress,
              abi: RWADAO_ABI,
              functionName: "rentalPrice",
            });

            const currentTenant = await publicClient.readContract({
              address: daoAddress,
              abi: RWADAO_ABI,
              functionName: "currentTenant",
            });

            // Get NFT contract address
            const nftContract = await publicClient.readContract({
              address: daoAddress,
              abi: RWADAO_ABI,
              functionName: "NFT_CONTRACT",
            });

            // Get token contract address
            const tokenContract = await publicClient.readContract({
              address: daoAddress,
              abi: RWADAO_ABI,
              functionName: "TOKEN_CONTRACT",
            });

            return {
              daoAddress,
              tokenPrice,
              rentalPrice,
              currentTenant,
              isRented: currentTenant !== "0x0000000000000000000000000000000000000000",
              nftContract,
              tokenContract,
            };
          } catch (error) {
            console.error(`Error fetching details for ${daoAddress}:`, error);
            return {
              daoAddress,
              error: true,
            };
          }
        }),
      );

      setListingDetails(details);
    };

    fetchListingDetails();
  }, [listingAddresses, publicClient]);

  // Handle create listing form submission
  const handleCreateListing = async (formData: any) => {
    try {
      await createListing({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "createListing",
        args: [
          formData.nftName,
          formData.nftSymbol,
          formData.tokenName,
          formData.tokenSymbol,
          formData.initialSupply,
          formData.initialTokenPrice,
          formData.initialRentalPrice,
        ],
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create listing:", error);
    }
  };

  // View listing details
  const openListingDetails = (listing: any) => {
    setSelectedListing(listing);
    setIsDetailsModalOpen(true);
  };

  // Refresh listings after successful creation
  useEffect(() => {
    if (isCreateSuccess) {
      refetchListings();
    }
  }, [isCreateSuccess, refetchListings]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ComputeRWA Marketplace</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <span>+ Add Compute</span>
        </Button>
      </div>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-black font-bold">DAO Address</TableHead>
                <TableHead className="text-black font-bold">Token Price</TableHead>
                <TableHead className="text-black font-bold">Rental Price</TableHead>
                <TableHead className="text-black font-bold">Status</TableHead>
                <TableHead className="text-black font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listingDetails.length > 0 ? (
                listingDetails.map((listing: any) => (
                  <TableRow key={listing?.daoAddress}>
                    <TableCell className="font-mono text-black">
                      {`${listing?.daoAddress?.slice(0, 6)}...${listing?.daoAddress?.slice(-4)}`}
                    </TableCell>
                    <TableCell className="text-black">
                      {listing?.error ? "Error" : `${Number(listing?.tokenPrice) / 1e18} ETH`}
                    </TableCell>
                    <TableCell className="text-black">
                      {listing?.error ? "Error" : `${Number(listing?.rentalPrice) / 1e18} ETH`}
                    </TableCell>
                    <TableCell>
                      {listing?.error ? (
                        "Error"
                      ) : listing?.isRented ? (
                        <span className="text-black font-medium">Rented</span>
                      ) : (
                        <span className="text-black font-medium">Available</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => openListingDetails(listing)}
                        className="border-black hover:bg-gray-100 text-black"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-black">
                    {isConnected ? "No listings found" : "Connect your wallet to view listings"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateListing}
        isLoading={isWaitingCreate}
      />

      {/* Listing Details Modal */}
      {selectedListing && (
        <ListingDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          listing={selectedListing}
        />
      )}
    </div>
  );
};

export default Listing;
