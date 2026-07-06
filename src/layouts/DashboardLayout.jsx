import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { echo } from "../utils/echo";
import { cn } from "../utils/cn";
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Bell,
  Users
} from "lucide-react";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && (user.role === 'Admin' || user.role === 'Staff')) {
      const channel = echo.channel('inventory-channel');
      channel.listen('LowStockNotification', (e) => {
        setNotifications(prev => [
          { id: Date.now(), message: `Stok menipis untuk barang: ${e.product.nama_barang} (Sisa: ${e.product.stok})` },
          ...prev
        ]);
        setShowNotifications(true);
      });

      return () => {
        channel.stopListening('LowStockNotification');
      };
    }
  }, [user]);

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["Admin", "Manager", "Staff"] },
    { name: "Master Barang", path: "/barang", icon: Package, roles: ["Admin", "Staff"] },
    { name: "Peminjaman", path: "/peminjaman", icon: ArrowLeftRight, roles: ["Admin", "Staff"] },
    { name: "Pengguna", path: "/users", icon: Users, roles: ["Admin"] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700/50 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700/50">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-md shadow-red-600/20">
            <Package size={18} />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">Inventaris</span>
          <button 
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.filter(item => !user || item.roles.includes(user.role)).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/50 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 flex justify-end items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                title="Notifications"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifikasi</h3>
                    {notifications.length > 0 && (
                      <button onClick={() => setNotifications([])} className="text-xs text-red-600 hover:text-red-700">Clear</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto p-4 text-center">
                    {notifications.length > 0 ? (
                      <ul className="text-left space-y-3">
                        {notifications.map(n => (
                          <li key={n.id} className="text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
                            {n.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada notifikasi baru.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              title="Toggle Dark Mode"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || "User"}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role || "Role"}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-800">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
