import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@glowly:recent_searches";
const MAX_ITEMS = 5;

export async function getRecentSearches() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addRecentSearch(term) {
  if (!term?.trim()) return;
  const current = await getRecentSearches();
  const updated = [term, ...current.filter((t) => t !== term)].slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}