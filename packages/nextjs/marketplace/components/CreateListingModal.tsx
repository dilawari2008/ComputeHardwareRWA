"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { Button } from "~~/marketplace/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~~/marketplace/ui/dialog";
import { Input } from "~~/marketplace/ui/input";
import { Label } from "~~/marketplace/ui/label";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CreateListingModal: React.FC<CreateListingModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    nftName: "",
    nftSymbol: "",
    tokenName: "",
    tokenSymbol: "",
    initialSupply: "",
    initialTokenPrice: "",
    initialRentalPrice: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For numerical inputs, validate and convert
    if (["initialSupply", "initialTokenPrice", "initialRentalPrice"].includes(name)) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert string values to BigInt for contract
    const processedData = {
      ...formData,
      initialSupply: BigInt(parseEther(formData.initialSupply || "0")),
      initialTokenPrice: BigInt(parseEther(formData.initialTokenPrice || "0")),
      initialRentalPrice: BigInt(parseEther(formData.initialRentalPrice || "0")),
    };

    onSubmit(processedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Compute Listing</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nftName">NFT Name</Label>
            <Input
              id="nftName"
              name="nftName"
              placeholder="Compute NFT"
              value={formData.nftName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nftSymbol">NFT Symbol</Label>
            <Input
              id="nftSymbol"
              name="nftSymbol"
              placeholder="CNFT"
              value={formData.nftSymbol}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tokenName">Token Name</Label>
            <Input
              id="tokenName"
              name="tokenName"
              placeholder="Compute Token"
              value={formData.tokenName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tokenSymbol">Token Symbol</Label>
            <Input
              id="tokenSymbol"
              name="tokenSymbol"
              placeholder="CTKN"
              value={formData.tokenSymbol}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="initialSupply">Initial Supply (ETH)</Label>
            <Input
              id="initialSupply"
              name="initialSupply"
              placeholder="1000"
              value={formData.initialSupply}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="initialTokenPrice">Initial Token Price (ETH)</Label>
            <Input
              id="initialTokenPrice"
              name="initialTokenPrice"
              placeholder="0.01"
              value={formData.initialTokenPrice}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="initialRentalPrice">Initial Rental Price (ETH)</Label>
            <Input
              id="initialRentalPrice"
              name="initialRentalPrice"
              placeholder="0.5"
              value={formData.initialRentalPrice}
              onChange={handleChange}
              required
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListingModal;
