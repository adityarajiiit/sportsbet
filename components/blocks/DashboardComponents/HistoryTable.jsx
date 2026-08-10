import { BiSolidNetworkChart } from "react-icons/bi";
import { naOr } from "./naOr";
import NoDataState from "@/components/ui/NoDataState";

export default function HistoryTable({ title, columns, rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="mt-4">
        <p className="p-3 font-poppins font-medium text-base flex items-center gap-2 bg-base-200 rounded-t-md border border-base-content/10 border-b-0">
          <BiSolidNetworkChart className="size-5" />
          {title}
        </p>
        <NoDataState
          title="No history yet"
          description={`There are no entries in ${title.toLowerCase()} right now.`}
          className="rounded-t-none"
          compact
        />
      </div>
    );
  }

  return (
    <div className="mt-4 bg-base-200 rounded-md border border-base-content/10">
      <p className="p-3 font-poppins font-medium text-base flex items-center gap-2">
        <BiSolidNetworkChart className="size-5" />
        {title}
      </p>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th className="font-poppins font-semibold">S.No</th>
              {columns.map((col) => (
                <th key={col} className="font-poppins font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows?.map((row, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell === null || cell === undefined || cell === "" ? "N/A" : cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}