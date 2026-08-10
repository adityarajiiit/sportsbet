import { MdAddCard } from "react-icons/md";
import { GiTrophy } from "react-icons/gi";
import WalletActionRow from "./WalletActionRow";
import AddBalanceModal from "./AddBalanceModal";
import WithdrawModal from "./WithdrawModal";

export default function WalletPanel({
  walletBalance,
  winningAmount,
  amount,
  setAmount,
  handlePayment,
  loading,
  withdraw,
  setWithdraw,
  handleWithdraw,
}) {
  return (
    <div className="p-6 bg-base-100 h-full w-full border border-base-content/10 rounded-xl absolute -bottom-10 inset-x-0 mx-auto mb-20">
      <h1 className="text-2xl font-poppins font-bold uppercase">
        My <span className="text-warning">Wallet</span>
      </h1>
      <p className="text-sm font-inter text-gray-300 w-4/6">
        Add balance and withdraw your existing savings.
      </p>
      <h1 className="text-3xl font-semibold font-inter mt-2">
        {Number.isFinite(walletBalance) ? `₹${walletBalance.toFixed(2)}` : "N/A"}
      </h1>
      <span className="text-sm font-poppins font-light text-neutral-400">Balance</span>

      <div className="flex flex-col gap-4">
        <WalletActionRow
          icon={<MdAddCard className="size-6" />}
          label="Deposit"
          amount={Number.isFinite(walletBalance) ? `₹${walletBalance.toFixed(2)}` : "N/A"}
          buttonLabel="Add Money"
          onButtonClick={() => document.getElementById("Add_balance").showModal()}
        />
        <AddBalanceModal
          amount={amount}
          onAmountChange={setAmount}
          onSubmit={handlePayment}
          loading={loading}
        />

        <WalletActionRow
          icon={<GiTrophy className="size-6" />}
          label="Winnings"
          amount={Number.isFinite(winningAmount) ? `₹${winningAmount.toFixed(2)}` : "N/A"}
          buttonLabel="Withdraw"
          onButtonClick={() => document.getElementById("Withdraw").showModal()}
        />
        <WithdrawModal amount={withdraw} onAmountChange={setWithdraw} onSubmit={handleWithdraw} />
      </div>
    </div>
  );
}