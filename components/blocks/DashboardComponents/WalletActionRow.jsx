export default function WalletActionRow({
  icon,
  label,
  amount,
  buttonLabel,
  onButtonClick,
}) {
  return (
    <div
      className="p-3 rounded-2xl flex flex-col justify-between bg-[rgba(248,248,248,0.01)]
    shadow-[0px_0px_4px_0px_rgba(248,248,248,0.25)_inset,0px_16px_24px_-16px_rgba(0,0,0,0.40)] mt-4 gap-4 w-60"
    >
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center bg-[rgba(248,248,248,0.01)]
    shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]"
      >
        {icon}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-col justify-center items-start p-1">
          <p className="text-accent text-xs font-poppins font-medium">
            {label}
          </p>
          <span className="text-lg -mt-0.5 font-semibold font-inter">
            {amount}
          </span>
          <button
            className="btn btn-active bg-white text-black border-[#e5e5e5] rounded-xl font-inter w-30 mt-2"
            onClick={onButtonClick}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
