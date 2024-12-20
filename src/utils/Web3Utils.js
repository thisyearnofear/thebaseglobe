// sourcery skip: flip-comparison
import { BrowserProvider, Contract } from "ethers";
const BASE_CONTRACT = "0x39e6EED85927e0203c2ae9790eDaeB431B8e43c1",
  ZORA_CONTRACT = "0x4a57b15e45d03bd85c8ee38dcff9e2bf0e87dbcf",
  ERC721_ABI = [
    {
      constant: !0,
      inputs: [{ name: "owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      payable: !1,
      stateMutability: "view",
      type: "function",
    },
  ],
  ERC1155_ABI = [
    {
      constant: !0,
      inputs: [
        { name: "account", type: "address" },
        { name: "id", type: "uint256" },
      ],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      payable: !1,
      stateMutability: "view",
      type: "function",
    },
  ],
  ERC20_ABI = [
    {
      constant: !0,
      inputs: [{ name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      payable: !1,
      stateMutability: "view",
      type: "function",
    },
  ],
  wait = (e) => new Promise((t) => setTimeout(t, e));
async function getProvider(e) {
  if ((console.log("Getting provider for network:", e), !window.ethereum))
    throw new Error("No ethereum provider found");
  try {
    if ("zora" === e) {
      console.log("Switching to Zora network...");
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x76adf1" }],
        }),
          await wait(500);
      } catch (e) {
        if (
          (console.error("Failed to switch to Zora network:", e),
          4902 !== e.code)
        )
          throw e;
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x76adf1",
                chainName: "Zora",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://rpc.zora.energy"],
                blockExplorerUrls: ["https://explorer.zora.energy"],
              },
            ],
          });
        } catch (e) {
          throw (console.error("Failed to add Zora network:", e), e);
        }
      }
    }
    if ("base" === e)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }],
        }),
          await wait(500);
      } catch (e) {
        4902 === e.code &&
          (await window.ethereum.request({
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
          }));
      }
    console.log(`Creating BrowserProvider for ${e}...`);
    const t = new BrowserProvider(window.ethereum);
    return console.log(`Provider created successfully for ${e}`), t;
  } catch (t) {
    throw (console.error(`Error getting provider for ${e}:`, t), t);
  }
}
export async function checkBaseTokenOwnership() {
  try {
    console.log("Starting Base token ownership check...");
    const e = await getProvider("base"),
      t = await e.getSigner(),
      o = await t.getAddress();
    console.log(`Checking Base token ownership for address: ${o}`);
    for (const [t, a] of [
      ["ERC721", ERC721_ABI],
      ["ERC1155", ERC1155_ABI],
      ["ERC20", ERC20_ABI],
    ])
      try {
        console.log(`Trying ${t} check for Base token...`);
        const r = new Contract(BASE_CONTRACT, a, e);
        if ("0x" === (await e.getCode(BASE_CONTRACT)))
          return (
            console.error(`No contract found at address: ${BASE_CONTRACT}`), !1
          );
        const n =
          "ERC1155" === t ? await r.balanceOf(o, 1) : await r.balanceOf(o);
        if ((console.log(`Base token ${t} balance:`, n.toString()), n > 0))
          return (
            console.log(`Base token found as ${t} with positive balance`), !0
          );
      } catch (e) {
        console.log(`Base token not ${t}, trying next type...`, e.message);
      }
    return (
      console.log("Base token does not match any known token standard"), !1
    );
  } catch (e) {
    return console.error("Error in Base token ownership check:", e), !1;
  }
}
export async function checkZoraTokenOwnership() {
  try {
    console.log("Starting Zora token ownership check...");
    const e = await getProvider("zora"),
      t = await e.getSigner(),
      o = await t.getAddress();
    console.log(`Checking Zora token ownership for address: ${o}`);
    const a = new Contract(ZORA_CONTRACT, ERC721_ABI, e);
    let r = 0;
    try {
      r = await a.balanceOf(o);
    } catch (t) {
      console.log("ERC721 check failed, trying ERC1155...");
      const a = new Contract(ZORA_CONTRACT, ERC1155_ABI, e);
      r = await a.balanceOf(o, 1);
    }
    return console.log(`Zora token balance: ${r.toString()}`), r > 0;
  } catch (e) {
    return console.error("Error checking Zora token ownership:", e), !1;
  }
}
