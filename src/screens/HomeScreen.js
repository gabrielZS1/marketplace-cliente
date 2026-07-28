import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Search } from "lucide-react-native";
import { FlatList } from "react-native";
import { useRef } from "react";

import { getAllBusinesses, getNearbyBusinesses } from "../services/api";

const CATEGORIES = [
  { key: "BARBERSHOP", label: "Barbeiros" },
  { key: "HAIRDRESSER", label: "Cabeleireiro" },
  { key: "WELLNESS", label: "Saúde e\nbem-estar" },
  { key: "SPA", label: "Dia de\nSPA" },
  { key: "SKINCARE", label: "Cuidados\ncom a pele" },
  { key: "MANICURE", label: "Manicure" },
  { key: "EYEBROWS_LASHES", label: "Sobrancelhas\ne cílios" },
  { key: "MAKEUP", label: "Maquiagem" },
  { key: "OTHER", label: "Outros" },
];

const ITEM_WIDTH = 85; // 73 (largura do item) + 12 (margem direita)
const REPEAT_COUNT = 40; // quantas vezes repetimos a lista

const repeatedCategories = Array.from({ length: REPEAT_COUNT }).flatMap((_, i) =>
  CATEGORIES.map((c) => ({ ...c, uid: `${c.key}-${i}` }))
);

const initialCategoryIndex = Math.floor(REPEAT_COUNT / 2) * CATEGORIES.length;

