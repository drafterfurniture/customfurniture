import React, { useState, useEffect, useMemo } from "react";

const dummySummary = {
  totalPoOpen: 8,
  totalOutstandingQty: 520,
  poInProcess: 5,
  poCompletedThisMonth: 3
};

const dummyPoRows = [
  {
    poNumber: "PO-001",
    vendorName: "PT Kayu Jaya",
    tanggal: "2025-02-01",
    status: "RELEASED",
    lokasiTerakhir: "GERINDA",
    outstandingQty: 120
  },
  {
    poNumber: "PO-002",
    vendorName: "CV Anyam Indah",
    tanggal: "2025-02-03",
    status: "IN_PROCESS",
    lokasiTerakhir: "POWDER COATING",
    outstandingQty: 80
  },
  {
    poNumber: "PO-003",
    vendorName: "PT Batyline Prima",
    tanggal: "2025-02-05",
    status: "DRAFT",
    lokasiTerakhir: "-",
    outstandingQty: 60
  },
  {
    poNumber: "PO-004",
    vendorName: "PT Kayu Jaya",
    tanggal: "2025-02-07",
    status: "CLOSED",
    lokasiTerakhir: "FINAL LOADING",
    outstandingQty: 0
  },
  {
    poNumber: "PO-005",
    vendorName: "PT Gerinda Maju",
    tanggal: "2025-02-08",
    status: "IN_PROCESS",
    lokasiTerakhir: "BUFFING",
    outstandingQty: 150
  }
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [summary, setSummary] = useState(dummySummary);
  const [poRows, setPoRows] = useState(dummyPoRows);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [lokasiFilter, setLokasiFilter] = useState("ALL");
  const [searchPo, setSearchPo] = useState("");

  // Coba ambil data dari API Cloudflare, kalau gagal pakai dummy
  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data?.summary && data?.poRows) {
          setSummary(data.summary);
          setPoRows(data.poRows);
        }
      })
      .catch(() => {
        // ignore, tetap pakai dummy
      });
  }, []);

  const filteredPo = useMemo(() => {
    return poRows.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (lokasiFilter !== "ALL" && row.lokasiTerakhir !== lokasiFilter)
        return false;
      if (
        searchPo &&
        !row.poNumber.toLowerCase().includes(searchPo.toLowerCase())
      )
        return false;
      return true;
    });
  }, [poRows, statusFilter, lokasiFilter, searchPo]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-100/40 via-teal-100/40 to-white">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex-1 flex flex-col">
        <Topbar title={getPageTitle(page)} />
        <main className="flex-1 p-6 space-y-6">
          {page === "dashboard" && (
            <Dashboard
              summary={summary}
              poRows={filteredPo}
              statusFilter={statusFilter}
              lokasiFilter={lokasiFilter}
              searchPo={searchPo}
              setStatusFilter={setStatusFilter}
              setLokasiFilter={setLokasiFilter}
              setSearchPo={setSearchPo}
            />
          )}

          {page !== "dashboard" && (
            <PlaceholderPage title={getPageTitle(page)} />
          )}
        </main>
      </div>
    </div>
  );
}

function getPageTitle(page) {
  switch (page) {
    case "dashboard":
      return "Dashboard";
    case "items":
      return "Master Item";
    case "vendors":
      return "Vendors";
    case "suppliers":
      return "Suppliers";
    case "destinations":
      return "Destinations";
    case "factory":
      return "Lokasi Factory";
    case "so":
      return "Sales Order";
    case "po":
      return "Purchase Order";
    case "spk":
      return "SPK Produksi";
    case "monitoring":
      return "Monitoring Produksi";
    case "stuffing":
      return "Stuffing";
    case "plInvoice":
      return "Packing List & Invoice";
    default:
      return "ERP";
  }
}

