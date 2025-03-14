import { ethers } from "ethers";

/**
 * Signs and sends an Ethereum transaction using ethers v5.
 * @param provider - The Ethereum provider (MetaMask, WalletConnect, etc.).
 * @param txObject - The transaction object to be signed and sent.
 * @returns The transaction receipt after confirmation or null if failed.
 */
export const signAndSendTransaction = async (
  provider: ethers.providers.ExternalProvider,
  txObject: ethers.providers.TransactionRequest,
): Promise<ethers.providers.TransactionReceipt | null> => {
  try {
    if (!provider) {
      throw new Error("Ethereum provider not found.");
    }

    await (window as any).ethereum.request({ method: "eth_requestAccounts" });

    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner(); // Synchronous in v5

    const tx = await signer.sendTransaction(txObject);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait(1);
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());

    return receipt;
  } catch (error) {
    console.error("Transaction failed:", error);
    return null;
  }
};
