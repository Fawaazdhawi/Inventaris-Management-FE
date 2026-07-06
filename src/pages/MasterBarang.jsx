import { useState, useRef, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Eye, X, FileDown, FileText, Image as ImageIcon, Upload, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function MasterBarang() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const canManage = user?.role === "Admin" || user?.role === "Staff";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    code: "", name: "", category_id: "", stock: 0, location: "", condition: "Baik", imagePreview: null, imageFile: null
  });

  const fetchProducts = async (page = 1, search = "") => {
    try {
      const response = await apiFetch(`/products?page=${page}&search=${search}`);
      if (response && response.data) {
        setItems(response.data);
        setCurrentPage(response.current_page || 1);
        setTotalPages(response.last_page || 1);
      } else {
        setItems(response || []);
      }
    } catch (e) {
      console.error("Gagal mengambil data barang:", e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/categories'); 
      setCategories(res);
    } catch (e) {
      console.error("Gagal mengambil kategori:", e);
    }
  };

  const handleAddCategory = async () => {
    const newCatName = window.prompt("Masukkan nama kategori baru:");
    if (newCatName && newCatName.trim() !== "") {
      try {
        const res = await apiFetch('/categories', {
          method: 'POST',
          body: JSON.stringify({ name: newCatName.trim() })
        });
        setCategories(prev => [...prev, res]);
        setFormData(prev => ({...prev, category_id: res.id}));
      } catch (e) {
        alert("Gagal menambah kategori: " + e.message);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts(currentPage, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredItems = items;
  const lowStockItems = filteredItems.filter(item => item.stok < 10);

  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    if (item && mode !== 'add') {
      const imageUrl = item.image ? `http://localhost:8000${item.image}` : null;
      setFormData({ 
        code: item.kode_barang || "", 
        name: item.nama_barang || "", 
        category_id: item.category_id || "", 
        stock: item.stok || 0, 
        location: item.lokasi_penyimpanan || "", 
        condition: item.kondisi_barang || "Baik", 
        imagePreview: imageUrl,
        imageFile: null
      });
    } else {
      setFormData({ code: "", name: "", category_id: categories[0]?.id || "", stock: 0, location: "", condition: "Baik", imagePreview: null, imageFile: null });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagePreview: reader.result, imageFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('kode_barang', formData.code);
      submitData.append('nama_barang', formData.name);
      submitData.append('category_id', formData.category_id);
      submitData.append('stok', formData.stock);
      submitData.append('lokasi_penyimpanan', formData.location);
      submitData.append('kondisi_barang', formData.condition);
      
      if (formData.imageFile) {
        submitData.append('image', formData.imageFile);
      }

      if (modalMode === 'add') {
        await apiFetch('/products', {
          method: 'POST',
          body: submitData
        });
      } else if (modalMode === 'edit') {
        submitData.append('_method', 'PUT');
        await apiFetch(`/products/${selectedItem.id}`, {
          method: 'POST',
          body: submitData
        });
      }
      
      await fetchProducts();
      closeModal();
    } catch (e) {
      alert("Gagal menyimpan barang: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah anda yakin ingin menghapus barang ini?")) {
      try {
        await apiFetch(`/products/${id}`, { method: 'DELETE' });
        await fetchProducts();
      } catch (e) {
        alert("Gagal menghapus barang: " + e.message);
      }
    }
  };

  const handleExport = (type) => {
    if (type === 'Excel') {
      const dataToExport = filteredItems.map((item, index) => ({
        No: index + 1,
        'Kode Barang': item.kode_barang,
        'Nama Barang': item.nama_barang,
        'Kategori': item.category?.name || 'Umum',
        'Stok': item.stok,
        'Lokasi': item.lokasi_penyimpanan,
        'Kondisi': item.kondisi_barang
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Barang");
      XLSX.writeFile(workbook, "Laporan_Master_Barang.xlsx");
    } else if (type === 'PDF') {
      const doc = new jsPDF();
      doc.text("Laporan Master Data Barang", 14, 15);
      
      const tableColumn = ["No", "Kode", "Nama Barang", "Kategori", "Stok", "Lokasi", "Kondisi"];
      const tableRows = [];

      filteredItems.forEach((item, index) => {
        const rowData = [
          index + 1,
          item.kode_barang,
          item.nama_barang,
          item.category?.name || 'Umum',
          item.stok,
          item.lokasi_penyimpanan,
          item.kondisi_barang
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save("Laporan_Master_Barang.pdf");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Data Barang</h1>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => handleExport('Excel')}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex-1 lg:flex-none justify-center"
          >
            <FileDown size={18} className="mr-2" />
            Export Excel
          </button>
          <button 
            onClick={() => handleExport('PDF')}
            className="flex items-center bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex-1 lg:flex-none justify-center"
          >
            <FileText size={18} className="mr-2" />
            Export PDF
          </button>
          {canManage && (
            <button 
              onClick={() => openModal('add')}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm w-full lg:w-auto justify-center mt-2 lg:mt-0"
            >
              <Plus size={18} className="mr-2" />
              Tambah Barang
            </button>
          )}
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-lg shadow-sm flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-300">Stok Menipis</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Terdapat {lowStockItems.length} barang di halaman ini yang stoknya di bawah 10. Segera lakukan pengadaan!
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Cari kode atau nama barang..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 font-medium w-16">Foto</th>
                <th className="px-6 py-4 font-medium">Kode</th>
                <th className="px-6 py-4 font-medium">Nama Barang</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Stok</th>
                <th className="px-6 py-4 font-medium">Kondisi</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4">
                      {item.image ? (
                        <img src={`http://localhost:8000${item.image}`} alt={item.nama_barang} className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.kode_barang}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.nama_barang}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">{item.category?.name || 'Umum'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className={`font-semibold ${item.stok < 10 ? 'text-red-500' : ''}`}>{item.stok}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.kondisi_barang === 'Baik' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {item.kondisi_barang}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => openModal('view', item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Detail">
                        <Eye size={18} />
                      </button>
                      {canManage && (
                        <>
                          <button onClick={() => openModal('edit', item)} className="p-1.5 text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={18} />
                          </button>
                          {isAdmin && (
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Hapus">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data barang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sebelumnya
            </button>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalMode === 'add' ? 'Tambah Barang Baru' : modalMode === 'edit' ? 'Edit Data Barang' : 'Detail Barang'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="item-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Image Upload Section */}
                  <div className="w-full sm:w-1/3 flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 w-full text-left">Foto Barang</label>
                    <div 
                      className={`w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors ${
                        modalMode !== 'view' ? 'cursor-pointer border-gray-300 hover:border-red-500 dark:border-gray-600 dark:hover:border-red-500' : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => modalMode !== 'view' && fileInputRef.current?.click()}
                    >
                      {formData.imagePreview ? (
                        <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                          {modalMode !== 'view' && (
                            <span className="mt-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                              Klik untuk upload foto
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageChange} 
                      accept="image/*" 
                      className="hidden"
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  {/* Form Fields */}
                  <div className="w-full sm:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 h-max">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Barang</label>
                      <input 
                        type="text" 
                        required
                        readOnly={modalMode === 'view'}
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none read-only:bg-gray-100 dark:read-only:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Barang</label>
                      <input 
                        type="text" 
                        required
                        readOnly={modalMode === 'view'}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none read-only:bg-gray-100 dark:read-only:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                      <div className="flex gap-2">
                        <select 
                          required
                          disabled={modalMode === 'view'}
                          value={formData.category_id}
                          onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        >
                          <option value="">Pilih Kategori</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        {modalMode !== 'view' && (
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors flex items-center justify-center"
                            title="Tambah Kategori Baru"
                          >
                            <Plus size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stok</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        readOnly={modalMode === 'view'}
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none read-only:bg-gray-100 dark:read-only:bg-gray-800"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi Penyimpanan</label>
                      <input 
                        type="text" 
                        required
                        readOnly={modalMode === 'view'}
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none read-only:bg-gray-100 dark:read-only:bg-gray-800"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kondisi Barang</label>
                      <select 
                        disabled={modalMode === 'view'}
                        value={formData.condition}
                        onChange={(e) => setFormData({...formData, condition: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      >
                        <option value="Baik">Baik</option>
                        <option value="Rusak Ringan">Rusak Ringan</option>
                        <option value="Rusak Berat">Rusak Berat</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3 mt-auto">
              <button 
                type="button" 
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {modalMode === 'view' ? 'Tutup' : 'Batal'}
              </button>
              {modalMode !== 'view' && (
                <button 
                  type="submit" 
                  form="item-form"
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  {isLoading ? 'Menyimpan...' : (modalMode === 'add' ? 'Simpan Data' : 'Simpan Perubahan')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
