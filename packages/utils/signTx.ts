// Add ethers.js to the page dynamically
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js";
document.head.appendChild(script);

// Wait for ethers to load
script.onload = async () => {
  // Get the transaction object (assuming you have it stored in a variable)
  const txObject = {
    from: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    to: "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
    data: "0x7fd604c30000000000000000000000000000000000000000000000000058d15e17628000",
    gasLimit: {
      type: "BigNumber",
      hex: "0x01418e",
    },
    gasPrice: {
      type: "BigNumber",
      hex: "0x4cd8b1a4",
    },
    nonce: 3,
    chainId: 31337,
  };

  // Request wallet access
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // Create provider and signer
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  // Send the transaction
  try {
    const tx = await signer.sendTransaction(txObject);
    console.log("Transaction sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait(1);
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};
