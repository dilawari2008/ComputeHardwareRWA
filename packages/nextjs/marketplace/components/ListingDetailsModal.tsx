"use client";

// import { useState } from "react";
// import { useAccount, useContractWrite, useTransaction } from "wagmi";
// import { RWADAO_ABI } from "~~/marketplace/contracts/contractsInfo";
import { Button } from "~~/marketplace/ui/button";
import { Card, CardContent } from "~~/marketplace/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~~/marketplace/ui/dialog";

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
  // const { address } = useAccount();
  // const [isRenting, setIsRenting] = useState(false);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Compute Asset Details</DialogTitle>
          <DialogDescription>View details and rent this compute asset</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="font-semibold">DAO Address:</div>
                <div className="font-mono break-all">{listing.daoAddress}</div>

                <div className="font-semibold">NFT Contract:</div>
                <div className="font-mono break-all">{listing.nftContract}</div>

                <div className="font-semibold">Token Contract:</div>
                <div className="font-mono break-all">{listing.tokenContract}</div>

                <div className="font-semibold">Token Price:</div>
                <div>{formatEth(listing.tokenPrice)} ETH</div>

                <div className="font-semibold">Rental Price:</div>
                <div>{formatEth(listing.rentalPrice)} ETH</div>

                <div className="font-semibold">Status:</div>
                <div>
                  {listing.isRented ? (
                    <span className="text-red-500">Currently Rented</span>
                  ) : (
                    <span className="text-green-500">Available for Rent</span>
                  )}
                </div>

                {listing.isRented && (
                  <>
                    <div className="font-semibold">Current Tenant:</div>
                    <div className="font-mono break-all">{listing.currentTenant}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>

          {/* {!listing.isRented && (
            <Button onClick={handleRent} disabled={isRenting || isRentingPending || isRentWaiting || !address}>
              {isRentingPending || isRentWaiting ? "Processing..." : `Rent It (${formatEth(listing.rentalPrice)} ETH)`}
            </Button>
          )} */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListingDetailsModal;
