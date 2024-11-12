// src/utils/Web3Utils.js

import { BrowserProvider, Contract } from "ethers";

const BASE_CONTRACT = "0x39e6EED85927e0203c2ae9790eDaeB431B8e43c1";
const ZORA_CONTRACT = "0x4a57b15e45d03bd85c8ee38dcff9e2bf0e87dbcf";

// Basic ERC721 ABI for balanceOf
const ERC721_ABI = [
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const ERC1155_ABI = [
  {
    constant: true,
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// Add a helper function to wait between network switches
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getProvider(network) {
  console.log("Getting provider for network:", network);
  if (!window.ethereum) {
    throw new Error("No ethereum provider found");
  }

  try {
    if (network === "zora") {
      console.log("Switching to Zora network...");
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x76adf1" }],
        });
        // Wait for network switch to complete
        await wait(500);
      } catch (switchError) {
        console.error("Failed to switch to Zora network:", switchError);
        // Handle the case where the network needs to be added
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x76adf1",
                  chainName: "Zora",
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.zora.energy"],
                  blockExplorerUrls: ["https://explorer.zora.energy"],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add Zora network:", addError);
            throw addError;
          }
        } else {
          throw switchError;
        }
      }
    }

    if (network === "base") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }],
        });
        // Wait for network switch to complete
        await wait(500);
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2105",
                chainName: "Base",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        }
      }
    }

    console.log(`Creating BrowserProvider for ${network}...`);
    const provider = new BrowserProvider(window.ethereum);
    console.log(`Provider created successfully for ${network}`);
    return provider;
  } catch (error) {
    console.error(`Error getting provider for ${network}:`, error);
    throw error;
  }
}

// Update the Base token check to use the sequential checking approach
export async function checkBaseTokenOwnership() {
  try {
    console.log("Starting Base token ownership check...");
    const provider = await getProvider("base");
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    console.log(`Checking Base token ownership for address: ${address}`);

    // Try each contract type in sequence
    for (const [type, abi] of [
      ["ERC721", ERC721_ABI],
      ["ERC1155", ERC1155_ABI],
      ["ERC20", ERC20_ABI],
    ]) {
      try {
        console.log(`Trying ${type} check for Base token...`);
        const contract = new Contract(BASE_CONTRACT, abi, provider);

        // Check if the contract is valid
        const code = await provider.getCode(BASE_CONTRACT);
        if (code === "0x") {
          console.error(`No contract found at address: ${BASE_CONTRACT}`);
          return false;
        }

        const balance =
          type === "ERC1155"
            ? await contract.balanceOf(address, 1)
            : await contract.balanceOf(address);

        console.log(`Base token ${type} balance:`, balance.toString());
        if (balance > 0) {
          console.log(`Base token found as ${type} with positive balance`);
          return true;
        }
      } catch (error) {
        console.log(
          `Base token not ${type}, trying next type...`,
          error.message
        );
      }
    }

    console.log("Base token does not match any known token standard");
    return false;
  } catch (error) {
    console.error("Error in Base token ownership check:", error);
    return false;
  }
}

// Keep the working Zora check as is
export async function checkZoraTokenOwnership() {
  try {
    console.log("Starting Zora token ownership check...");
    const provider = await getProvider("zora");
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    console.log(`Checking Zora token ownership for address: ${address}`);
    // Try ERC721 first
    const contract = new Contract(ZORA_CONTRACT, ERC721_ABI, provider);
    let balance = 0;
    try {
      balance = await contract.balanceOf(address);
    } catch (e) {
      console.log("ERC721 check failed, trying ERC1155...");
      const erc1155Contract = new Contract(
        ZORA_CONTRACT,
        ERC1155_ABI,
        provider
      );
      balance = await erc1155Contract.balanceOf(address, 1);
    }

    console.log(`Zora token balance: ${balance.toString()}`);
    return balance > 0;
  } catch (error) {
    console.error("Error checking Zora token ownership:", error);
    return false;
  }
}
