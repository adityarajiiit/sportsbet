import ExitStrategyFieldset from "./ExitStrategyFieldset";
export default function BetModal({
  id,
  theme,
  team1Name,
  team2Name,
  teamName,
  amount,
  onAmountChange,
  walletBalance,
  exitPrice,
  onExitPriceChange,
  takeProfitChecked,
  onTakeProfitToggle,
  stopLossPrice,
  onStopLossPriceChange,
  stopLossChecked,
  onStopLossToggle,
  onPlaceBet,
}) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <p className="pb-2 text-xs font-poppins">Press ESC key or click on ✕ button to close</p>
        <h3 className="text-lg font-semibold font-poppins">
          {team1Name} VS {team2Name}
        </h3>
        <div className={`badge badge-soft badge-${theme} rounded-sm text-sm mt-2`}>
          {teamName}
        </div>
        <div className="mt-2 bg-base-300 p-2 rounded-lg">
          <div className="bg-base-100 border-base-300 p-6">
            <p className="text-sm">Amount</p>
            <form action="" className="mt-4 flex flex-col gap-2">
              <input
                type="range"
                min={0}
                max={walletBalance}
                className={`range range-${theme === "accent" ? "success" : theme}`}
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
              />
              <input
                type="number"
                min={0}
                max={walletBalance}
                className={`input input-${theme === "accent" ? "success" : theme} w-full`}
                value={amount}
                onChange={(e) =>
                  onAmountChange(Math.min(parseFloat(e.target.value) || 0, walletBalance))
                }
              />
              <p className="ml-2 text-2xl font-medium font-inter">${amount}</p>

              <ExitStrategyFieldset
                exitPrice={exitPrice}
                onExitPriceChange={onExitPriceChange}
                takeProfitChecked={takeProfitChecked}
                onTakeProfitToggle={onTakeProfitToggle}
                stopLossPrice={stopLossPrice}
                onStopLossPriceChange={onStopLossPriceChange}
                stopLossChecked={stopLossChecked}
                onStopLossToggle={onStopLossToggle}
                theme={theme}
              />

              <button
                className={`btn btn-${theme} font-poppins text-base mt-1`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id).close();
                  onPlaceBet();
                }}
              >
                Place Bet
              </button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  );
}