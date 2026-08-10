
export default function HoldingsSummary({ shares, averagePrice, currentPrice, theme = "info" }) {
  const pnl = (currentPrice - averagePrice) * shares;
  const isProfit = pnl >= 0;

  return (
    <div className="mt-2 p-2 bg-base-200 rounded-lg text-xs font-poppins">
      <p>
        You hold{" "}
        <span className={`font-bold text-${theme}`}>{shares} shares</span>{" "}
        @ avg ₹{averagePrice?.toFixed(2)}
      </p>
      <p>
        P&L:{" "}
        <span className={isProfit ? "text-success" : "text-error"}>
          {isProfit ? "+" : ""}
          {pnl.toFixed(2)}
        </span>
      </p>
    </div>
  );
}