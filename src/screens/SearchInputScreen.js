import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { ArrowLeft, Search, MapPin } from "lucide-react-native";
import { getRecentSearches, addRecentSearch } from "../services/recentSearches";

const POPULAR_SERVICES = ["Corte de Cabelo", "Manicure", "Dia de SPA", "Pedicure"];

export default function SearchInputScreen({ navigation }) {
  const [address, setAddress] = useState("");
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getRecentSearches().then(setRecent);
  }, []);

  async function goToResults(term) {
    await addRecentSearch(term);
    navigation.navigate("Search", { query: term });
  }

  return (
    <View className="flex-1 bg-white pt-14 px-6">
      <Pressable onPress={() => navigation.goBack()} className="mb-4">
        <ArrowLeft color="#0a0a0a" size={24} />
      </Pressable>

      <Text className="text-2xl font-bold text-neutral-950 mb-5">
        Oi, o que você está procurando?
      </Text>

      <View className="flex-row items-center rounded-xl bg-[#e9e9e9] px-3 py-3 mb-3">
        <Search size={20} color="#666" strokeWidth={2.5} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Pesquise serviços ou empresas"
          placeholderTextColor="#666"
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => query.trim() && goToResults(query.trim())}
          className="ml-2 flex-1 text-sm text-neutral-800"
        />
      </View>

      <View className="flex-row items-center rounded-xl bg-[#e9e9e9] px-3 py-3 mb-6">
  <MapPin size={18} color="#666" strokeWidth={2.5} />
  <TextInput
    value={address}
    onChangeText={setAddress}
    placeholder="Seu endereço"
    placeholderTextColor="#666"
    className="ml-2 flex-1 text-sm text-neutral-800"
  />
</View>

      {recent.length > 0 && (
        <View className="mb-6">
          <Text className="text-sm font-bold text-neutral-900 mb-3">Pesquisas recentes</Text>
          {recent.map((term) => (
            <Pressable key={term} onPress={() => goToResults(term)} className="flex-row items-center mb-3">
              <Search size={16} color="#525252" />
              <Text className="ml-2 text-sm text-neutral-700">{term}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View>
        <Text className="text-sm font-bold text-neutral-900 mb-3">Serviços populares</Text>
        <View className="flex-row flex-wrap gap-2">
          {POPULAR_SERVICES.map((service) => (
            <Pressable
              key={service}
              onPress={() => goToResults(service)}
              className="rounded-full bg-[#e7e7e7] px-4 py-2"
            >
              <Text className="text-xs font-semibold text-neutral-800">{service}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}