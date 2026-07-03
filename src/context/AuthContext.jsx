import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("inventory_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("inventory_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let role = "Staff";
        if (email.includes("admin")) role = "Admin";
        if (email.includes("manager")) role = "Manager";

        // Allow 'password' or the email prefix (e.g., 'admin') as password for easier testing
        const validPassword = password.trim() === "password" || password.trim() === email.split("@")[0];
        
        if (validPassword) {
          const newUser = { id: 1, name: email.split("@")[0], email, role };
          setUser(newUser);
          localStorage.setItem("inventory_user", JSON.stringify(newUser));
          resolve(newUser);
        } else {
          reject(new Error("Invalid credentials. Please use password 'password'"));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("inventory_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
