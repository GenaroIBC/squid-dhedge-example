import { StakingResult } from "../types"

type Props = {
  status?: StakingResult | null
  tokenPrice?: number
}

export const StakingStatus = ({ status }: Props) => {
  const { tx = {}, axelarScanLink } = status ?? {}

  return (
    <>
      {status ? (
        <section className="shadow rounded-lg p-6 bg-slate-800">
          <h5 className="text-xl text-white font-semibold mb-4">
            Transaction Status
          </h5>
          <h6 className="mt-2 mb-4">
            <a className="text-sm" href={axelarScanLink} target="_blank">
              View on Axelarscan
            </a>
          </h6>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h6 className="text-base font-medium mb-2">Value</h6>
              <p className="whitespace-nowrap truncate text-xs">
                {tx.value.toString()}
              </p>
            </div>
            <div>
              <h6 className="text-base font-medium mb-2">Hash</h6>
              <p className="whitespace-nowrap truncate text-xs">{tx.hash}</p>
            </div>
            <div>
              <h6 className="text-base font-medium mb-2">From</h6>
              <p className="whitespace-nowrap truncate text-xs">{tx.from}</p>
            </div>
            <div>
              <h6 className="text-base font-medium mb-2">To</h6>
              <p className="whitespace-nowrap truncate text-xs">{tx.to}</p>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
