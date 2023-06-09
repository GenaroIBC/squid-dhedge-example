import { KnownResponse } from "../types"
import { RouteData } from "@0xsquid/sdk"
import { SquidCallType } from "@0xsquid/sdk"
import { ethers } from "ethers"
import erc20abi from "../abi/erc20.json"
import wrcAbi from "../abi/wrcTokenAbi.json"
import squidClient from "../lib/squidClient"
import { USDC_CONTRACT_ADDRESS, WRC_CONTRACT_ADDRESS } from "../constants"

type Params = {
  fromChain: number
  fromToken: string
  weiAmount: string
  signer: ethers.Wallet | ethers.Signer
}

export async function quoteWRCToken({
  fromChain,
  fromToken,
  weiAmount,
  signer
}: Params): Promise<KnownResponse<RouteData>> {
  try {
    const signerAddress = await signer.getAddress()

    const erc20Interface = new ethers.utils.Interface(erc20abi)
    const wrcInterface = new ethers.utils.Interface(wrcAbi)

    const approveEncodedData = erc20Interface.encodeFunctionData("approve", [
      WRC_CONTRACT_ADDRESS,
      0
    ])

    const depositEncodedData = wrcInterface.encodeFunctionData("depositFor", [
      signerAddress,
      USDC_CONTRACT_ADDRESS,
      0
    ])

    const { route } = await squidClient.getRoute({
      toAddress: signerAddress,
      fromChain,
      fromToken,
      fromAmount: weiAmount,
      toChain: 137,
      toToken: squidClient.tokens.find(
        t => t.symbol.toLowerCase() == "usdc" && t.chainId === 137
      )?.address as string,
      slippage: 99,
      customContractCalls: [
        {
          callData: approveEncodedData,
          callType: SquidCallType.FULL_TOKEN_BALANCE,
          estimatedGas: "250000",
          target: USDC_CONTRACT_ADDRESS,
          payload: {
            inputPos: 1,
            tokenAddress: USDC_CONTRACT_ADDRESS
          }
        },
        {
          callData: depositEncodedData,
          callType: SquidCallType.FULL_TOKEN_BALANCE,
          estimatedGas: "250000",
          target: WRC_CONTRACT_ADDRESS,
          payload: {
            inputPos: 2,
            tokenAddress: USDC_CONTRACT_ADDRESS
          }
        }
      ]
    })

    return { ok: true, data: route }
  } catch (error) {
    return {
      ok: false,
      error: "there was an error getting token quote"
    }
  }
}
