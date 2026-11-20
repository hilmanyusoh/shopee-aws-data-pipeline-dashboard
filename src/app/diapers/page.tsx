"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface DiapersKpis {
  total_skus?: number;
  unique_shops?: number;
  unique_brands?: number;
  total_recent_sold?: number;
  total_history_sold?: number;
  mall_skus?: number;
  nonmall_skus?: number;
  mall_history_sold?: number;
  nonmall_history_sold?: number;
  avg_price?: number;
  avg_discount?: number;
  avg_rating?: number;
}

interface PriceTierRow {
  price_tier: string;
  sku_count?: number;
  recent_sold?: number;
  history_sold?: number;
  avg_price?: number;
  avg_discount?: number;
}

interface MallRow {
  channel: string;
  is_mall?: boolean;
  sku_count?: number;
  shop_count?: number;
  avg_price?: number;
  median_price?: number;
  avg_discount?: number;
  recent_sold?: number;
  history_sold?: number;
  avg_rating?: number;
}

interface BrandRow {
  brand_en: string;
  sku_count?: number;
  mall_skus?: number;
  nonmall_skus?: number;
  recent_sold?: number;
  history_sold?: number;
  avg_price?: number;
  avg_discount?: number;
  avg_rating?: number;
}

interface DiaperItem {
  itemId: string | number;
  name?: string;
  brand_en?: string;
  shop_name?: string;
  is_mall?: boolean;
  price_tier?: string;
  price?: number;
  price_before_discount?: number;
  discountPercent?: number;
  sold?: number;
  historySold?: number;
  rating?: number;
  url?: string;
}

interface DiapersPayload {
  dataset?: string;
  kpis?: DiapersKpis;
  price_tiers?: PriceTierRow[];
  mall_comparison?: MallRow[];
  top_brands?: BrandRow[];
  items?: DiaperItem[];
}

const RAW_LAMBDA_URL =
  process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL ||
  "https://uuepwfu7zmgoeueuywkop4ehgq0gkhsw.lambda-url.ap-southeast-2.on.aws";

const LAMBDA_URL = RAW_LAMBDA_URL.trim().replace(/\/+$/, "");

function normalizePayload(raw: unknown): DiapersPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object") {
    return obj.data as DiapersPayload;
  }
  if (typeof obj.body === "string") {
    try {
      const parsed = JSON.parse(obj.body) as Record<string, unknown>;
      return (parsed.data && typeof parsed.data === "object"
        ? parsed.data
        : parsed) as DiapersPayload;
    } catch {
      return null;
    }
  }
  return obj as DiapersPayload;
}

