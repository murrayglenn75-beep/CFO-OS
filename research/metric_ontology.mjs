// Isolated, read-only synthetic metric catalog; no SQL execution.
export const metricCatalog = Object.freeze({
  gross_revenue: Object.freeze({ description: "Sum of settled positive sale amounts before refunds", field: "amount_minor", unit: "minor_currency", status: "settled_sale" }),
  net_revenue: Object.freeze({ description: "Settled sales minus settled refunds", field: "amount_minor", unit: "minor_currency", status: "settled_sale_or_refund" })
});
export function calculateMetric(name, rows) {
  if (!Object.hasOwn(metricCatalog, name)) throw new Error("Unknown metric: choose an approved definition");
  if (!Array.isArray(rows)) throw new TypeError("Rows must be an array");
  let total = 0;
  for (const row of rows) {
    if (!Number.isSafeInteger(row.amount_minor) || !["settled_sale", "settled_refund", "pending_sale"].includes(row.status)) throw new TypeError("Invalid synthetic record");
    if (row.status === "settled_sale") total += row.amount_minor;
    if (name === "net_revenue" && row.status === "settled_refund") total -= row.amount_minor;
  }
  if (!Number.isSafeInteger(total)) throw new RangeError("Unsafe total");
  return { metric: name, amount_minor: total, definition: metricCatalog[name].description, evidence: "synthetic_input_rows", record_count: rows.length };
}
