// Add ethers.js to the page dynamically
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js";
document.head.appendChild(script);

// Wait for ethers to load
script.onload = async () => {
  // Get the transaction object (assuming you have it stored in a variable)
  const txObject = {
    from: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    to: "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
    data: "0xde522b5d",
    value: "20000000000000000",
    gasLimit: {
      type: "BigNumber",
      hex: "0x0123d2",
    },
    gasPrice: {
      type: "BigNumber",
      hex: "0x520b57b2",
    },
    nonce: 4,
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
