// Add ethers.js to the page dynamically
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js";
document.head.appendChild(script);

// Wait for ethers to load
script.onload = async () => {
  // Get the transaction object (assuming you have it stored in a variable)
  const txObject = {
    from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    to: "0x499AA73A1D27e54B33E7DB05ffd22854EC70257E",
    data: "0x3bdaf5de000000000000000000000000a16e02e87b7454126e5e10d957a927a7f5b5d2be",
    gasLimit: {
      type: "BigNumber",
      hex: "0xee7c",
    },
    gasPrice: {
      type: "BigNumber",
      hex: "0x5d0d794e",
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
