import TradeModal from "./TradeModal";
export default function TeamTradeControls({
  team,
  teamStock,
  stockholder,
  noOfStocks,
  setnoOfStocks,
  noOfStocksSell,
  setnoOfStocksSell,
  ExitPrice,
  setExitPrice,
  StopLossPrice,
  setStopLossPrice,
  setBuyTakeProfit,
  setBuyStopLoss,
  setSellTakeProfit,
  setSellStopLoss,
  newBuytransaction,
  newSelltransaction,
}) {
  return (
    <div className="flex md:flex-col items-center justify-center md:justify-start gap-2 h-full  w-full sm:max-w-40">
      <button
        className="btn btn-active btn-info w-full sm:max-w-40 rounded-xl shrink font-poppins font-semibold"
        onClick={() => document.getElementById("Buy_stock").showModal()}
      >
        Buy
      </button>

      <TradeModal
        mode="buy"
        id="Buy_stock"
        entity={team}
        stockholder={stockholder}
        price={teamStock.price}
        maxShares={teamStock.shares}
        quantity={noOfStocks}
        onQuantityChange={setnoOfStocks}
        exitPrice={ExitPrice}
        onExitPriceChange={setExitPrice}
        onTakeProfitToggle={setBuyTakeProfit}
        stopLossPrice={StopLossPrice}
        onStopLossPriceChange={setStopLossPrice}
        onStopLossToggle={setBuyStopLoss}
        onSubmit={() => {
          newBuytransaction(
            noOfStocks,
            teamStock.price,
            noOfStocks * teamStock.price,
          );
        }}
      />

      <button
        className={`btn btn-active btn-error w-full sm:max-w-40 rounded-xl shrink font-poppins font-semibold ${
          stockholder.shares === 0 ? "btn-disabled" : ""
        }`}
        onClick={() => document.getElementById("sell_stocks").showModal()}
      >
        Sell
      </button>

      <TradeModal
        mode="sell"
        id="sell_stocks"
        entity={team}
        stockholder={stockholder}
        price={teamStock.price}
        maxShares={stockholder.shares || 0}
        quantity={noOfStocksSell}
        onQuantityChange={setnoOfStocksSell}
        exitPrice={ExitPrice}
        onExitPriceChange={setExitPrice}
        onTakeProfitToggle={setSellTakeProfit}
        stopLossPrice={StopLossPrice}
        onStopLossPriceChange={setStopLossPrice}
        onStopLossToggle={setSellStopLoss}
        onSubmit={() => {
          newSelltransaction(
            noOfStocksSell,
            teamStock.price,
            noOfStocksSell * teamStock.price,
          );
        }}
      />
    </div>
  );
}