export default function DiapersAnalyticsPage() {
  const [data, setData] = useState<DiapersPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [channelFilter, setChannelFilter] = useState<"ALL" | "MALL" | "NON_MALL">("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function loadDiapersData() {
      setLoading(true);
      setError(null);
      try {
        const separator = LAMBDA_URL.includes("?") ? "&" : "?";
        const res = await fetch(`${LAMBDA_URL}${separator}dataset=diapers`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const rawJson: unknown = await res.json();
        const normalized = normalizePayload(rawJson);
        if (!normalized) {
          throw new Error("Invalid response format from Lambda");
        }
        if (active) {
          setData(normalized);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load Diapers data");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadDiapersData();
    return () => {
      active = false;
    };
  }, []);

  const itemsList = useMemo(() => data?.items ?? [], [data?.items]);

  const filteredItems = useMemo(() => {
    return itemsList.filter((item) => {
      if (channelFilter === "MALL" && !item.is_mall) return false;
      if (channelFilter === "NON_MALL" && item.is_mall) return false;
      if (tierFilter !== "ALL" && (item.price_tier ?? "") !== tierFilter) return false;
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase();
        const matchName = (item.name ?? "").toLowerCase().includes(q);
        const matchBrand = (item.brand_en ?? "").toLowerCase().includes(q);
        const matchShop = (item.shop_name ?? "").toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchShop) return false;
      }
      return true;
    });
  }, [itemsList, channelFilter, tierFilter, searchTerm]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-orange-400 animate-pulse text-lg">
            Loading Shopee Thailand Diapers Analytics from AWS Athena...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="max-w-7xl mx-auto bg-red-950/40 border border-red-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">Unable to load Diapers Dashboard</h2>
          <p className="text-sm text-red-200">{error || "No data returned"}</p>
        </div>
      </main>
    );
  }

  const totalSkus = Number(data.kpis?.total_skus ?? 0);
  const uniqueShops = Number(data.kpis?.unique_shops ?? 0);
  const uniqueBrands = Number(data.kpis?.unique_brands ?? 0);
  const totalRecentSold = Number(data.kpis?.total_recent_sold ?? 0);
  const totalHistorySold = Number(data.kpis?.total_history_sold ?? 0);
  const mallSkus = Number(data.kpis?.mall_skus ?? 0);
  const nonmallSkus = Number(data.kpis?.nonmall_skus ?? 0);
  const mallHistorySold = Number(data.kpis?.mall_history_sold ?? 0);
  const avgPrice = Number(data.kpis?.avg_price ?? 0);
  const avgDiscount = Number(data.kpis?.avg_discount ?? 0);
  const avgRating = Number(data.kpis?.avg_rating ?? 0);

  const priceTiers = data.price_tiers ?? [];
  const mallComparison = data.mall_comparison ?? [];
  const topBrands = data.top_brands ?? [];

  const mallSharePct =
    totalHistorySold > 0
      ? ((mallHistorySold / totalHistorySold) * 100).toFixed(1)
      : "0.0";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 mb-2">
              Shopee Thailand • Tape &amp; Pants Diapers Only
            </span>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              Diapers Market Analytics Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live data from <code className="text-orange-300">shopee_db.diapers_curated</code> via AWS Lambda &amp; Amazon Athena
            </p>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-400 uppercase">Total Diaper SKUs</p>
            <p className="text-3xl font-bold text-white mt-1">
              {totalSkus.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {uniqueShops.toLocaleString()} Shops • {uniqueBrands.toLocaleString()} Brands
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-400 uppercase">Historical Sold (Units)</p>
            <p className="text-3xl font-bold text-orange-400 mt-1">
              {totalHistorySold.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Recent Sold: {totalRecentSold.toLocaleString()} units
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-400 uppercase">Mall Share (History Sold)</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{mallSharePct}%</p>
            <p className="text-xs text-slate-400 mt-2">
              Mall: {mallSkus.toLocaleString()} SKUs vs Non-Mall: {nonmallSkus.toLocaleString()} SKUs
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-400 uppercase">Avg Price &amp; Discount</p>
            <p className="text-3xl font-bold text-sky-400 mt-1">
              ฿{avgPrice.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Avg Discount: {avgDiscount}% • Avg Rating: {avgRating}★
            </p>
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Tier Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">
              Sales by Price Tier (History vs. Recent)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Premium (&gt;800) leads cumulative volume; Budget (&lt;=200) drives recent sales
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceTiers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="price_tier" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#f8fafc",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="history_sold" name="History Sold" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recent_sold" name="Recent Sold" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mall vs Non-Mall Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">
              Official Mall vs. Non-Mall Comparison
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Comparing average price (THB) and average discount (%) across channels
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mallComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="channel" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#f8fafc",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avg_price" name="Avg Price (฿)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_discount" name="Avg Discount (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Top Brands Table */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Top Diaper Brands by Historical Sold
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-3">Brand</th>
                  <th className="py-3 px-3 text-right">SKUs (Mall/Non)</th>
                  <th className="py-3 px-3 text-right">History Sold</th>
                  <th className="py-3 px-3 text-right">Recent Sold</th>
                  <th className="py-3 px-3 text-right">Avg Price</th>
                  <th className="py-3 px-3 text-right">Avg Discount</th>
                  <th className="py-3 px-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topBrands.map((b) => (
                  <tr key={b.brand_en} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-medium text-white">{b.brand_en}</td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {Number(b.sku_count ?? 0).toLocaleString()} ({Number(b.mall_skus ?? 0)}/
                      {Number(b.nonmall_skus ?? 0)})
                    </td>
                    <td className="py-3 px-3 text-right text-orange-400 font-semibold">
                      {Number(b.history_sold ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-sky-300">
                      {Number(b.recent_sold ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      ฿{Number(b.avg_price ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-300">
                      {Number(b.avg_discount ?? 0)}%
                    </td>
                    <td className="py-3 px-3 text-right">{Number(b.avg_rating ?? 0)}★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Filterable Diaper Listings Table */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">
              Diaper Product Listings ({filteredItems.length.toLocaleString()} shown)
            </h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as "ALL" | "MALL" | "NON_MALL")}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="ALL">All Channels</option>
                <option value="MALL">Official Mall Only</option>
                <option value="NON_MALL">Non-Mall Only</option>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="ALL">All Price Tiers</option>
                <option value="Budget (<=200)">Budget (&lt;=200)</option>
                <option value="Mid-Range (201-800)">Mid-Range (201-800)</option>
                <option value="Premium (>800)">Premium (&gt;800)</option>
              </select>

              <input
                type="text"
                placeholder="Search product, brand, shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Brand</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-right">Disc.</th>
                  <th className="py-3 px-3 text-right">History Sold</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.itemId} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                    <td className="py-3 px-3 max-w-md">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white hover:text-orange-400 line-clamp-2"
                        >
                          {item.name ?? "-"}
                        </a>
                      ) : (
                        <span className="text-white line-clamp-2">{item.name ?? "-"}</span>
                      )}
                      <span className="block text-xs text-slate-400">{item.shop_name ?? "-"}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-200">{item.brand_en ?? "-"}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.is_mall
                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            : "bg-slate-700/60 text-slate-300"
                        }`}
                      >
                        {item.is_mall ? "Mall" : "Non-Mall"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-300">{item.price_tier ?? "-"}</td>
                    <td className="py-3 px-3 text-right font-medium">
                      ฿{Number(item.price ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-300">
                      {Number(item.discountPercent ?? 0)}%
                    </td>
                    <td className="py-3 px-3 text-right text-orange-400 font-semibold">
                      {Number(item.historySold ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}