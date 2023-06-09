import { Chain } from "@rainbow-me/rainbowkit"
import ENV from "../config/env"
import { mainnet, avalanche, optimism, arbitrum } from "wagmi/chains"

const avalancheLocalChain: Chain = {
  id: 43_114,
  name: "Avalanche local",
  network: "avalanche",
  iconUrl: "https://axelarscan.io/logos/chains/avalanche.svg",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX"
  },
  rpcUrls: {
    public: { http: [""] },
    default: {
      http: [ENV.VITE_AVALANCHE_RPC_ENDPOINT]
    }
  },
  testnet: true
}

const ethereumLocalChain: Chain = {
  id: 1,
  name: "Ethereum local",
  network: "ethereum",
  iconUrl:
    "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    public: { http: [""] },
    default: {
      http: [ENV.VITE_ETHEREUM_RPC_ENDPOINT]
    }
  },
  testnet: true
}

export const CHAINS = import.meta.env.DEV
  ? [avalancheLocalChain, ethereumLocalChain]
  : [mainnet, avalanche, arbitrum, optimism]
