
export default function TradeDialogShell({ id, open, player, theme = "info", children }) {
  return (
    <dialog id={id} className="modal" open={open}>
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <p className="pb-2 text-xs font-poppins">Press ESC key or click on ✕ button to close</p>
        <h3 className="text-lg font-semibold font-poppins">{player.name}</h3>
        <div className={`badge badge-soft badge-${theme} rounded-sm text-sm px-4`}>
          {player.sport}
        </div>
        {children}
      </div>
    </dialog>
  );
}