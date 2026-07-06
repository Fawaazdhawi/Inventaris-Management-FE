import { useState, useEffect } from "react";
import { Package, ArrowLeftRight, CheckCircle, AlertTriangle, FileDown, Loader2 } from "lucide-react";
import { apiFetch } from "../utils/api";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await apiFetch('/dashboard');
        setData(res);
        setLowStockProducts(res.low_stock_products || []);
      } catch (e) {
        console.error("Failed to load dashboard:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Laporan Ringkasan Dashboard", 14, 15);

    doc.setFontSize(12);
    doc.text(`Total Macam Barang: ${data?.total_barang || 0}`, 14, 25);
    doc.text(`Barang Dipinjam: ${data?.barang_dipinjam || 0}`, 14, 32);
    doc.text(`Total Stok Tersedia: ${data?.barang_tersedia || 0}`, 14, 39);

    if (lowStockProducts.length > 0) {
      doc.setTextColor(255, 0, 0);
      doc.text("Peringatan: Ada barang dengan stok menipis!", 14, 50);
      doc.setTextColor(0, 0, 0);
      const lowStockNames = lowStockProducts.map(p => p.nama_barang).join(', ');
      doc.text(`Barang: ${lowStockNames}`, 14, 57);
    }

    const tableColumn = ["Bulan", "Jumlah Peminjaman"];
    const tableRows = defaultChartData.map(d => [d.month, d.count]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
    });

    doc.save("Laporan_Dashboard.pdf");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  const stats = [
    { name: "Total Macam Barang", value: data?.total_barang || 0, icon: Package, iconBg: "bg-blue-500/10 dark:bg-blue-500/20", iconColor: "text-blue-500" },
    { name: "Barang Dipinjam", value: data?.barang_dipinjam || 0, icon: ArrowLeftRight, iconBg: "bg-yellow-500/10 dark:bg-yellow-500/20", iconColor: "text-yellow-500" },
    { name: "Total Stok Tersedia", value: data?.barang_tersedia || 0, icon: CheckCircle, iconBg: "bg-green-500/10 dark:bg-green-500/20", iconColor: "text-green-500" },
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const defaultChartData = monthNames.map((m, i) => ({ month: m, count: 0 }));

  if (data?.grafik_peminjaman_bulanan) {
    data.grafik_peminjaman_bulanan.forEach(item => {
      const mIndex = parseInt(item.month) - 1;
      if (defaultChartData[mIndex]) {
        defaultChartData[mIndex].count = parseInt(item.total);
      }
    });
  }

  const maxCount = Math.max(...defaultChartData.map(d => d.count), 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time data from database
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FileDown size={18} className="mr-2" />
          Export Laporan
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-start">
          <AlertTriangle className="text-orange-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-400">Peringatan Stok Menipis</h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Barang <strong>{lowStockProducts.map(p => p.nama_barang).join(', ')}</strong> saat ini tersisa kurang dari 10 unit. Harap lakukan pengecekan.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center">
            <div className={`w-14 h-14 ${stat.iconBg} rounded-xl flex items-center justify-center mr-4`}>
              <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Grafik Peminjaman per Bulan (Tahun Ini)</h3>
        <div className="h-64 flex items-end justify-between space-x-2 pt-4">
          {defaultChartData.map((d) => (
            <div key={d.month} className="flex flex-col items-center flex-1 group">
              <div
                className="w-full max-w-[3rem] bg-red-100 dark:bg-red-900/30 rounded-t-lg relative group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors"
                style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '10%' : '2px' }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded">
                  {d.count}
                </div>
                <div className="absolute bottom-0 w-full bg-red-500 dark:bg-red-500 rounded-t-lg transition-all" style={{ height: d.count > 0 ? '4px' : '2px' }} />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">{d.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
