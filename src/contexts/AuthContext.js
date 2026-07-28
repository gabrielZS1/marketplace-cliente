import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as loginApi, register as registerApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem("@glowly:token");
      const storedUser = await AsyncStorage.getItem("@glowly:user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  }

  async function persist(data) {
    const userData = { name: data.name, role: data.role, address: data.address };
    await AsyncStorage.setItem("@glowly:token", data.token);
    await AsyncStorage.setItem("@glowly:user", JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
  }

  async function signIn(email, password) {
    const data = await loginApi(email, password);
    await persist(data);
  }

  async function signUp(name, email, phone, password) {
    const data = await registerApi(name, email, phone, password);
    await persist(data);
  }

  function updateLocalAddress(address) {
    setUser((prev) => ({ ...prev, address }));
    AsyncStorage.setItem("@glowly:user", JSON.stringify({ ...user, address }));
  }

  async function signOut() {
    await AsyncStorage.removeItem("@glowly:token");
    await AsyncStorage.removeItem("@glowly:user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut, updateLocalAddress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}