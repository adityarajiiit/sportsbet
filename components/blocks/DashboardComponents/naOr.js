
export function naOr(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  return value;
}