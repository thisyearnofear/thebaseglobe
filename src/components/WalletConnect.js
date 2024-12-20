// sourcery skip: flip-comparison
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
    (web3 =
      void 0 !== window.ethereum
        ? new Web3(window.ethereum)
        : new Web3(new Web3.providers.HttpProvider(CONFIG.mainnetRpcUrl))),
      console.log("Web3 setup complete");
  } catch (e) {
    console.log("Web3 setup failed, continuing with limited functionality");
  }
}
async function getNetworkInfo() {
  if (!web3) return void console.error("Web3 not initialized");
  const e = await web3.eth.net.getId();
  return console.log("Connected to network ID:", e), e;
}
async function getUserAddress() {
  if (!web3) return void console.error("Web3 not initialized");
  const e = await web3.eth.getAccounts();
  return 0 === e.length ? (console.error("No accounts found"), null) : e[0];
}
async function resolveENSName(e) {
  try {
    const t = await fetch(`https://api.ensdata.net/${e}`);
    if (!t.ok) throw new Error(`Network response was not ok: ${t.statusText}`);
    return (await t.json()).ens_primary || null;
  } catch (t) {
    return console.error(`Error resolving ENS name for address ${e}:`, t), null;
  }
}
async function getEnsNameOrShortAddress(e) {
  return (await resolveENSName(e)) || `${e.slice(0, 6)}...${e.slice(-4)}`;
}
async function updateConnectionState(e, t = null) {
  console.log("Updating connection state:", { isConnected: e, userAddress: t });
  const n = document.getElementById("connect-wallet"),
    o = document.getElementById("wallet-info"),
    i = document.getElementById("wallet-address");
  if (n && o && i)
    if (e && t) {
      console.log("Showing connected state for address:", t),
        n.classList.add("hidden"),
        o.classList.remove("hidden");
      const e = await getEnsNameOrShortAddress(t);
      console.log("Display name resolved to:", e), (i.textContent = e);
    } else
      console.log("Showing disconnected state"),
        n.classList.remove("hidden"),
        o.classList.add("hidden"),
        (i.textContent = "");
  else console.error("Required DOM elements not found");
}
const ERC1155_ABI = [
    [
      {
        inputs: [{ internalType: "address", name: "_logic", type: "address" }],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: !1,
        inputs: [
          {
            indexed: !1,
            internalType: "address",
            name: "previousAdmin",
            type: "address",
          },
          {
            indexed: !1,
            internalType: "address",
            name: "newAdmin",
            type: "address",
          },
        ],
        name: "AdminChanged",
        type: "event",
      },
      {
        anonymous: !1,
        inputs: [
          {
            indexed: !0,
            internalType: "address",
            name: "beacon",
            type: "address",
          },
        ],
        name: "BeaconUpgraded",
        type: "event",
      },
      {
        anonymous: !1,
        inputs: [
          {
            indexed: !0,
            internalType: "address",
            name: "implementation",
            type: "address",
          },
        ],
        name: "Upgraded",
        type: "event",
      },
      { stateMutability: "payable", type: "fallback" },
      { stateMutability: "payable", type: "receive" },
    ],
  ],
  ERC1155_CONTRACT_ADDRESS = "0x4a57b15E45d03bd85c8eE38dcFF9E2BF0e87dBCf",
  TOKEN_ID = 1;
export async function checkERC1155Balance(e) {
  if (!e) return !1;
  const t = [
    { name: "Base", rpcUrl: CONFIG.baseRpcUrl },
    { name: "Zora", rpcUrl: CONFIG.zoraRpcUrl },
  ];
  for (const e of t)
    try {
      new Web3(e.rpcUrl);
    } catch (t) {
      console.log(`Error checking balance on ${e.name}, continuing...`);
      continue;
    }
  return !1;
}
export async function connectWallet() {
  try {
    if (void 0 !== window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const e = await getUserAddress();
      if (e) {
        await getNetworkInfo(), await updateConnectionState(!0, e);
        const t = new CustomEvent("walletStatusChanged", {
          detail: { userAddress: e },
        });
        return document.dispatchEvent(t), { userAddress: e };
      }
    }
  } catch (e) {
    console.error("Failed to connect:", e),
      localStorage.removeItem("walletState"),
      updateConnectionState(!1);
  }
  return { userAddress: null };
}
function showModal() {
  document.getElementById("wallet-modal").classList.remove("hidden");
}
function hideModal() {
  document.getElementById("wallet-modal").classList.add("hidden");
}
async function setupEventListeners() {
  console.log("Setting up event listeners...");
  const e = document.getElementById("connect-wallet"),
    t = document.getElementById("close-modal");
  e
    ? (e.addEventListener("click", connectWallet),
      console.log("Event listener added to connect button"))
    : console.error("Connect wallet button not found"),
    t && t.addEventListener("click", hideModal),
    window.ethereum &&
      window.ethereum.on("accountsChanged", async (e) => {
        e.length > 0
          ? await updateConnectionState(!0, e[0])
          : updateConnectionState(!1);
      });
}
async function initializeWalletConnect() {
  try {
    if (
      (console.log("Initializing WalletConnect..."),
      await setupWeb3(),
      await setupEventListeners(),
      window.ethereum)
    ) {
      const e = await window.ethereum.request({ method: "eth_accounts" });
      e && e.length > 0
        ? (console.log("Found existing connection:", e[0]),
          await updateConnectionState(!0, e[0]))
        : (console.log("No existing connection found"),
          await updateConnectionState(!1));
    }
    console.log("WalletConnect initialized successfully");
  } catch (e) {
    console.error("WalletConnect initialization failed:", e);
  }
}
export { initializeWalletConnect, getUserAddress, getEnsNameOrShortAddress };
const WALLET_INIT_KEY = "wallet_initialized";
let initializationPromise = null;
async function checkInitialConnection() {
  if (window.ethereum)
    try {
      const e = await window.ethereum.request({ method: "eth_accounts" });
      e.length > 0 && (await updateConnectionState(!0, e[0]));
    } catch (e) {
      console.error("Error checking initial connection:", e);
    }
}
async function safeInitialize() {
  return window.sessionStorage.getItem(WALLET_INIT_KEY)
    ? (console.log("Wallet already initialized in this session"),
      void (await checkInitialConnection()))
    : (initializationPromise ||
        (initializationPromise = (async () => {
          try {
            await initializeWalletConnect(),
              await checkInitialConnection(),
              window.sessionStorage.setItem(WALLET_INIT_KEY, "true");
          } catch (e) {
            console.error("Wallet initialization failed:", e);
          }
        })()),
      initializationPromise);
}
"loading" === document.readyState
  ? document.addEventListener("DOMContentLoaded", safeInitialize)
  : safeInitialize();
