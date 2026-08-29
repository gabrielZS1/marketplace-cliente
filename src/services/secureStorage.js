/**
 * Armazenamento seguro para dados sensíveis do cliente (tokens de sessão e
 * dados pessoais em cache).
 *
 * Usa `expo-secure-store` (Keychain no iOS / Keystore+EncryptedSharedPreferences
 * no Android) em vez do AsyncStorage, que grava em texto puro.
 *
 * A API imita a do AsyncStorage (`getItem` / `setItem` / `removeItem`) para
 * facilitar a migração. Chaves só aceitam alfanuméricos, ".", "-" e "_", então
 * as chaves "@glowly:token" são normalizadas aqui.
 */
import * as SecureStore from "expo-secure-store";

function normalizeKey(key) {
  return key.replace(/[^A-Za-z0-9._-]/g, "_");
}

export async function getItem(key) {
  try {
    return await SecureStore.getItemAsync(normalizeKey(key));
  } catch {
    return null;
  }
}

export async function setItem(key, value) {
  try {
    if (value == null) {
      await SecureStore.deleteItemAsync(normalizeKey(key));
      return;
    }
    await SecureStore.setItemAsync(normalizeKey(key), String(value));
  } catch {
    // silencioso: sem persistência segura, o usuário só precisa logar de novo
  }
}

export async function removeItem(key) {
  try {
    await SecureStore.deleteItemAsync(normalizeKey(key));
  } catch {
    // ignore
  }
}

export default { getItem, setItem, removeItem };
