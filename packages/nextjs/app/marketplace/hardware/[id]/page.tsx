"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { HardwareActionPanel } from "~~/components/design/HardwareActionPanel";
import { HardwareDetailsMain } from "~~/components/design/HardwareDetailsMain";
import Api from "~~/utils/api";
import { useWeb3Store } from "~~/utils/web3Store";

// import { Api } from "@/utils/api";

export default function HardwareDetails() {
  const params = useParams();
  const hardwareId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { setIsDaoMember, setIsTenant, setIsMarketplaceOwner, setHardware, setCurrentProposal, setRentalPrice } =
    useWeb3Store();
  const fetchHardwareAndInfo = async () => {
    try {
      const hardwareResponse = await Api.get<any>(`/dao-details?daoAddress=${hardwareId}`);
      setHardware(hardwareResponse.data);
      if (address) {
        const daoMemberResponse = await Api.post<any>("/is-dao-member", {
          daoAddress: hardwareResponse.data.dao.address,
          userAddress: address, // Example user address
        });
        setIsDaoMember(daoMemberResponse.data.isMember);

        if (daoMemberResponse.data.isMember) {
          const proposalResponse = await Api.post("/current-proposal", {
            daoAddress: hardwareResponse.data.dao.address,
          });
          setCurrentProposal(proposalResponse.data);
          console.log("Current Proposal:", proposalResponse.data);
        }

        const rentalPriceResponse = await Api.post<any>("/rental-price", {
          daoAddress: hardwareResponse.data.dao.address,
        });

        console.log("Rental Price:", rentalPriceResponse.data);
        setRentalPrice(rentalPriceResponse.data?.rentalPriceEth);

        const tenantResponse = await Api.post<any>("/is-tenant", {
          daoAddress: hardwareResponse.data.dao.address,
          userAddress: address, // Example user address
        });
        setIsTenant(tenantResponse.data.isTenant);
        console.log("Is Tenant:", tenantResponse.data.isTenant);

        if (!tenantResponse.data.isTenant) {
          const marketplaceOwnerResponse = await Api.post<any>("/is-marketplace-owner", {
            userAddress: address,
          });
          setIsMarketplaceOwner(marketplaceOwnerResponse.data.isOwner);
          console.log("Is Marketplace Owner:", marketplaceOwnerResponse.data.isOwner);
        }
      } else {
        setIsDaoMember(false);
        setIsTenant(false);
        setIsMarketplaceOwner(false);
      }
      setIsLoading(false);
      // Make all the API calls simultaneously using Promise.all
    } catch (err) {
      setError("Failed to fetch hardware details. Please try again later.");
      console.error("Error fetching hardware details:", err);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      console.log("connecting..");
      connect({ connector: injected() });
    }
  }, []);

  const refetch = () => {
    fetchHardwareAndInfo();
  };

  useEffect(() => {
    fetchHardwareAndInfo();
  }, [address]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading..</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error || "Hardware not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white mb-6">
      <main className="flex-1 w-full p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <HardwareDetailsMain refetch={refetch} />
          <HardwareActionPanel refetch={refetch} />
        </div>
      </main>
    </div>
  );
}
