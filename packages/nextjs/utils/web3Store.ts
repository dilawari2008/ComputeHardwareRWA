import { create } from "zustand";

// Define Web3 state and actions
interface Web3State {
  isConnected: boolean;
  account: string | null;
  isDaoMember: boolean | null;
  isTenant: boolean | null;
  isMarketplaceOwner: boolean | null;
  currentProposal: any;
  hardware: any;
  rentalPrice: any;
  setCurrentProposal: (value: any) => void;
  setHardware: (value: any | null) => void;
  setIsDaoMember: (value: boolean | null) => void;
  setIsTenant: (value: boolean | null) => void;
  setIsMarketplaceOwner: (value: boolean | null) => void;
  setRentalPrice: (value: any) => void;
}

// Zustand store for Web3 wallet state
export const useWeb3Store = create<Web3State>((set: any) => ({
  isConnected: false,
  account: null,
  isDaoMember: null,
  isTenant: null,
  isMarketplaceOwner: null,
  currentProposal: null,
  hardware: null,
  rentalPrice: null,
  setHardware: (value: any) => set({ hardware: value }),
  setIsDaoMember: (value: any) => set({ isDaoMember: value }),
  setIsTenant: (value: any) => set({ isTenant: value }),
  setIsMarketplaceOwner: (value: any) => set({ isMarketplaceOwner: value }),
  setCurrentProposal: (value: any) => set({ currentProposal: value }),
  setRentalPrice: (value: any) => set({ rentalPrice: value }),
}));
