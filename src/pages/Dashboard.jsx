import { Package, ArrowLeftRight, CheckCircle, AlertTriangle, FileDown } from "lucide-react";

export function Dashboard() {
  const stats = [
    { name: "Total Barang", value: "245", icon: Package, color: "bg-blue-500" },
    { name: "Barang Dipinjam", value: "42", icon: ArrowLeftRight, color: "bg-yellow-500" },
    { name: "Barang Tersedia", value: "203", icon: CheckCircle, color: "bg-green-500" },
  ];

  const chartData = [
    { month: "Jan", count: 25 },
    { month: "Feb", count: 40 },
    { month: "Mar", count: 32 },
    { month: "Apr", count: 56 },
    { month: "May", count: 45 },
    { month: "Jun", count: 68 },
    { month: "Jul", count: 74 },
  ];

  const maxCount = Math.max(...chartData.map(d => d.count));

  const handleExport = () => {
    alert("Mengekspor Laporan Dashboard ke format PDF... (Simulasi)");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: Today
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
      <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-start">
        <AlertTriangle className="text-orange-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-400">Peringatan Stok Menipis</h3>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Barang <strong>Proyektor Epson</strong> saat ini tersisa 3 unit. Harap lakukan pengecekan dan restock barang jika diperlukan.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center">
            <div className={`w-14 h-14 ${stat.color} bg-opacity-10 dark:bg-opacity-20 rounded-xl flex items-center justify-center mr-4`}>
              <stat.icon className={`w-7 h-7 text-current ${stat.color.replace('bg-', 'text-')}`} />
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Grafik Peminjaman per Bulan</h3>
        <div className="h-64 flex items-end justify-between space-x-2 pt-4">
          {chartData.map((data) => (
            <div key={data.month} className="flex flex-col items-center flex-1 group">
              <div 
                className="w-full max-w-[3rem] bg-red-100 dark:bg-red-900/30 rounded-t-lg relative group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors"
                style={{ height: `${(data.count / maxCount) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded">
                  {data.count}
                </div>
                <div className="absolute bottom-0 w-full bg-red-500 dark:bg-red-500 rounded-t-lg transition-all" style={{ height: '4px' }} />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
