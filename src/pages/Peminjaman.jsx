import { useState } from "react";
import { Plus, CheckCircle2, History, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Peminjaman() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin" || user?.role === "Staff";
  
  const [activeTab, setActiveTab] = useState("aktif"); // aktif, riwayat
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [peminjaman, setPeminjaman] = useState([
    { id: 1, peminjam: "Budi Santoso", barang: "Proyektor Epson", tglPinjam: "2024-03-10", tglKembali: "-", status: "Dipinjam" },
    { id: 2, peminjam: "Siti Aminah", barang: "Laptop Lenovo ThinkPad", tglPinjam: "2024-03-12", tglKembali: "-", status: "Dipinjam" },
    { id: 3, peminjam: "Andi Wijaya", barang: "Kamera DSLR", tglPinjam: "2024-03-05", tglKembali: "2024-03-08", status: "Dikembalikan" },
    { id: 4, peminjam: "Rina Sari", barang: "Microphone", tglPinjam: "2024-03-01", tglKembali: "2024-03-02", status: "Dikembalikan" },
  ]);

  const [formData, setFormData] = useState({
    peminjam: user?.name || "", barang: "", tglPinjam: new Date().toISOString().split('T')[0]
  });

  const aktifPeminjaman = peminjaman.filter(p => p.status === "Dipinjam");
  const riwayatPeminjaman = peminjaman.filter(p => p.status === "Dikembalikan");

  const displayedData = activeTab === "aktif" ? aktifPeminjaman : riwayatPeminjaman;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = { 
      ...formData, 
      id: Date.now(),
      tglKembali: "-",
      status: "Dipinjam"
    };
    setPeminjaman([newItem, ...peminjaman]);
    setIsModalOpen(false);
    setFormData({ peminjam: user?.name || "", barang: "", tglPinjam: new Date().toISOString().split('T')[0] });
    setActiveTab("aktif");
  };

  const handleReturn = (id) => {
    if (window.confirm("Konfirmasi pengembalian barang ini?")) {
      setPeminjaman(peminjaman.map(p => {
        if (p.id === id) {
          return { ...p, status: "Dikembalikan", tglKembali: new Date().toISOString().split('T')[0] };
        }
        return p;
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Peminjaman Barang</h1>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Ajukan Peminjaman
        </button>
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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.peminjam}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.barang}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.tglPinjam}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.tglKembali}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Dikembalikan' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Ajukan Peminjaman
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form id="peminjaman-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Peminjam</label>
                  <input 
                    type="text" 
                    required
                    value={formData.peminjam}
                    onChange={(e) => setFormData({...formData, peminjam: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Barang</label>
                  <select 
                    required
                    value={formData.barang}
                    onChange={(e) => setFormData({...formData, barang: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="">-- Pilih Barang --</option>
                    <option value="Proyektor Epson">Proyektor Epson</option>
                    <option value="Laptop Lenovo ThinkPad">Laptop Lenovo ThinkPad</option>
                    <option value="Kamera DSLR">Kamera DSLR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Pinjam</label>
                  <input 
                    type="date" 
                    required
                    value={formData.tglPinjam}
                    onChange={(e) => setFormData({...formData, tglPinjam: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
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
                form="peminjaman-form"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
