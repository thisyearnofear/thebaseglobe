// WalletConnect.js

const CONFIG = {
  mainnetRpcUrl:
    "https://sepolia.infura.io/v3/b52163bdfadb414386c2b1b84578a39b",
  baseRpcUrl:
    "https://base-sepolia.infura.io/v3/b52163bdfadb414386c2b1b84578a39b",
  zoraRpcUrl: "https://rpc.zora.energy",
};

let web3;

async function setupWeb3() {
  console.log("Setting up Web3...");
  try {
    if (typeof window.ethereum !== "undefined") {
      web3 = new Web3(window.ethereum);
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider(CONFIG.mainnetRpcUrl));
    }
    console.log("Web3 setup complete");
  } catch (error) {
    console.log("Web3 setup failed, continuing with limited functionality");
    // Don't throw error, just continue
  }
}

async function getNetworkInfo() {
  if (!web3) {
    console.error("Web3 not initialized");
    return;
  }
  const networkId = await web3.eth.net.getId();
  console.log("Connected to network ID:", networkId);
  return networkId;
}

async function getUserAddress() {
  if (!web3) {
    console.error("Web3 not initialized");
    return;
  }
  const accounts = await web3.eth.getAccounts();
  if (accounts.length === 0) {
    console.error("No accounts found");
    return null;
  }
  return accounts[0];
}

async function resolveENSName(address) {
  try {
    const response = await fetch(`https://api.ensdata.net/${address}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return data.ens_primary || null; // Return the ENS name or null
  } catch (error) {
    console.error(`Error resolving ENS name for address ${address}:`, error);
    return null; // Return null if there's an error
  }
}

async function getEnsNameOrShortAddress(address) {
  const ensName = await resolveENSName(address);
  return ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function updateConnectionState(isConnected, userAddress = null) {
  console.log("Updating connection state:", { isConnected, userAddress });

  const connectButton = document.getElementById("connect-wallet");
  const walletInfo = document.getElementById("wallet-info");
  const walletAddress = document.getElementById("wallet-address");

  if (!connectButton || !walletInfo || !walletAddress) {
    console.error("Required DOM elements not found:", {
      connectButton: !!connectButton,
      walletInfo: !!walletInfo,
      walletAddress: !!walletAddress,
    });
    return;
  }

  if (isConnected && userAddress) {
    console.log("Showing connected state for address:", userAddress);
    connectButton.classList.add("hidden");
    walletInfo.classList.remove("hidden");
    const displayName = await getEnsNameOrShortAddress(userAddress);
    console.log("Display name resolved to:", displayName);
    walletAddress.textContent = displayName;
  } else {
    console.log("Showing disconnected state");
    connectButton.classList.remove("hidden");
    walletInfo.classList.add("hidden");
    walletAddress.textContent = "";
  }
}

const ERC1155_ABI = [
  [
    {
      inputs: [
        {
          internalType: "address",
          name: "_logic",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "previousAdmin",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "newAdmin",
          type: "address",
        },
      ],
      name: "AdminChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "beacon",
          type: "address",
        },
      ],
      name: "BeaconUpgraded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "implementation",
          type: "address",
        },
      ],
      name: "Upgraded",
      type: "event",
    },
    {
      stateMutability: "payable",
      type: "fallback",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
  ],
];

const ERC1155_CONTRACT_ADDRESS = "0x4a57b15E45d03bd85c8eE38dcFF9E2BF0e87dBCf";
const TOKEN_ID = 1; // Adjust this if you're looking for a specific token ID

export async function checkERC1155Balance(userAddress) {
  if (!userAddress) {
    return false;
  }

  const networks = [
    { name: "Base", rpcUrl: CONFIG.baseRpcUrl },
    { name: "Zora", rpcUrl: CONFIG.zoraRpcUrl },
  ];

  for (const network of networks) {
    try {
      const web3Instance = new Web3(network.rpcUrl);
      // Rest of the function remains the same
    } catch (error) {
      console.log(`Error checking balance on ${network.name}, continuing...`);
      continue;
    }
  }
  return false;
}

export async function connectWallet() {
  try {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = await getUserAddress();
      if (userAddress) {
        await getNetworkInfo();

        // Update UI
        await updateConnectionState(true, userAddress);

        // Trigger selection update
        const event = new CustomEvent("walletStatusChanged", {
          detail: { userAddress },
        });
        document.dispatchEvent(event);

        return { userAddress };
      }
    }
  } catch (error) {
    console.error("Failed to connect:", error);
    localStorage.removeItem("walletState");
    updateConnectionState(false);
  }
  return { userAddress: null };
}

function showModal() {
  const modal = document.getElementById("wallet-modal");
  modal.classList.remove("hidden");
}

function hideModal() {
  const modal = document.getElementById("wallet-modal");
  modal.classList.add("hidden");
}

async function setupEventListeners() {
  console.log("Setting up event listeners...");
  const connectButton = document.getElementById("connect-wallet");
  const closeModalButton = document.getElementById("close-modal");

  if (connectButton) {
    connectButton.addEventListener("click", connectWallet);
    console.log("Event listener added to connect button");
  } else {
    console.error("Connect wallet button not found");
  }

  if (closeModalButton) {
    closeModalButton.addEventListener("click", hideModal);
  }

  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", async (accounts) => {
      if (accounts.length > 0) {
        await updateConnectionState(true, accounts[0]);
      } else {
        updateConnectionState(false);
      }
    });
  }
}

async function initializeWalletConnect() {
  try {
    console.log("Initializing WalletConnect...");
    await setupWeb3();
    await setupEventListeners();

    // Check if we're already connected
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts && accounts.length > 0) {
        console.log("Found existing connection:", accounts[0]);
        await updateConnectionState(true, accounts[0]);
      } else {
        console.log("No existing connection found");
        await updateConnectionState(false);
      }
    }

    console.log("WalletConnect initialized successfully");
  } catch (error) {
    console.error("WalletConnect initialization failed:", error);
  }
}

export { initializeWalletConnect, getUserAddress, getEnsNameOrShortAddress };

const WALLET_INIT_KEY = "wallet_initialized";
let initializationPromise = null;

async function checkInitialConnection() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        await updateConnectionState(true, accounts[0]);
      }
    } catch (error) {
      console.error("Error checking initial connection:", error);
    }
  }
}

async function safeInitialize() {
  if (window.sessionStorage.getItem(WALLET_INIT_KEY)) {
    console.log("Wallet already initialized in this session");
    await checkInitialConnection();
    return;
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        await initializeWalletConnect();
        await checkInitialConnection();
        window.sessionStorage.setItem(WALLET_INIT_KEY, "true");
      } catch (error) {
        console.error("Wallet initialization failed:", error);
      }
    })();
  }
  return initializationPromise;
}

// Only initialize once when the document is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", safeInitialize);
} else {
  safeInitialize();
}
