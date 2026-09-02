import TradeModal from "./TradeModal";

export default function PlayerTradeControls({
  player,
  playerStock,
  stockholder,
  buyDialog,
  setBuyDialog,
  sellDialog,
  setSellDialog,
  noOfStocks,
  setnoOfStocks,
  noOfStocksSell,
  setnoOfStocksSell,
  ExitPrice,
  setExitPrice,
  StopLossPrice,
  setStopLossPrice,
  buyTakeProfit,
  buyStopLoss,
  sellTakeProfit,
  sellStopLoss,
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
        open={buyDialog}
        entity={player}
        stockholder={stockholder}
        price={playerStock.price}
        maxShares={playerStock.shares}
        quantity={noOfStocks}
        onQuantityChange={setnoOfStocks}
        exitPrice={ExitPrice}
        onExitPriceChange={setExitPrice}
        takeProfitChecked={buyTakeProfit}
        onTakeProfitToggle={setBuyTakeProfit}
        stopLossPrice={StopLossPrice}
        onStopLossPriceChange={setStopLossPrice}
        stopLossChecked={buyStopLoss}
        onStopLossToggle={setBuyStopLoss}
        onSubmit={() => {
          newBuytransaction(noOfStocks, playerStock.price, noOfStocks * playerStock.price);
          setBuyDialog(false);
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
        open={sellDialog}
        entity={player}
        stockholder={stockholder}
        price={playerStock.price}
        maxShares={stockholder.shares || 0}
        quantity={noOfStocksSell > stockholder.shares ? stockholder.shares : noOfStocksSell}
        onQuantityChange={setnoOfStocksSell}
        exitPrice={ExitPrice}
        onExitPriceChange={setExitPrice}
        takeProfitChecked={sellTakeProfit}
        onTakeProfitToggle={setSellTakeProfit}
        stopLossPrice={StopLossPrice}
        onStopLossPriceChange={setStopLossPrice}
        stopLossChecked={sellStopLoss}
        onStopLossToggle={setSellStopLoss}
        sellButtonBorderless
        onSubmit={() => {
          newSelltransaction(
            noOfStocksSell,
            playerStock.price,
            noOfStocksSell * playerStock.price,
          );
          setSellDialog(false);
        }}
      />
    </div>
  );
}