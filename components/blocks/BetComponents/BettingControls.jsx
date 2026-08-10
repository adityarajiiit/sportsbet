import BetModal from "./BetModal";
export default function BettingControls({
  score,
  matchbets,
  buyamount,
  setBuyAmount,
  buyamount2,
  setBuyAmount2,
  walletBalance,
  ExitPrice,
  setExitPrice,
  StopLossPrice,
  setStopLossPrice,
  setIstakeprofitchecked,
  setIsstoplosschecked,
  newBet,
}) {
  return (
    <div className="relative lg:max-w-5xl flex flex-col gap-2.5">
      <div className="flex justify-center items-center gap-4 w-full relative">
        <div className="w-full">
          <button
            className="btn btn-active rounded-md p-5 btn-accent w-full"
            onClick={() => document.getElementById("my_modal_3").showModal()}
          >
            {score.team1} <span className="font-poppins font-bold">x{matchbets[0]?.odds}</span>
          </button>
          <BetModal
            id="my_modal_3"
            theme="accent"
            team1Name={score.team1}
            team2Name={score.team2}
            teamName={score.team1}
            amount={buyamount}
            onAmountChange={setBuyAmount}
            walletBalance={walletBalance}
            exitPrice={ExitPrice}
            onExitPriceChange={setExitPrice}
            onTakeProfitToggle={setIstakeprofitchecked}
            stopLossPrice={StopLossPrice}
            onStopLossPriceChange={setStopLossPrice}
            onStopLossToggle={setIsstoplosschecked}
            onPlaceBet={() => newBet("team1")}
          />
        </div>

        <div className="w-full">
          <button
            className="btn btn-active p-5 rounded-md btn-info w-full backdrop-blur-md"
            onClick={() => document.getElementById("my_modal_1").showModal()}
          >
            {score.team2} <span className="font-poppins font-bold">x{matchbets[1]?.odds}</span>
          </button>
          <BetModal
            id="my_modal_1"
            theme="info"
            team1Name={score.team1}
            team2Name={score.team2}
            teamName={score.team2}
            amount={buyamount2}
            onAmountChange={setBuyAmount2}
            walletBalance={walletBalance}
            exitPrice={ExitPrice}
            onExitPriceChange={setExitPrice}
            onTakeProfitToggle={setIstakeprofitchecked}
            stopLossPrice={StopLossPrice}
            onStopLossPriceChange={setStopLossPrice}
            onStopLossToggle={setIsstoplosschecked}
            onPlaceBet={() => newBet("team2")}
          />
        </div>
      </div>
    </div>
  );
}