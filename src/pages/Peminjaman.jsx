import { useState, useEffect } from "react";
import { Plus, CheckCircle2, History, X, FileDown, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function Peminjaman() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin" || user?.role === "Manager";
  
  const [activeTab, setActiveTab] = useState("aktif");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [peminjaman, setPeminjaman] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_peminjam: "", product_id: "", tglPinjam: new Date().toISOString().split('T')[0]
  });

  const fetchBorrowings = async () => {
    try {
      const res = await apiFetch('/borrowings');
      setPeminjaman(res.data || res || []);
    } catch (e) {
      console.error("Gagal mengambil data peminjaman:", e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiFetch('/products');
      setProducts(res.data || res || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/users');
      setUsers(res.data || res || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBorrowings();
    fetchProducts();
    fetchUsers();
  }, []);

  const aktifPeminjaman = peminjaman.filter(p => p.status === "dipinjam");
  const riwayatPeminjaman = peminjaman.filter(p => p.status === "dikembalikan");

  const displayedData = activeTab === "aktif" ? aktifPeminjaman : riwayatPeminjaman;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id) return alert("Pilih barang!");
    if (!formData.nama_peminjam.trim()) return alert("Ketik nama peminjam!");
    
    setIsLoading(true);
    try {
      await apiFetch('/borrowings', {
        method: 'POST',
        body: JSON.stringify({
          nama_peminjam: formData.nama_peminjam,
          tanggal_pinjam: formData.tglPinjam,
          product_ids: [parseInt(formData.product_id)]
        })
      });
      setIsModalOpen(false);
      setFormData({ nama_peminjam: "", product_id: "", tglPinjam: new Date().toISOString().split('T')[0] });
      setActiveTab("aktif");
      await fetchBorrowings();
      await fetchProducts();
    } catch (e) {
      alert("Gagal meminjam barang: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm("Konfirmasi pengembalian barang ini?")) {
      try {
        await apiFetch(`/borrowings/${id}/return`, {
          method: 'POST',
          body: JSON.stringify({
            tanggal_kembali: new Date().toISOString().split('T')[0]
          })
        });
        await fetchBorrowings();
      } catch (e) {
        alert("Gagal mengembalikan barang: " + e.message);
      }
    }
  };

  const getProductNames = (details) => {
    if (!details || details.length === 0) return "-";
    return details.map(d => d.product?.nama_barang || "Unknown").join(", ");
  };

  const handleExport = (type) => {
    if (type === 'Excel') {
      const dataToExport = displayedData.map((item, index) => ({
        No: index + 1,
        'Nama Peminjam': item.nama_peminjam || item.user?.name || '-',
        'Barang': getProductNames(item.details),
        'Tgl Pinjam': item.tanggal_pinjam || item.tglPinjam,
        'Tgl Kembali': item.tanggal_kembali || '-',
        'Status': item.status
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Peminjaman");
      XLSX.writeFile(workbook, `Laporan_Peminjaman_${activeTab}.xlsx`);
    } else if (type === 'PDF') {
      const doc = new jsPDF();
      doc.text(`Laporan Data Peminjaman (${activeTab})`, 14, 15);
      
      const tableColumn = ["No", "Nama Peminjam", "Barang", "Tgl Pinjam", "Tgl Kembali", "Status"];
      const tableRows = [];

      displayedData.forEach((item, index) => {
        const rowData = [
          index + 1,
          item.nama_peminjam || item.user?.name || '-',
          getProductNames(item.details),
          item.tanggal_pinjam || item.tglPinjam,
          item.tanggal_kembali || '-',
          item.status
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save(`Laporan_Peminjaman_${activeTab}.pdf`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Peminjaman Barang</h1>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {isAdmin && (
            <>
              <button 
                onClick={() => handleExport('Excel')}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex-1 sm:flex-none justify-center"
              >
                <FileDown size={18} className="mr-2" />
                Export Excel
              </button>
              <button 
                onClick={() => handleExport('PDF')}
                className="flex items-center bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex-1 sm:flex-none justify-center"
              >
                <FileText size={18} className="mr-2" />
                Export PDF
              </button>
            </>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto justify-center mt-2 sm:mt-0"
          >
            <Plus size={18} className="mr-2" />
            Ajukan Peminjaman
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700/50">
          <button
            onClick={() => setActiveTab("aktif")}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${
              activeTab === "aktif" 
                ? "border-red-600 text-red-600 dark:border-red-500 dark:text-red-400" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Sedang Dipinjam
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 flex items-center justify-center ${
              activeTab === "riwayat" 
                ? "border-red-600 text-red-600 dark:border-red-500 dark:text-red-400" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <History size={16} className="mr-2" />
            Riwayat
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 font-medium">Nama Peminjam</th>
                <th className="px-6 py-4 font-medium">Barang</th>
                <th className="px-6 py-4 font-medium">Tgl Pinjam</th>
                <th className="px-6 py-4 font-medium">Tgl Kembali</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {activeTab === "aktif" && isAdmin && (
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {displayedData.length > 0 ? (
                displayedData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {item.nama_peminjam || item.user?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{getProductNames(item.details)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.tanggal_pinjam || item.tglPinjam}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.tanggal_kembali || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        item.status === 'dikembalikan' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    {activeTab === "aktif" && isAdmin && (
                      <td className="px-6 py-4 text-sm text-right">
                        <button 
                          onClick={() => handleReturn(item.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-lg transition-colors font-medium text-xs border border-green-200 dark:border-green-800/50"
                        >
                          <CheckCircle2 size={14} className="mr-1" />
                          Kembalikan
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === "aktif" && isAdmin ? 6 : 5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data {activeTab === "aktif" ? "peminjaman aktif" : "riwayat peminjaman"}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Form Pengajuan Peminjaman</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form id="borrow-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Peminjam</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ketik nama peminjam..."
                    value={formData.nama_peminjam}
                    onChange={(e) => setFormData({...formData, nama_peminjam: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barang yang Dipinjam</label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="">-- Pilih Barang --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stok < 1}>
                        {p.nama_barang} (Sisa Stok: {p.stok})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Pinjam</label>
                  <input 
                    type="date" 
                    required
                    value={formData.tglPinjam}
                    onChange={(e) => setFormData({...formData, tglPinjam: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="borrow-form"
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 rounded-lg font-medium transition-colors shadow-sm"
              >
                {isLoading ? "Memproses..." : "Ajukan Pinjaman"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
