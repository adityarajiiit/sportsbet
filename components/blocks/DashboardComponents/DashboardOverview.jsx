import { GiCardAceSpades, GiProfit } from "react-icons/gi";
import { MdSavings } from "react-icons/md";
import { FaBitcoin } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";
import StatCard from "./StatCard";
import HistoryTable from "./HistoryTable";
import { naOr } from "./naOr";
import NoDataState from "@/components/ui/NoDataState";

export default function DashboardOverview({ user }) {
  if (!user) {
    return (
      <NoDataState
        title="Dashboard data unavailable"
        description="Wallet, betting, and trading summaries will appear here once your account data has loaded."
        className="min-h-[40rem] flex items-center justify-center"
      />
    );
  }

  const stats = [
    {
      name: "Bets",
      icon: <GiCardAceSpades className="size-6 p-1 rounded-xl bg-warning/10 fill-warning" />,
      value: user?.betscount,
    },
    {
      name: "Profits",
      icon: <GiProfit className="size-6 p-1 rounded-xl bg-warning/10 fill-warning" />,
      value: user?.profitamount !== undefined && user?.profitamount !== null ? "₹" + user.profitamount : null,
    },
    {
      name: "Player Stocks",
      icon: <MdSavings className="size-6 p-1 rounded-xl bg-warning/10 fill-warning" />,
      value: user?.playerstockcount,
    },
    {
      name: "Team Stocks",
      icon: <MdSavings className="size-6 p-1 rounded-xl bg-warning/10 fill-warning" />,
      value: user?.teamstockscount,
    },
  ];

  const betRows = user?.bets?.map((bet) => {
    let payoutValue = "Pending";
    if (bet?.status === "won") payoutValue = `+ ₹${(bet.amount * bet.odds).toFixed(2)}`;
    if (bet?.status === "sold") payoutValue = `+ ₹${(bet.result?.price || 0).toFixed(2)}`;
    if (bet?.status === "lost") payoutValue = `- ₹${bet.amount.toFixed(2)}`;

    return [
      naOr(bet?.match?.title),
      bet?.match?.start ? (
        <span className="flex justify-start items-center gap-2">
          <HiCalendarDateRange className="size-3.5" />
          {new Date(bet.match.start).toDateString()}
        </span>
      ) : (
        "N/A"
      ),
      naOr(bet?.amount),
      naOr(bet?.odds),
      <span className="flex justify-start items-center gap-2">
        <FaBitcoin className="fill-warning" />
        {payoutValue}
      </span>,
    ];
  });

  const tradeRows = user?.stockTransactions?.map((stock) => {
    let payoutValue = "Holding";
    if (stock?.type === "sell") payoutValue = `+ ₹${(stock.price * stock.shares).toFixed(2)}`;

    const priceChange =
      stock?.price !== undefined && stock?.stock?.price !== undefined
        ? (stock.price - stock.stock.price).toFixed(2)
        : null;

    return [
      naOr(stock?.stock?.name),
      naOr(stock?.stock?.pagetype),
      naOr(stock?.price?.toFixed?.(2)),
      naOr(priceChange),
      <span className="flex justify-start items-center gap-2">
        <FaBitcoin className="fill-warning" />
        {payoutValue}
      </span>,
    ];
  });

  return (
    <div className="p-4 bg-base-100 h-[40rem] w-full border border-base-content/10 rounded-xl absolute -bottom-10 inset-x-0 mx-auto overflow-y-auto mb-20">
      <h1 className="text-2xl font-poppins font-bold uppercase">
        Dashboard <span className="text-warning">Overview</span>
      </h1>
      <div className="flex flex-wrap gap-4 mt-4">
        {stats.map((s, index) => (
          <StatCard key={index} icon={s.icon} name={s.name} value={s.value} />
        ))}
      </div>

      <HistoryTable
        title="Your Bet History"
        columns={["Event", "Date", "Bet", "Multiplier", "Payout"]}
        rows={betRows}
      />

      <HistoryTable
        title="Your Trade History"
        columns={["Stock", "Category", "Price", "Price Change", "Payout"]}
        rows={tradeRows}
      />
    </div>
  );
}