function Sidebar({ page, setPage }) {
  const itemClass = (key) =>
    [
      "w-full px-3 py-2 rounded-full text-sm flex items-center justify-between",
      page === key
        ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-md"
        : "hover:bg-indigo-50 text-gray-700"
    ].join(" ");

  return (
    <aside className="w-64 bg-white/90 backdrop-blur border-r border-white/80 shadow-xl flex flex-col">
      <div className="p-4">
        <div className="font-semibold text-lg">ERP Furniture</div>
        <div className="text-xs text-gray-400">Production &amp; Export Control</div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <SectionTitle label="DASHBOARD" />
        <button className={itemClass("dashboard")} onClick={() => setPage("dashboard")}>
          <span>Dashboard</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-indigo-500">
            Live
          </span>
        </button>

        <SectionTitle label="MASTER DATA" />
        <button className={itemClass("items")} onClick={() => setPage("items")}>
          Items
        </button>
        <button className={itemClass("vendors")} onClick={() => setPage("vendors")}>
          Vendors
        </button>
        <button
          className={itemClass("suppliers")}
          onClick={() => setPage("suppliers")}
        >
          Suppliers
        </button>
        <button
          className={itemClass("destinations")}
          onClick={() => setPage("destinations")}
        >
          Destinations
        </button>
        <button className={itemClass("factory")} onClick={() => setPage("factory")}>
          Lokasi Factory
        </button>

        <SectionTitle label="TRANSAKSI" />
        <button className={itemClass("so")} onClick={() => setPage("so")}>
          Sales Order
        </button>
        <button className={itemClass("po")} onClick={() => setPage("po")}>
          Purchase Order
        </button>
        <button className={itemClass("spk")} onClick={() => setPage("spk")}>
          SPK Produksi
        </button>
        <button
          className={itemClass("monitoring")}
          onClick={() => setPage("monitoring")}
        >
          Monitoring Produksi
        </button>
        <button
          className={itemClass("stuffing")}
          onClick={() => setPage("stuffing")}
        >
          Stuffing
        </button>
        <button
          className={itemClass("plInvoice")}
          onClick={() => setPage("plInvoice")}
        >
          PL &amp; Invoice
        </button>
      </nav>
    </aside>
  );
}

function SectionTitle({ label }) {
  return (
    <div className="text-[10px] font-semibold text-gray-400 px-3 mt-3 mb-1 tracking-wide">
      {label}
    </div>
  );
}

function Topbar({ title }) {
  return (
    <header className="h-16 px-6 flex items-center justify-between bg-white/90 backdrop-blur border-b border-white/80 shadow">
      <div>
        <div className="text-xs text-gray-400">Workspace</div>
        <div className="text-base font-semibold">{title}</div>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <button className="px-3 py-1 rounded-full border border-gray-200 bg-white">
          Switch Company
        </button>
        <button className="px-3 py-1 rounded-full border border-gray-200 bg-white">
          This Month
        </button>
        <div className="text-right">
          <div className="font-medium text-[11px]">Welcome back,</div>
          <div className="text-gray-500 text-[12px]">User</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400" />
      </div>
    </header>
  );
}

