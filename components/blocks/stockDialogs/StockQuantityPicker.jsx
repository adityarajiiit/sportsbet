
export default function StockQuantityPicker({ value, onChange, max, price, theme = "info" }) {
  const safeMax = max || 0;
  const clampedValue = value > safeMax ? safeMax : value;

  const handleNumberChange = (e) => {
    onChange(Math.min(parseInt(e.target.value) || 0, safeMax));
  };

  return (
    <div>
      <input
        type="range"
        min={0}
        max={safeMax}
        className={`range range-${theme} w-full`}
        value={clampedValue}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex justify-between mt-2">
        <p className="ml-2 text-base font-medium font-inter">
          Number of stocks <br />
          <span className="text-xl">{value}</span>
        </p>
        <p className="ml-2 text-base font-medium font-inter">
          Total amount <br />
          <span className="text-xl">&#8377;{(value * price).toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}