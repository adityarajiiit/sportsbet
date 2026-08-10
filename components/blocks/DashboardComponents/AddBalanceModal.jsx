
export default function AddBalanceModal({ amount, onAmountChange, onSubmit, loading }) {
  return (
    <dialog id="Add_balance" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <p className="pb-2 text-xs font-poppins">Press ESC key or click on ✕ button to close</p>
        <div className="mt-2 bg-base-300 rounded-lg p-2">
          <div className="bg-base-100 border-base-300 p-6 rounded-lg">
            <p className="text-base font-poppins font-semibold">Enter Amount</p>
            <p className="text-xs font-poppins">minimum amount : ₹1</p>
            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 w-full">
              <input
                type="number"
                min={1}
                step={1}
                max="1000"
                className="input input-info w-full"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-info font-poppins text-base mt-1" disabled={loading}>
                {loading ? "Processing..." : "Add Amount"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  );
}