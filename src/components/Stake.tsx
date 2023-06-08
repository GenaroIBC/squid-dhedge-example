import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useCallback, useEffect, useRef, useState } from "react"
import { stakeWRC } from "../services/stakeWRC"
import type { ChainData, RouteData, TokenData } from "@0xsquid/sdk"
import { ethers } from "ethers"
import { List } from "./shared/List"
import { ListItem } from "./shared/ListItem"
import { Dropdown } from "./shared/Dropdown"
import { Loading } from "./shared/Loading"
import squidClient from "../lib/squidClient"
import { StakingStatus } from "./StakingStatus"
import { AmountForm } from "./shared/AmountForm"
import { getTokenPrice } from "../services/getTokenPrice"
import { useNetwork, useSigner } from "wagmi"
import { quoteWRCToken } from "../services/quoteWRCToken"
import { switchNetwork } from "wagmi/actions"
import { getMGLMRBalance } from "../services/getMGLMRBalance"
import { TokenBalance } from "./TokenBalance"
import { WRCTokenSection } from "./WRCTokenSection"
import { ArrowDownIcon } from "./shared/ArrowDownIcon"

export function Stake() {
  const currentNetwork = useNetwork()
  const [selectedChain, setSelectedChain] = useState<Partial<ChainData>>(
    squidClient.chains.find(
      chain => chain.chainId === currentNetwork.chain?.id
    ) ?? squidClient.chains[0]
  )
  const [selectedToken, setSelectedToken] = useState<Partial<TokenData>>(
    squidClient.tokens.find(token => token.chainId === selectedChain.chainId) ??
      squidClient.tokens[0]
  )
  const signer = useSigner()

  const [status, setStatus] =
    useState<ethers.providers.TransactionResponse | null>(null)
  const [amount, setAmount] = useState("0")
  const [tokenPrice, setTokenPrice] = useState(0)
  const [isFetchingQuote, setIsFetchingQuote] = useState(false)
  const [isFetchingTokenPrice, setIsFetchingTokenPrice] = useState(false)
  const [isFetchingUserBalance, setIsFetchingUserBalance] = useState(false)

  const [isStaking, setIsStaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [route, setRoute] = useState<RouteData | null>(null)
  const [mglmrBalance, setMglmrBalance] = useState<string | null>(null)

  const handleStake = () => {
    if (!signer.data || !route) return

    setIsStaking(true)
    setError(null)
    setStatus(null)
    stakeWRC({
      signer: signer.data,
      route
    })
      .then(response => {
        if (!response.ok) return setError(response.error)
        setStatus(response.data)
        updateMGLMRBalance({ delay: 3000 })
      })
      .finally(() => setIsStaking(false))
  }

  const handleChangeChain = (chain: ChainData) => {
    const firstTokenOnNewChain =
      squidClient.tokens.find(token => token.chainId === chain.chainId) ??
      squidClient.tokens[0]

    setSelectedToken(firstTokenOnNewChain)
    setSelectedChain(chain)
    handleQuoteToken({ amount })
    handleGetTokenPrice({ token: firstTokenOnNewChain })
    switchNetwork({ chainId: Number(chain.chainId) })
  }

  const handleChangeToken = (token: TokenData) => {
    setSelectedToken(token)
    handleQuoteToken({ amount })
    handleGetTokenPrice({ token })
  }

  const updateMGLMRBalance = useCallback(
    async ({ delay }: { delay: number }) => {
      setIsFetchingUserBalance(true)

      setTimeout(() => {
        if (!signer.data) return

        getMGLMRBalance({ signer: signer.data }).then(result => {
          setIsFetchingUserBalance(false)
          if (!result.ok) return
          setMglmrBalance(result.data)
        })
      }, delay)
    },
    [signer.data]
  )

  const handleQuoteToken = async ({ amount }: { amount: string }) => {
    const { address, decimals } = selectedToken
    const { chainId } = selectedChain
    if (!chainId || !address || !decimals || !signer.data || !Number(amount))
      return
    setIsFetchingQuote(true)
    setRoute(null)
    quoteWRCToken({
      fromChain: Number(chainId),
      fromToken: address,
      weiAmount: ethers.utils.parseUnits(amount, decimals).toString(),
      signer: signer.data
    })
      .then(result => {
        if (!result.ok) return setError(result.error)
        return setRoute(result.data)
      })
      .finally(() => {
        setIsFetchingQuote(false)
      })
  }

  const handleGetTokenPrice = async ({
    token
  }: {
    token: Partial<TokenData>
  }) => {
    const { chainId, address } = token
    if (!chainId || !address) return

    setTokenPrice(0)
    setIsFetchingTokenPrice(true)
    getTokenPrice({
      chainId: String(chainId),
      tokenAddress: address
    })
      .then(result => {
        if (!result.ok) return setError(result.error)
        return setTokenPrice(result.data)
      })
      .finally(() => {
        setIsFetchingTokenPrice(false)
      })
  }

  const handleChangeSquidBaseURL = async (event: React.FormEvent) => {
    event.preventDefault()

    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    const squidBaseURL = String(formData.get("squid-base-url")).trim()
    if (squidBaseURL) {
      squidClient.setConfig({
        baseUrl: squidBaseURL
      })

      form.reset()
    }
  }

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      handleGetTokenPrice({ token: selectedToken })
      isFirstRender.current = false
    }
  }, [selectedToken])

  useEffect(() => {
    updateMGLMRBalance({ delay: 0 })
  }, [updateMGLMRBalance, signer.data])

  return (
    <section className="flex mx-auto flex-col gap-2 p-4 rounded-md h-screen bg-slate-900">
      <nav className="flex justify-between w-full gap-2 items-center max-w-5xl mx-auto">
        <form onSubmit={handleChangeSquidBaseURL} className="flex gap-2">
          <input
            type="url"
            name="squid-base-url"
            id="squid-base-url"
            placeholder="Squid Base URL"
            className="p-2 text-sm bg-slate-800 focus:bg-slate-70 rounded-md min-w-0 w-full flex-grow-0 placeholder-gray-400 text-white focus:outline-none"
          />
          <button className="bg-blue-500 rounded-md text-sm py-2 p-4 w-fit whitespace-nowrap hover:bg-blue-600">
            Change URL
          </button>
        </form>

        <ConnectButton />
      </nav>

      {signer.data && (
        <section className="flex flex-col items-center justify-center my-20 max-w-md mx-auto">
          <div className={isFetchingUserBalance ? "animate-pulse" : ""}>
            <TokenBalance
              balance={String(mglmrBalance ?? 0)}
              tokenName="mGLMR"
            />
          </div>

          <article className="flex gap-2 items-center justify-between bg-blue-950 p-4 rounded-tr-md rounded-tl-md">
            <div className="flex flex-col gap-2 w-1/2 overflow-hidden">
              <AmountForm
                debounceTime={500}
                handleChange={newAmount => {
                  setAmount(newAmount)
                  handleQuoteToken({ amount: newAmount })
                }}
              />

              {isFetchingTokenPrice ? (
                <div className="flex items-center relative w-12 text-sm text-transparent">
                  <span className="select-none">0</span>
                  <div className="absolute h-2 w-full bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <span className="text-gray-400 w-full text-sm">
                  ${tokenPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <Dropdown
                label={
                  <span className="text-white flex gap-2 items-center text-base">
                    <img
                      className="w-6 h-6 aspect-square rounded-full"
                      src={selectedChain.chainIconURI}
                      alt={selectedChain.networkName}
                    />
                    {selectedChain.networkName}
                  </span>
                }
              >
                <List>
                  {squidClient.chains
                    .filter(chain => chain.chainType !== "cosmos")
                    .map((chain, i) => (
                      <ListItem
                        key={i}
                        imgAlt={chain.networkName}
                        imgSrc={chain.chainIconURI}
                        title={chain.networkName}
                        subtitle={chain.nativeCurrency.symbol}
                        onClick={() => handleChangeChain(chain)}
                      />
                    ))}
                </List>
              </Dropdown>
              <Dropdown
                label={
                  <span className="text-white flex gap-2 items-center text-base">
                    <img
                      className="w-6 h-6 aspect-square rounded-full"
                      src={selectedToken.logoURI}
                      alt={selectedToken.name}
                    />
                    {selectedToken.symbol}
                  </span>
                }
              >
                <List>
                  {squidClient.tokens
                    .filter(token => token.chainId === selectedChain.chainId)
                    .map((token, i) => (
                      <ListItem
                        key={i}
                        imgAlt={token.name}
                        imgSrc={token.logoURI}
                        title={token.symbol}
                        subtitle={token.name}
                        onClick={() => handleChangeToken(token)}
                      />
                    ))}
                </List>
              </Dropdown>
            </div>
          </article>

          <div className="z-0 relative w-full flex justify-center items-center bg-blue-950 after:content-[''] after:w-full after:h-0.5 after:bg-gray-500 after:absolute after:z-10">
            <ArrowDownIcon />
          </div>

          <WRCTokenSection
            amount={(Number(route?.estimate.toAmount ?? 0) / 1e18).toFixed(2)}
            isLoadingAmount={isFetchingQuote}
          />

          <button
            className="bg-blue-500 flex justify-center items-center py-2 px-4 text-white w-full mt-4"
            disabled={
              isStaking ||
              !Number(amount) ||
              !selectedToken.address ||
              !selectedChain.chainId ||
              !route
            }
            onClick={handleStake}
          >
            {isStaking ? (
              <Loading width="1.5rem" height="1.5rem" />
            ) : (
              <>Stake</>
            )}
          </button>
          {error && (
            <p className="relative overflow-hidden w-full text-red-400 text-xs border-2 border-red-400 bg-red-950 text-center py-2 px-2 rounded-md">
              <button
                onClick={() => setError(null)}
                title="Hide error message"
                className="absolute top-1 right-1 bg-red-950 border-2 border-red-400 hover:!border-red-400 hover:bg-red-900 px-1.5 py-0.5"
              >
                x
              </button>
              {error}
            </p>
          )}

          <StakingStatus status={status} tokenPrice={tokenPrice} />
        </section>
      )}
    </section>
  )
}
