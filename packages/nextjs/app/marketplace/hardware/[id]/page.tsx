"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HardwareActionPanel } from "~~/components/design/HardwareActionPanel";
import { HardwareDetailsMain } from "~~/components/design/HardwareDetailsMain";
import Api from "~~/utils/api";
import { useWeb3Store } from "~~/utils/web3Store";

// import { Api } from "@/utils/api";

export default function HardwareDetails() {
  const params = useParams();
  const hardwareId = params.id as string;
  const [hardware, setHardware] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDaoMember, setIsDaoMember] = useState<boolean | null>(null);
  const [isTenant, setIsTenant] = useState<boolean | null>(null);
  const [isMarketplaceOwner, setIsMarketplaceOwner] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchHardwareAndInfo = async () => {
      try {
        const { isConnected, connectWallet, account } = useWeb3Store.getState(); // Get initial state from Zustand

        if (!isConnected || !account) {
          console.log("Wallet not connected, prompting MetaMask...");
          try {
            await connectWallet(); // Connect wallet
          } catch (error) {
            console.error("Failed to connect wallet:", error);
            alert("Please connect your wallet to proceed.");
            return;
          }

          // ✅ Wait for Zustand state update before proceeding
          const updatedAccount = useWeb3Store.getState().account;
          if (!updatedAccount) {
            alert("Wallet connection failed. Please try again.");
            return;
          }
        }

        // ✅ Use the updated state
        const finalAccount = useWeb3Store.getState().account;
        console.log("Connected wallet:", finalAccount);
        // Make all the API calls simultaneously using Promise.all
        const hardwareResponse = await Api.get<any>(`/dao-details?daoAddress=${hardwareId}`);
        setHardware(hardwareResponse.data);

        // Then, check if the user is a DAO member
        const daoMemberResponse = await Api.post<any>("/api/compute/is-dao-member", {
          daoAddress: hardwareResponse.data.dao.address,
          userAddress: finalAccount, // Example user address
        });
        setIsDaoMember(daoMemberResponse.data.isMember);
        console.log(isDaoMember);
        // After that, check if the user is a tenant
        const tenantResponse = await Api.post<any>("/api/compute/is-tenant", {
          daoAddress: hardwareResponse.data.dao.address,
          userAddress: finalAccount, // Example user address
        });
        setIsTenant(tenantResponse.data.isTenant);
        console.log(isTenant);
        // Finally, check if the user is a marketplace owner
        const marketplaceOwnerResponse = await Api.post<any>("/api/compute/is-marketplace-owner", {
          userAddress: finalAccount,
        });
        setIsMarketplaceOwner(marketplaceOwnerResponse.data.isOwner);
        console.log(isMarketplaceOwner);
      } catch (err) {
        // Set error message if something goes wrong
        setError("Failed to fetch hardware details. Please try again later.");
        console.error("Error fetching hardware details:", err);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchHardwareAndInfo(); // Call the function
  }, [hardwareId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading..</div>;
  }

  if (error || !hardware) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error || "Hardware not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <HardwareDetailsMain hardware={hardware} />
          <HardwareActionPanel hardware={hardware} />
        </div>
      </main>
    </div>
  );
}