function Dashboard({
  summary,
  poRows,
  statusFilter,
  lokasiFilter,
  searchPo,
  setStatusFilter,
  setLokasiFilter,
  setSearchPo
}) {
  return (
    <>
      {/* cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="PO Open"
          value={summary.totalPoOpen}
          subtitle="Purchase Order belum closed"
        />
        <SummaryCard
          title="Outstanding Qty"
          value={summary.totalOutstandingQty}
          subtitle="Qty belum final loading"
        />
        <SummaryCard
          title="PO In Process"
          value={summary.poInProcess}
          subtitle="Sedang di proses produksi"
        />
        <SummaryCard
          title="PO Closed Bulan Ini"
          value={summary.poCompletedThisMonth}
          subtitle="Sudah selesai & stuffing"
        />
      </section>

      {/* filter bar */}
      <section className="bg-white/90 backdrop-blur rounded-2xl shadow flex flex-wrap gap-3 px-3 py-3">
        <select
          className="border text-sm rounded-full px-3 py-1.5"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {["ALL", "DRAFT", "RELEASED", "IN_PROCESS", "CLOSED"].map((opt) => (
            <option key={opt} value={opt}>
              Status: {opt}
            </option>
          ))}
        </select>
        <select
          className="border text-sm rounded-full px-3 py-1.5"
          value={lokasiFilter}
          onChange={(e) => setLokasiFilter(e.target.value)}
        >
          {[
            "ALL",
            "PEMBAHANAN",
            "LAS MIG",
            "LAS TIG",
            "GERINDA",
            "BUFFING",
            "CUCI",
            "POWDER COATING",
            "ANYAM",
            "BATYLINE",
            "ASSEMBLING",
            "PACKING",
            "FINAL LOADING"
          ].map((opt) => (
            <option key={opt} value={opt}>
              Lokasi: {opt}
            </option>
          ))}
        </select>
        <input
          className="border text-sm rounded-full px-3 py-1.5 flex-1 min-w-[160px]"
          placeholder="Cari PO No..."
          value={searchPo}
          onChange={(e) => setSearchPo(e.target.value)}
        />
      </section>

      {/* table + snapshot */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/95 rounded-2xl shadow-lg p-4 lg:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="font-semibold text-sm">Ringkasan Purchase Order</div>
              <div className="text-xs text-gray-400">
                Status PO, lokasi terakhir proses, dan outstanding qty.
              </div>
            </div>
            <div className="space-x-2">
              <button className="text-[11px] px-3 py-1 rounded-full border bg-white">
                Export Excel
              </button>
              <button className="text-[11px] px-3 py-1 rounded-full border bg-white">
                Export PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2">PO No</th>
                  <th className="text-left py-2 px-2">Vendor</th>
                  <th className="text-left py-2 px-2">Tanggal</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Lokasi Terakhir</th>
                  <th className="text-left py-2 px-2">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {poRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-gray-400 py-6 text-xs"
                    >
                      Tidak ada data untuk filter ini.
                    </td>
                  </tr>
                )}
                {poRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-b-0 border-gray-50"
                  >
                    <td className="py-2 px-2">{row.poNumber}</td>
                    <td className="py-2 px-2">{row.vendorName}</td>
                    <td className="py-2 px-2">{row.tanggal}</td>
                    <td className="py-2 px-2">
                      <span
                        className={
                          "inline-flex px-3 py-0.5 rounded-full text-[10px] font-medium " +
                          statusClass(row.status)
                        }
                      >
                        {row.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2 px-2">{row.lokasiTerakhir}</td>
                    <td className="py-2 px-2">{row.outstandingQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/95 rounded-2xl shadow-lg p-4">
          <div className="text-sm font-semibold mb-1">Snapshot Produksi</div>
          <div className="text-xs text-gray-400 mb-3">
            Ringkasan posisi proses hari ini.
          </div>
          <div className="relative pl-4 text-xs">
            <div className="absolute left-1 top-1 bottom-1 w-px bg-gray-200" />
            {[
              ["PEMBAHANAN", "2 PO aktif · 80 pcs"],
              ["LAS MIG / LAS TIG", "3 PO aktif · 140 pcs"],
              ["POWDER COATING", "1 PO aktif · 80 pcs"],
              ["FINAL LOADING", "1 kontainer loading hari ini"]
            ].map(([title, meta]) => (
              <div key={title} className="relative mb-3 pl-3">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-indigo-500 bg-white absolute -left-1 top-1" />
                <div className="font-medium">{title}</div>
                <div className="text-gray-500">{meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="bg-white/90 rounded-2xl shadow p-4 flex flex-col justify-between">
      <div className="text-[11px] uppercase text-gray-400">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-[11px] text-gray-400 mt-1">{subtitle}</div>
    </div>
  );
}

function statusClass(status) {
  switch (status) {
    case "DRAFT":
      return "bg-amber-100 text-amber-700";
    case "RELEASED":
      return "bg-blue-100 text-blue-700";
    case "IN_PROCESS":
      return "bg-sky-100 text-sky-700";
    case "CLOSED":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function PlaceholderPage({ title }) {
  return (
    <div className="bg-white/90 rounded-2xl shadow p-6">
      <div className="text-sm font-semibold mb-1">{title}</div>
      <div className="text-xs text-gray-500">
        Halaman ini masih placeholder. Nanti bisa diisi form / tabel sesuai
        kebutuhan (Sales Order, Item, dll).
      </div>
    </div>
  );
}

export default App;
