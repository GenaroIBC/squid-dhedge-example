import { Chain } from "@rainbow-me/rainbowkit"
import ENV from "../config/env"
import { mainnet, avalanche, polygon } from "wagmi/chains"

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

const polygonLocalChain: Chain = {
  id: 137,
  name: "Polygon local",
  network: "polygon",
  iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Matic",
    symbol: "MATIC"
  },
  rpcUrls: {
    public: { http: [""] },
    default: {
      http: [ENV.VITE_POLYGON_RPC_ENDPOINT]
    }
  },
  testnet: true
}

export const CHAINS = import.meta.env.DEV
  ? [avalancheLocalChain, ethereumLocalChain, polygonLocalChain]
  : [mainnet, avalanche, polygon]
