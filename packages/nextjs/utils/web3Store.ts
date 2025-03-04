import { create } from "zustand";

// Define Web3 state and actions
interface Web3State {
  isConnected: boolean;
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  checkWalletConnection: () => Promise<void>; // New function
}

// Zustand store for Web3 wallet state
export const useWeb3Store = create<Web3State>((set: any) => ({
  isConnected: false,
  account: null,

  // Connect Wallet
  connectWallet: async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          set({ account: accounts[0], isConnected: true });
          console.log("Connected wallet:", accounts[0]);
          localStorage.setItem("walletConnected", "true"); // Save connection state
        }
      } else {
        throw new Error("Ethereum provider not found. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      alert(`Failed to connect wallet: ${(error as Error).message}`);
    }
  },

  // Disconnect Wallet
  disconnectWallet: () => {
    set({ isConnected: false, account: null });
    localStorage.removeItem("walletConnected"); // Remove connection state
  },

  // Check if the wallet is already connected on page load
  checkWalletConnection: async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          set({ account: accounts[0], isConnected: true });
          console.log("Reconnected to wallet:", accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  },
}));
