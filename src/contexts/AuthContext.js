import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  login as loginApi,
  register as registerApi,
  logoutRequest,
  registerAuthHandlers,
  updatePushToken,
} from "../services/api";
import { registerForPushNotificationsAsync } from "../../pushNotifications";

const AuthContext = createContext(null);

async function setupPushNotifications(token) {
  try {
    const pushToken = await registerForPushNotificationsAsync();
    if (pushToken) {
      await updatePushToken(token, pushToken);
    }
  } catch (err) {
    console.error("Erro ao configurar push notifications:", err);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();

    registerAuthHandlers({
      getRefreshToken: async () => {
        return await AsyncStorage.getItem("@glowly:refreshToken");
      },
      onTokensRefreshed: async (data) => {
        await AsyncStorage.setItem("@glowly:token", data.token);
        await AsyncStorage.setItem("@glowly:refreshToken", data.refreshToken);
        setToken(data.token);
        setRefreshToken(data.refreshToken);
      },
      onRefreshFailed: async () => {
        await AsyncStorage.removeItem("@glowly:token");
        await AsyncStorage.removeItem("@glowly:refreshToken");
        await AsyncStorage.removeItem("@glowly:user");
        setToken(null);
        setRefreshToken(null);
        setUser(null);
      },
    });
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem("@glowly:token");
      const storedRefreshToken = await AsyncStorage.getItem("@glowly:refreshToken");
      const storedUser = await AsyncStorage.getItem("@glowly:user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));

        setupPushNotifications(storedToken); // <- NOVO, quando reabre o app já logado
      }
    } finally {
      setLoading(false);
    }
  }

  async function persist(data) {
    const userData = { name: data.name, role: data.role, address: data.address };
    await AsyncStorage.setItem("@glowly:token", data.token);
    await AsyncStorage.setItem("@glowly:refreshToken", data.refreshToken);
    await AsyncStorage.setItem("@glowly:user", JSON.stringify(userData));
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    setUser(userData);

    setupPushNotifications(data.token); // <- NOVO, logo após login/cadastro
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
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch (error) {
        // mesmo que falhe no backend, limpa localmente
      }
    }
    await AsyncStorage.removeItem("@glowly:token");
    await AsyncStorage.removeItem("@glowly:refreshToken");
    await AsyncStorage.removeItem("@glowly:user");
    setToken(null);
    setRefreshToken(null);
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