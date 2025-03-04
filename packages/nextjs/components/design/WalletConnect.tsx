import { useWeb3Store } from "~~/utils/web3Store";

const WalletConnect = () => {
  const { isConnected, account, connectWallet } = useWeb3Store();

  return (
    <button
      onClick={connectWallet}
      className={`px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 ${isConnected ? "text-green-600" : "text-gray-600"}`}
    >
      {isConnected ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}` : "Connect Wallet"}
    </button>
  );
};

export default WalletConnect;
