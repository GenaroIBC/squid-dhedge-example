import type { KnownResponse, StakingResult } from "../types"
import { SquidError } from "@0xsquid/sdk/dist/error"
import squid from "../lib/squidClient"
import { ethers } from "ethers"
import { RouteData } from "@0xsquid/sdk"

type Params = {
  signer: ethers.Signer | ethers.Wallet
  route: RouteData
}

export async function stakeWRC({
  signer,
  route
}: Params): Promise<KnownResponse<StakingResult>> {
  try {
    const tx = await squid.executeRoute({
      signer,
      route
    })

    const { transactionHash } = await tx.wait()

    const axelarScanLink = `https://axelarscan.io/gmp/${transactionHash}`

    return {
      ok: true,
      data: { tx, axelarScanLink }
    }
  } catch (error) {
    return {
      ok: false,
      error: error
        ? (error as SquidError)?.errors?.[0]?.message ??
          (error as SquidError)?.message
        : "There was an error, please try again later"
    }
  }
}
