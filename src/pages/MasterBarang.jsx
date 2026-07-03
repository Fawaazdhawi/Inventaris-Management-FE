import { useState, useRef } from "react";
import { Plus, Search, Edit2, Trash2, Eye, X, FileDown, FileText, Image as ImageIcon, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function MasterBarang() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const canManage = user?.role === "Admin" || user?.role === "Staff";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit, view
  const [selectedItem, setSelectedItem] = useState(null);
  const fileInputRef = useRef(null);

  // Dummy Data
  const [items, setItems] = useState([
    { id: 1, code: "BRG-001", name: "Laptop Lenovo ThinkPad", category: "Elektronik", stock: 15, location: "Ruang IT", condition: "Baik", image: null },
    { id: 2, code: "BRG-002", name: "Proyektor Epson", category: "Elektronik", stock: 3, location: "Ruang Meeting 1", condition: "Baik", image: null },
    { id: 3, code: "BRG-003", name: "Meja Kerja", category: "Furniture", stock: 40, location: "Lantai 2", condition: "Baik", image: null },
    { id: 4, code: "BRG-004", name: "Kursi Kantor", category: "Furniture", stock: 45, location: "Lantai 2", condition: "Rusak Ringan", image: null },
    { id: 5, code: "BRG-005", name: "Printer HP LaserJet", category: "Elektronik", stock: 5, location: "Ruang Admin", condition: "Baik", image: null },
  ]);

  const [formData, setFormData] = useState({
    code: "", name: "", category: "", stock: 0, location: "", condition: "Baik", imagePreview: null
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    if (item && mode !== 'add') {
      setFormData({ ...item, imagePreview: item.image });
    } else {
      setFormData({ code: "", name: "", category: "", stock: 0, location: "", condition: "Baik", imagePreview: null });
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
        setFormData({ ...formData, imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData, image: formData.imagePreview };
    delete submitData.imagePreview;

    if (modalMode === 'add') {
      const newItem = { ...submitData, id: Date.now() };
      setItems([...items, newItem]);
    } else if (modalMode === 'edit') {
      setItems(items.map(item => item.id === selectedItem.id ? { ...submitData, id: selectedItem.id } : item));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah anda yakin ingin menghapus barang ini?")) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleExport = (type) => {
    alert(`Mengekspor data ke format ${type}... (Simulasi)`);
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
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className={`font-semibold ${item.stock < 10 ? 'text-red-500' : ''}`}>{item.stock}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.condition === 'Baik' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {item.condition}
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
                      <input 
                        type="text" 
                        required
                        readOnly={modalMode === 'view'}
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none read-only:bg-gray-100 dark:read-only:bg-gray-800"
                      />
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  {modalMode === 'add' ? 'Simpan Data' : 'Simpan Perubahan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
