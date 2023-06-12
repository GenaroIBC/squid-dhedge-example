import { useEffect, useState } from "react"
import { getWRCPrice } from "../services/getWRCPrice"

type Props = {
  fromAmount: string
  isLoadingAmount: boolean
  fromTokenPrice: number
}

export function WRCTokenSection({
  fromAmount,
  isLoadingAmount,
  fromTokenPrice
}: Props) {
  const [wrcTokenPrice, setWrcTokenPrice] = useState(0)
  const [isFetchingTokenPrice, setIsFetchingTokenPrice] = useState(false)

  const estimatedWRCAmount = String(
    Number(fromAmount) * (wrcTokenPrice / fromTokenPrice)
  )

  useEffect(() => {
    setWrcTokenPrice(0)
    setIsFetchingTokenPrice(true)
    getWRCPrice()
      .then(result => {
        if (!result.ok) return

        return setWrcTokenPrice(result.data.price)
      })
      .finally(() => {
        setIsFetchingTokenPrice(false)
      })
  }, [])

  return (
    <article className="flex gap-2 items-center justify-between bg-blue-950 p-4 rounded-br-md rounded-bl-md w-full">
      <div className="flex flex-col gap-2 w-1/2 overflow-hidden">
        <form className="relative flex flex-col gap-2 justify-center w-full font-bold text-2xl">
          {isLoadingAmount ? (
            <div className="flex items-center relative text-transparent w-fit">
              <span className="select-none">{estimatedWRCAmount}</span>
              <div className="absolute h-4 w-full bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          ) : (
            <span className="text-white">
              {!estimatedWRCAmount ? (0).toFixed(2) : estimatedWRCAmount}
            </span>
          )}
        </form>

        {isFetchingTokenPrice ? (
          <div className="flex items-center relative w-12 text-sm text-transparent">
            <span className="select-none">0</span>
            <div className="absolute h-2 w-full bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <span className="text-gray-400 w-full text-sm">
            ${wrcTokenPrice.toFixed(2)}
          </span>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="relative w-fit flex gap-2">
          <label className="flex items-center gap-2 space-x-1 bg-white/10 p-2 rounded-xl font-bold">
            <span className="text-white flex gap-2 items-center text-base">
              <img
                className="w-6 h-6 aspect-square rounded-full"
                src="https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png"
                alt="Polygon"
              />
              Polygon
            </span>
          </label>
          <div className="w-full pointer-events-none absolute mt-1 right-0 top-full min-w-max shadow rounded-xl opacity-0 bg-gray-300 border border-gray-700 transition delay-75 ease-in-out z-10 overflow-hidden">
            <ul className="flex flex-col flex-grow rounded-xl bg-slate-800 max-h-96 overflow-auto">
              <li className="flex items-center p-2 gap-2 border-b border-gray-700 bg-slate-900 hover:bg-slate-800">
                <img
                  className="w-6 h-6 aspect-square rounded-full"
                  src="https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
                  alt="Ethereum"
                />
                <h4 className="font-bold">Ethereum</h4>
                <p className="text-sm text-gray-400">ETH</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="relative w-fit flex gap-2">
          <label className="peer flex items-center gap-2 space-x-1 bg-white/10 p-2 rounded-xl font-bold">
            <span className="text-white flex gap-2 items-center text-base">
              <img
                className="w-6 h-6 aspect-square rounded-full"
                src="https://polygonscan.com/images/main/empty-token.png"
                alt="WRC"
              />
              WRC
            </span>
          </label>
        </div>
      </div>
    </article>
  )
}
