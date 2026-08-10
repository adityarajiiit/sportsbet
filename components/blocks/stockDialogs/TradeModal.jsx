import TradeDialogShell from "./TradeDialogShell";
import HoldingsSummary from "./HoldingsSummary";
import StockQuantityPicker from "./StockQuantityPicker";
import ExitStrategyFieldset from "./ExitStrategyFieldset";

export default function TradeModal({
  mode,
  id,
  open,
  entity,
  stockholder,
  price,
  maxShares,
  quantity,
  onQuantityChange,
  exitPrice,
  onExitPriceChange,
  onTakeProfitToggle,
  stopLossPrice,
  onStopLossPriceChange,
  onStopLossToggle,
  onSubmit,
  sellButtonBorderless = false,
}) {
  const theme = mode === "buy" ? "info" : "error";
  const label = mode === "buy" ? "Buy" : "Sell";
  const showSummary = mode === "sell" || stockholder.shares > 0;

  return (
    <TradeDialogShell id={id} open={open} player={entity} theme={theme}>
      {showSummary && (
        <HoldingsSummary
          shares={stockholder.shares}
          averagePrice={stockholder.averageprice}
          currentPrice={price}
          theme={theme}
        />
      )}

      <p className="text-sm mt-2">Number of stocks</p>

      <form action="" className="mt-4 flex flex-col gap-2">
        <StockQuantityPicker
          value={quantity}
          onChange={onQuantityChange}
          max={maxShares}
          price={price}
          theme={theme}
        />

        <ExitStrategyFieldset
          exitPrice={exitPrice}
          onExitPriceChange={onExitPriceChange}
          onTakeProfitToggle={onTakeProfitToggle}
          stopLossPrice={stopLossPrice}
          onStopLossPriceChange={onStopLossPriceChange}
          onStopLossToggle={onStopLossToggle}
          theme={theme}
        />

        <button
          className={`btn btn-${theme} font-poppins ${mode === "sell" && sellButtonBorderless ? "border-none" : ""} text-base mt-1`}
          onClick={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {label}
        </button>
      </form>
    </TradeDialogShell>
  );
}