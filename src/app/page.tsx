'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Package, Layers, DollarSign, Search, RefreshCw } from 'lucide-react';

// 🔴 นำลิงก์ Lambda Function URL ของคุณมาวางตรงนี้
const API_URL = 'https://uuepwfu7zmgoeueuywkop4ehgq0gkhsw.lambda-url.ap-southeast-2.on.aws/ ';

interface CategorySummary {
  section: string;
  total_products: number;
  avg_price: number;
  min_price: number;
  max_price: number;
}

interface Product {
  id: string;
  section: string;
  name: string;
  price: number;
}

export default function ShopeeDashboard() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        setCategories(data.categories || []);
        setProducts(data.products || []);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // คำนวณ KPI รวม
  const totalProducts = categories.reduce((sum, item) => sum + item.total_products, 0);
  const totalCategories = categories.length;
  const overallAvgPrice =
    totalCategories > 0
      ? (categories.reduce((sum, item) => sum + item.avg_price, 0) / totalCategories).toFixed(2)
      : '0.00';

  // Top 10 หมวดหมู่สินค้าเยอะสุด
  const top10Categories = [...categories]
    .sort((a, b) => b.total_products - a.total_products)
    .slice(0, 10);

  // Top 10 หมวดหมู่ราคาเฉลี่ยสูงสุด
  const top10ExpensiveCategories = [...categories]
    .sort((a, b) => b.avg_price - a.avg_price)
    .slice(0, 10);

  // กรองรายการสินค้าในตาราง
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === 'ALL' || item.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              AWS Serverless Data Pipeline (S3 • Athena • Lambda)
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
              Shopee Health & Wellness Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time SQL Analytics Dashboard ดึงข้อมูลสดจาก Amazon Athena
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'กำลังดึงข้อมูลจาก Athena...' : 'รีเฟรชข้อมูล'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <strong>เกิดข้อผิดพลาด:</strong> {error} (ตรวจสอบลิงก์ API_URL และการตั้งค่า CORS บน Lambda)
          </div>
        )}

        {/* Loading State */}
        {loading && categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">กำลังรัน SQL Query บน Amazon Athena...</p>
            <p className="text-xs text-slate-400 mt-1">อาจใช้เวลา 2-4 วินาที</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">จำนวนสินค้าทั้งหมด</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {totalProducts.toLocaleString()} <span className="text-sm font-normal text-slate-400">รายการ</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">หมวดหมู่ทั้งหมด</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {totalCategories} <span className="text-sm font-normal text-slate-400">หมวดหมู่</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">ราคาเฉลี่ยรวมทุกหมวดหมู่</p>
                  <p className="text-3xl font-bold text-slate-800">
                    ฿{Number(overallAvgPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Top 10 Categories by Product Count */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-1">
                  Top 10 หมวดหมู่ที่มีสินค้ามากที่สุด
                </h2>
                <p className="text-xs text-slate-500 mb-6">เปรียบเทียบจำนวนรายการสินค้าในแต่ละหมวดหมู่</p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top10Categories} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="section" type="category" width={140} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`${value} รายการ`, 'จำนวนสินค้า']} />
                      <Bar dataKey="total_products" fill="#f97316" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Top 10 Categories by Average Price */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-1">
                  Top 10 หมวดหมู่ที่ราคาเฉลี่ยสูงสุด (บาท)
                </h2>
                <p className="text-xs text-slate-500 mb-6">เปรียบเทียบราคาขายเฉลี่ยต่อชิ้นในแต่ละหมวดหมู่</p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top10ExpensiveCategories} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="section" type="category" width={140} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`฿${value}`, 'ราคาเฉลี่ย']} />
                      <Bar dataKey="avg_price" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Product Search Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">รายการสินค้าตัวอย่างจาก Athena</h2>
                  <p className="text-xs text-slate-500">ค้นหาชื่อสินค้าหรือกรองตามหมวดหมู่</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อสินค้า..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ALL">ทุกหมวดหมู่ ({totalCategories})</option>
                    {categories.map((cat) => (
                      <option key={cat.section} value={cat.section}>
                        {cat.section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">หมวดหมู่</th>
                      <th className="py-3 px-4">ชื่อสินค้า</th>
                      <th className="py-3 px-4 text-right">ราคา (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">{product.id}</td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                            {product.section}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{product.name}</td>
                        <td className="py-3 px-4 text-right font-semibold text-orange-600">
                          ฿{product.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          ไม่พบรายการสินค้าที่ค้นหา
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}