import { naOr } from "./naOr";

export default function StatCard({ icon, name, value }) {
  return (
    <div className="p-4 flex flex-col justify-between gap-2 w-40 bg-base-300 rounded-xl">
      {icon}
      <div className="flex flex-col items-end gap-2 font-poppins font-medium text-sm text-warning w-full text-xs">
        {name}
        <p className="text-2xl font-extrabold">{naOr(value)}</p>
      </div>
    </div>
  );
}
