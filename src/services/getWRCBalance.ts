import { ethers } from "ethers"
import { WRC_CONTRACT_ADDRESS } from "../constants"
import ENV from "../config/env"
import { KnownResponse } from "../types"
import wrcAbi from "../abi/wrcTokenAbi.json"

type Params = {
  signer: ethers.Signer | ethers.Wallet
}

export async function getWRCBalance({
  signer
}: Params): Promise<KnownResponse<string>> {
  const address = await signer.getAddress()

  if (!address) return { ok: false, error: "Could not retrieve signer address" }

  const provider = new ethers.providers.JsonRpcProvider(
    ENV.VITE_POLYGON_RPC_ENDPOINT
  )

  const contract = new ethers.Contract(WRC_CONTRACT_ADDRESS, wrcAbi, provider)

  const balance = (await contract.balanceOf(address)) as ethers.BigNumber

  return { ok: true, data: balance.toString() }
}
