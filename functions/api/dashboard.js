// Cloudflare Pages Function: /api/dashboard
export async function onRequestGet(context) {
  const db = context.env.DB;

  // Fallback jika belum ada DB terhubung: kirim data dummy
  if (!db) {
    return new Response(
      JSON.stringify({
        summary: {
          totalPoOpen: 8,
          totalOutstandingQty: 520,
          poInProcess: 5,
          poCompletedThisMonth: 3
        },
        poRows: [
          {
            poNumber: "PO-001",
            vendorName: "PT Kayu Jaya",
            tanggal: "2025-02-01",
            status: "RELEASED",
            lokasiTerakhir: "GERINDA",
            outstandingQty: 120
          }
        ]
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // --- Query ke D1 (SQLite) ---
  const totalPoOpenRow = await db
    .prepare(
      "SELECT COUNT(*) AS c FROM purchase_orders WHERE status != 'CLOSED'"
    )
    .first();

  const outstandingRow = await db
    .prepare(
      `SELECT IFNULL(SUM(pl.qty),0) AS qty
       FROM po_lines pl
       JOIN purchase_orders po ON po.id = pl.po_id
       WHERE po.status != 'CLOSED'`
    )
    .first();

  const poInProcessRow = await db
    .prepare(
      "SELECT COUNT(*) AS c FROM purchase_orders WHERE status = 'IN_PROCESS'"
    )
    .first();

  const poClosedThisMonthRow = await db
    .prepare(
      `SELECT COUNT(*) AS c
       FROM purchase_orders
       WHERE status = 'CLOSED'
         AND strftime('%Y-%m', tanggal) = strftime('%Y-%m', 'now')`
    )
    .first();

  const poRowsRes = await db
    .prepare(
      `SELECT
         po.po_number AS poNumber,
         v.nama_vendor AS vendorName,
         po.tanggal AS tanggal,
         po.status AS status,
         IFNULL(fl.nama_proses,'-') AS lokasiTerakhir,
         IFNULL(SUM(pl.qty),0) AS outstandingQty
       FROM purchase_orders po
       JOIN vendors v ON v.id = po.vendor_id
       LEFT JOIN factory_locations fl ON fl.id = po.factory_location_id
       LEFT JOIN po_lines pl ON pl.po_id = po.id
       GROUP BY po.id
       ORDER BY po.tanggal DESC
       LIMIT 200`
    )
    .all();

  const body = {
    summary: {
      totalPoOpen: totalPoOpenRow?.c ?? 0,
      totalOutstandingQty: outstandingRow?.qty ?? 0,
      poInProcess: poInProcessRow?.c ?? 0,
      poCompletedThisMonth: poClosedThisMonthRow?.c ?? 0
    },
    poRows: poRowsRes?.results ?? []
  };

  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" }
  });
}
