import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import secureStorage from "../services/secureStorage";
import logger from "../services/logger";
import {
  login as loginApi,
  register as registerApi,
  logoutRequest,
  deleteAccountRequest,
  registerAuthHandlers,
  updatePushToken,
} from "../services/api";
import { registerForPushNotificationsAsync } from "../../pushNotifications";

const AuthContext = createContext(null);

const TOKEN_KEY = "@glowly:token";
const REFRESH_KEY = "@glowly:refreshToken";
const USER_KEY = "@glowly:user";

async function setupPushNotifications(token) {
  try {
    const pushToken = await registerForPushNotificationsAsync();
    if (pushToken) {
      await updatePushToken(token, pushToken);
    }
  } catch (err) {
    logger.error("Erro ao configurar push notifications:", err?.message);
  }
}

/**
 * Move dados de sessão gravados em texto puro no AsyncStorage (versões antigas
 * do app) para o armazenamento seguro, uma única vez.
 */
async function migrateLegacyAuth() {
  try {
    const legacyToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (!legacyToken) return;

    const [legacyRefresh, legacyUser] = await Promise.all([
      AsyncStorage.getItem(REFRESH_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);

    await Promise.all([
      secureStorage.setItem(TOKEN_KEY, legacyToken),
      legacyRefresh && secureStorage.setItem(REFRESH_KEY, legacyRefresh),
      legacyUser && secureStorage.setItem(USER_KEY, legacyUser),
    ]);

    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
  } catch (err) {
    logger.error("Falha ao migrar sessão para armazenamento seguro:", err?.message);
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
        return await secureStorage.getItem(REFRESH_KEY);
      },
      onTokensRefreshed: async (data) => {
        await secureStorage.setItem(TOKEN_KEY, data.token);
        await secureStorage.setItem(REFRESH_KEY, data.refreshToken);
        setToken(data.token);
        setRefreshToken(data.refreshToken);
      },
      onRefreshFailed: async () => {
        await clearStoredAuth();
        setToken(null);
        setRefreshToken(null);
        setUser(null);
      },
    });
  }, []);

  async function clearStoredAuth() {
    await Promise.all([
      secureStorage.removeItem(TOKEN_KEY),
      secureStorage.removeItem(REFRESH_KEY),
      secureStorage.removeItem(USER_KEY),
    ]);
  }

  async function loadStoredAuth() {
    try {
      await migrateLegacyAuth();

      const storedToken = await secureStorage.getItem(TOKEN_KEY);
      const storedRefreshToken = await secureStorage.getItem(REFRESH_KEY);
      const storedUser = await secureStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));

        setupPushNotifications(storedToken);
      }
    } catch (err) {
      logger.error("Erro ao carregar sessão:", err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function persist(data) {
    const userData = { name: data.name, role: data.role, address: data.address };
    await secureStorage.setItem(TOKEN_KEY, data.token);
    await secureStorage.setItem(REFRESH_KEY, data.refreshToken);
    await secureStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    setUser(userData);

    setupPushNotifications(data.token);
  }

  async function signIn(email, password) {
    const data = await loginApi(email, password);
    await persist(data);
  }

  async function signUp(name, email, phone, password, acceptedTerms) {
    const data = await registerApi(name, email, phone, password, acceptedTerms);
    await persist(data);
  }

  function updateLocalUser(patch) {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      secureStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }

  function updateLocalAddress(address) {
    updateLocalUser({ address });
  }

  // Exclui a conta no servidor e limpa a sessão deste aparelho.
  async function deleteAccount(password) {
    await deleteAccountRequest(token, password);
    await clearStoredAuth();
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  }

  async function signOut() {
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch (error) {
        // mesmo que falhe no backend, limpa localmente
      }
    }
    await clearStoredAuth();
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        deleteAccount,
        updateLocalAddress,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
