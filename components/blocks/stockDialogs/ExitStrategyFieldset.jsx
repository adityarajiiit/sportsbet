
export default function ExitStrategyFieldset({
  exitPrice,
  onExitPriceChange,
  onTakeProfitToggle,
  stopLossPrice,
  onStopLossPriceChange,
  onStopLossToggle,
  theme = "info",
}) {
  return (
    <fieldset className="fieldset bg-base-100 rounded-box w-full border border-base-content p-4">
      <legend className="fieldset-legend text-base font-poppins px-2">Exit</legend>

      <label className="label">
        <input
          type="checkbox"
          className="checkbox"
          onChange={(e) => onTakeProfitToggle(e.target.checked)}
        />
        Take Profit
      </label>
      <p className="text-base font-semibold font-poppins flex justify-between w-full">
        Price <span>₹{exitPrice}</span>
      </p>
      <input
        type="number"
        min={0}
        max="1000000"
        step="5"
        value={exitPrice}
        className={`input input-${theme} rounded-md w-full`}
        onChange={(e) => onExitPriceChange(e.target.value)}
      />

      <label className="label mt-2">
        <input
          type="checkbox"
          className="checkbox"
          onChange={(e) => onStopLossToggle(e.target.checked)}
        />
        Stop Loss
      </label>
      <p className="text-base font-semibold font-poppins flex justify-between w-full">
        Price <span>₹{stopLossPrice}</span>
      </p>
      <input
        type="number"
        min={0}
        max="1000000"
        step="5"
        value={stopLossPrice}
        className={`input input-${theme} rounded-md w-full`}
        onChange={(e) => onStopLossPriceChange(e.target.value)}
      />
    </fieldset>
  );
}