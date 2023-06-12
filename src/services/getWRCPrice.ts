import { ethers } from "ethers"
import { WRC_CONTRACT_ADDRESS } from "../constants"
import wrcAbi from "../abi/wrcTokenAbi.json"
import { KnownResponse } from "../types"

const POLYGON_RPC_URL = "https://polygon-rpc.com"

export async function getWRCPrice(): Promise<KnownResponse<{ price: number }>> {
  try {
    const wrcInterface = new ethers.utils.Interface(wrcAbi)
    const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC_URL)

    const contract = new ethers.Contract(
      WRC_CONTRACT_ADDRESS,
      wrcInterface,
      provider
    )

    const price = await contract.tokenPriceWithoutManagerFee()

    let priceString: string = price.toString()

    if (priceString.length <= 18) {
      const missingZeros = 18 - priceString.length
      priceString = `0.${"0".repeat(missingZeros)}${priceString}`
    }

    const formattedPrice = parseFloat(priceString.slice(0, 10))

    return { ok: true, data: { price: formattedPrice } }
  } catch (error) {
    return {
      ok: false,
      error: "There was an error getting WRC price"
    }
  }
}
