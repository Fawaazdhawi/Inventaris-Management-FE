import { Outlet } from "react-router-dom";
import { Package } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200 p-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-red-600/20">
            <Package size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Telkomsel Inventaris</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Manajemen Aset & Inventaris Kantor</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