function RecentCard({ business, onPress }) {

  const imageUri = business.logoUrl;

  return (
    <Pressable onPress={onPress} className="w-48 mr-4 overflow-hidden rounded-2xl bg-stone-800">
      {imageUri ? (
        <Image source={{ uri: imageUri }} className="h-28 w-full" resizeMode="cover" />
      ) : (
        <View className="h-28 w-full items-center justify-center bg-stone-600">
          <Text className="text-xs text-white/70">Sem imagem</Text>
        </View>
      )}

      {(business.rating != null || business.reviewCount != null) && (
        <View className="absolute right-2 top-2 rounded-lg bg-black/45 px-2 py-1">
          {business.rating != null && (
            <Text className="text-[10px] font-bold text-white">
              {Number(business.rating).toFixed(1).replace(".", ",")}
            </Text>
          )}
          {business.reviewCount != null && (
            <Text className="text-[7px] text-white">{business.reviewCount} avaliações</Text>
          )}
        </View>
      )}

      <View className="px-3 py-2">
        <Text numberOfLines={1} className="text-xs font-bold text-white">
          {business.name}
        </Text>
        {!!business.description && (
          <Text numberOfLines={1} className="mt-0.5 text-[8px] text-white/75">
            {business.description}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function BusinessImage({ business, className }) {
  const imageUri = business.imageUrl || business.coverImage || business.photoUrl;

  return imageUri ? (
    <Image source={{ uri: imageUri }} className={className} resizeMode="cover" />
  ) : (
    <View className={`${className} items-center justify-center bg-stone-300`}>
      <Text className="text-[10px] text-stone-500">Sem imagem</Text>
    </View>
  );
}

function RatingBadge({ business }) {
  if (business.rating == null && business.reviewCount == null) return null;

  return (
    <View className="absolute right-2 top-2 rounded-lg bg-black/50 px-2 py-1">
      {business.rating != null && (
        <Text className="text-[11px] font-bold text-white">
          {Number(business.rating).toFixed(1).replace(".", ",")}
        </Text>
      )}
      {business.reviewCount != null && (
        <Text className="text-[7px] text-white">{business.reviewCount} avaliações</Text>
      )}
    </View>
  );
}

function OfferCard({ business, onPress }) {
  return (
    <Pressable onPress={onPress} className="mr-4 w-48 overflow-hidden rounded-2xl bg-[#e7e7e7]">
      <View>
        <BusinessImage business={business} className="h-24 w-full" />
        <RatingBadge business={business} />
      </View>
      <View className="px-2 pb-2 pt-1.5">
        <Text numberOfLines={1} className="text-[10px] font-bold text-neutral-950">{business.name}</Text>
        {!!business.description && (
          <Text numberOfLines={2} className="mt-0.5 text-[7px] leading-2 text-neutral-500">{business.description}</Text>
        )}
        {!!business.promotionText && (
          <View className="mt-1.5 self-start rounded-full bg-[#dfbd53] px-2 py-1">
            <Text className="text-[7px] font-bold text-[#755400]">{business.promotionText}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function RecommendedCard({ business, onPress }) {
  return (
    <Pressable onPress={onPress} className="mb-4 w-[48%] overflow-hidden rounded-2xl bg-[#e7e7e7]">
      <View>
        <BusinessImage business={business} className="h-24 w-full" />
        <RatingBadge business={business} />
      </View>
      <View className="px-2 pb-2 pt-1.5">
        <Text numberOfLines={1} className="text-[10px] font-bold text-neutral-950">{business.name}</Text>
        {!!business.description && (
          <Text numberOfLines={2} className="mt-0.5 text-[7px] leading-2 text-neutral-500">{business.description}</Text>
        )}
        {!!business.highlightText && (
          <Text className="mt-1 text-[7px] font-bold text-neutral-900">{business.highlightText}</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const data = status === "granted"
        ? await Location.getCurrentPositionAsync({}).then(({ coords }) =>
          getNearbyBusinesses(coords.latitude, coords.longitude)
        )
        : await getAllBusinesses();
      setBusinesses(data);
    } catch {
      setBusinesses(await getAllBusinesses());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filteredBusinesses = useMemo(
    () => businesses.filter((business) => {
      const matchesCategory = !activeCategory || business.category === activeCategory;
      const matchesSearch = business.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    }),
    [activeCategory, businesses, search]
  );

  // Quando houver histórico real, substitua este array pelos últimos estabelecimentos visitados.
  const recentBusinesses = filteredBusinesses.slice(0, 8);
  const nearbyBusinesses = [...filteredBusinesses]
    .sort((a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 6);
  const availableTodayBusinesses = filteredBusinesses
    .filter((business) => business.availableToday === true)
    .slice(0, 6);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#3a3535]">
        <ActivityIndicator color="#a47300" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#3a3535]"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBusinesses(); }} tintColor="#a47300" />}
    >
      <LinearGradient colors={["#a77905", "#8b6302", "#5b4101"]} className="overflow-hidden pt-8">
        <Text className="mb-4 text-center text-[38px] font-bold text-white">Glowly</Text>

        <Pressable
          onPress={() => navigation.navigate("SearchInput")}
          className="mx-12 flex-row items-center rounded-xl bg-[#e9e9e9] px-3 py-2.5"
        >
          <Search size={27} color="#666" strokeWidth={3} />
          <Text className="ml-2 flex-1 text-sm text-neutral-500">Pesquise serviços ou empresas</Text>
        </Pressable>

        <FlatList
          data={repeatedCategories}
          keyExtractor={(item) => item.uid}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialCategoryIndex}
          getItemLayout={(_, index) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index })}
          className="mt-6"
          contentContainerStyle={{ paddingRight: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("Search", { category: item.key })}
              className="mr-3 w-[73px] items-center"
            >
              <View className="h-16 w-16 rounded-full bg-[#eeeeee]" />
              <Text className="mt-1 text-center text-[11px] font-bold leading-3 text-white">
                {item.label}
              </Text>
            </Pressable>
          )}
        />

        <Text className="mb-2 mt-4 px-5 text-[11px] font-bold text-white">Seus Recentes</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingRight: 8 }}
        >
          {recentBusinesses.length ? recentBusinesses.map((business) => (
            <RecentCard
              key={business.id}
              business={business}
              onPress={() => navigation.navigate("BusinessDetail", { businessId: business.id })}
            />
          )) : (
            <Text className="pb-3 text-xs text-white/80">Você ainda não possui recentes.</Text>
          )}
        </ScrollView>
        <View className="mt-5 border-t border-white/80 px-5 pb-5 pt-4">
          <Text className="text-[11px] font-bold text-white">Ainda não há agendamentos</Text>
          <Pressable
            onPress={() => navigation.navigate("Agendamentos")}
            className="mx-6 mt-3 flex-row items-center justify-center rounded-xl border border-white py-3"
          >
            <Text className="text-[14px] font-bold text-white">Ir para meus agendamentos</Text>
            <ArrowRight className="ml-3" size={27} color="white" strokeWidth={3} />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Seções abaixo do degradê */}
      <View className="bg-[#dcdcdc] pb-6 pt-5">
        <Text className="mb-3 px-5 text-xl font-bold text-neutral-950">Ofertas especiais</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 4 }}
        >
          {filteredBusinesses.filter((business) => business.promotionText).map((business) => (
            <OfferCard
              key={business.id}
              business={business}
              onPress={() => navigation.navigate("BusinessDetail", { businessId: business.id })}
            />
          ))}
          {!filteredBusinesses.some((business) => business.promotionText) && (
            <Text className="text-sm text-neutral-500">Não há ofertas disponíveis.</Text>
          )}
        </ScrollView>
      </View>

      <View className="border-t border-neutral-500 bg-[#dcdcdc] px-3 pt-3">
        <Text className="mb-3 px-2 text-xl font-bold text-neutral-950">Recomendado</Text>
        <View className="flex-row flex-wrap justify-between">
          {filteredBusinesses.map((business) => (
            <RecommendedCard
              key={business.id}
              business={business}
              onPress={() => navigation.navigate("BusinessDetail", { businessId: business.id })}
            />
          ))}
        </View>
      </View>

      <View className="border-t border-neutral-500 bg-[#dcdcdc] px-3 pt-3">
        <Text className="mb-3 px-2 text-xl font-bold text-neutral-950">Perto de você</Text>
        <View className="flex-row flex-wrap justify-between">
          {nearbyBusinesses.map((business) => (
            <RecommendedCard
              key={business.id}
              business={business}
              onPress={() => navigation.navigate("BusinessDetail", { businessId: business.id })}
            />
          ))}
        </View>
      </View>

      <View className="border-t border-neutral-500 bg-[#dcdcdc] px-3 pb-6 pt-3">
        <Text className="mb-3 px-2 text-xl font-bold text-neutral-950">Disponíveis hoje</Text>
        <View className="flex-row flex-wrap justify-between">
          {availableTodayBusinesses.map((business) => (
            <RecommendedCard
              key={business.id}
              business={business}
              onPress={() => navigation.navigate("BusinessDetail", { businessId: business.id })}
            />
          ))}
          {!availableTodayBusinesses.length && (
            <Text className="px-2 text-sm text-neutral-500">Nenhuma empresa disponível hoje.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
