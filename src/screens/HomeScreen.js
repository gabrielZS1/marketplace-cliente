import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Search,
  ChevronRight,
  Calendar,
} from "lucide-react-native";
import { FlatList, StyleSheet } from "react-native";
import LoadingScreen from "../components/LoadingScreen";
import { colors, brandGradient } from "../theme";

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

const CATEGORY_IMAGES = {
  BARBERSHOP: require("../assets/categories/barbershop.jpg"),
  HAIRDRESSER: require("../assets/categories/hairdresser.jpg"),
  WELLNESS: require("../assets/categories/wellness.jpg"),
  SPA: require("../assets/categories/spa.jpg"),
  SKINCARE: require("../assets/categories/skincare.jpg"),
  MANICURE: require("../assets/categories/manicure.jpg"),
  EYEBROWS_LASHES: require("../assets/categories/eyebrows_lashes.jpg"),
  MAKEUP: require("../assets/categories/makeup.jpg"),
  OTHER: require("../assets/categories/other.jpg"),
};


function RecentCard({ business, onPress }) {
  const imageUri = business.logoUrl;

  return (
    <View className="w-80 mr-4 ml-1 mb-2 overflow-hidden rounded-2xl bg-stone-800">
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          className="h-40 w-full"
          resizeMode="cover"
        />
      ) : (
        <View className="h-40 w-full items-center justify-center bg-stone-300">
          <Text className="text-xs text-white/50">Sem imagem</Text>
        </View>
      )}

      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between px-3 py-3"
      >
        <Text numberOfLines={1} className="text-sm font-bold text-white">
          {business.name}
        </Text>
        <ChevronRight size={18} color="white" />
      </Pressable>
    </View>
  );
}

function BusinessImage({ business, className }) {
  const imageUri =
    business.logoUrl ||
    business.imageUrl ||
    business.coverImage ||
    business.photoUrl;

  return imageUri ? (
    <Image
      source={{ uri: imageUri }}
      className={className}
      resizeMode="cover"
    />
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
        <Text className="text-[9px] text-white">
          {business.reviewCount} avaliações
        </Text>
      )}
    </View>
  );
}

function OfferCard({ business, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-4 w-[268px] overflow-hidden rounded-2xl bg-[#e7e7e7]"
    >
      <View>
        <BusinessImage business={business} className="h-24 w-full" />
        <RatingBadge business={business} />
      </View>
      <View className="px-2 pb-2 pt-1.5">
        <Text
          numberOfLines={1}
          className="text-[10px] font-bold text-neutral-950"
        >
          {business.name}
        </Text>
        {!!business.description && (
          <Text
            numberOfLines={2}
            className="mt-0.5 text-[11px] text-neutral-500"
          >
            {business.description}
          </Text>
        )}
        {!!business.promotionText && (
          <View className="mt-1.5 self-start rounded-full bg-brand px-2 py-1">
            <Text className="text-[9px] font-bold text-on-brand">
              {business.promotionText}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function RecommendedCard({ business, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-4 w-[240px] overflow-hidden rounded-2xl bg-[#e7e7e7]"
    >
      <View>
        <BusinessImage business={business} className="h-36 w-full" />
        <RatingBadge business={business} />
      </View>
      <View className="px-2 pb-2 pt-1.5">
        <Text
          numberOfLines={1}
          className="text-[14px] font-bold text-neutral-950"
        >
          {business.name}
        </Text>
        {!!business.description && (
          <Text
            numberOfLines={2}
            className="mt-0.5 text-[10px] leading-2 text-neutral-500"
          >
            {business.description}
          </Text>
        )}
        {!!business.highlightText && (
          <Text className="mt-1 text-[10px] font-bold text-neutral-900">
            {business.highlightText}
          </Text>
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
      const data =
        status === "granted"
          ? await Location.getCurrentPositionAsync({}).then(({ coords }) =>
              getNearbyBusinesses(coords.latitude, coords.longitude),
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
    () =>
      businesses.filter((business) => {
        const matchesCategory =
          !activeCategory || business.category === activeCategory;
        const matchesSearch = business.name
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [activeCategory, businesses, search],
  );

  if (loading) {
    return <LoadingScreen />;
  }

  const recentBusinesses = filteredBusinesses.slice(0, 8);
  const nearbyBusinesses = [...filteredBusinesses]
    .sort(
      (a, b) =>
        (a.distanceKm ?? Number.MAX_SAFE_INTEGER) -
        (b.distanceKm ?? Number.MAX_SAFE_INTEGER),
    )
    .slice(0, 6);
  const availableTodayBusinesses = filteredBusinesses
    .filter((business) => business.availableToday === true)
    .slice(0, 6);

  // ─── Helpers de navegação ────────────────────────────────────────────────────

  // Navega para o detalhe de um estabelecimento dentro do ExploreNavigator
  function goToBusinessDetail(businessId) {
    navigation.navigate("Explorar", {
      screen: "BusinessDetail",
      params: { businessId },
    });
  }

  // Navega para a tela de busca com uma categoria pré-selecionada
  function goToSearchWithCategory(categoryKey) {
    navigation.navigate("Explorar", {
      screen: "SearchServices",
      params: { category: categoryKey },
    });
  }

  // Navega para a busca sem filtro
  function goToSearch() {
    navigation.navigate("Explorar", {
      screen: "SearchInput",
    });
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      className="flex-1 bg-[#3a3535]"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadBusinesses();
          }}
          tintColor={colors.brandDark}
        />
      }
    >
      <LinearGradient
        colors={brandGradient}
        className="overflow-hidden pt-12"
      >
        <Text
          className="mb-4 text-center text-[36px] text-white"
          style={{ fontFamily: "Poppins_700Bold" }}
        >
          Glowly
        </Text>

        <Pressable
          onPress={goToSearch}
          className="mx-4 flex-row items-center rounded-full bg-[#e9e9e9] px-4 py-3"
        >
          <Search size={27} color="#666" strokeWidth={3} />
          <Text className="ml-2 flex-1 text-sm text-neutral-500">
            Pesquise serviços ou empresas
          </Text>
        </Pressable>

        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-6"
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => goToSearchWithCategory(item.key)}
              className="mr-3 w-[73px] items-center"
            >
              <View
                className="h-20 w-20 rounded-full items-center justify-center bg-[#eeeeee]"
                style={{
                  borderWidth: 1.5,
                  borderColor: colors.brand,
                  padding: 2,
                }}
              >
                <View className="h-full w-full rounded-full overflow-hidden items-center justify-center bg-white">
                  <Image
                    source={CATEGORY_IMAGES[item.key]}
                    style={{
                      width: 80,
                      height: 110,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <Text className="mt-1 text-center text-[11px] font-bold leading-3 text-white">
                {item.label}
              </Text>
            </Pressable>
          )}
        />

        <View className="mt-5 border-t border-brand/40 px-5 pt-4"></View>

        <View className="flex-row items-center justify-between px-5 pb-3">
          <Text className="text-[11px] font-bold text-white">
            Seus Recentes
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Agendamentos")}
            className="flex-row items-center"
          >
            <Text className="text-[10px] font-bold text-white/80 mr-1">
              Ver todos
            </Text>
            <ArrowRight
              size={12}
              color="rgba(255,255,255,0.8)"
              strokeWidth={3}
            />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, paddingRight: 4 }}
        >
          {recentBusinesses.length ? (
            recentBusinesses.map((business) => (
              <RecentCard
                key={business.id}
                business={business}
                onPress={() => goToBusinessDetail(business.id)}
              />
            ))
          ) : (
            <Text className="pb-3 text-xs text-white/80">
              Você ainda não possui recentes.
            </Text>
          )}
        </ScrollView>

        <View className="mx-5 mt-5 mb-5 flex-row items-center justify-between rounded-2xl bg-black/20 px-4 py-4">
          <View className="flex-row items-center flex-1">
            <Calendar size={20} color="white" />
            <Text className="ml-3 text-[13px] font-bold text-white flex-1">
              Ver seus agendamentos
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Agendamentos")}
            className="h-9 w-9 rounded-full bg-white items-center justify-center"
          >
            <ArrowRight size={18} color={colors.brandDeep} strokeWidth={3} />
          </Pressable>
        </View>
      </LinearGradient>

      <View className="bg-[#dcdcdc] pb-6 pt-5">
        <Text className="mb-3 px-5 text-xl font-bold text-neutral-950">
          Ofertas especiais
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 4 }}
        >
          {filteredBusinesses
            .filter((business) => business.promotionText)
            .map((business) => (
              <OfferCard
                key={business.id}
                business={business}
                onPress={() => goToBusinessDetail(business.id)}
              />
            ))}
          {!filteredBusinesses.some((business) => business.promotionText) && (
            <Text className="text-sm text-neutral-500">
              Não há ofertas disponíveis.
            </Text>
          )}
        </ScrollView>
      </View>

      <View
        className="bg-[#dcdcdc] pt-5"
        style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.10)" }}
      >
        <Text className="mb-3 px-5 text-xl font-bold text-neutral-950">
          Recomendado
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 4 }}
        >
          {filteredBusinesses.map((business) => (
            <RecommendedCard
              key={business.id}
              business={business}
              onPress={() => goToBusinessDetail(business.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View
        className="bg-[#dcdcdc] pt-5"
        style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.10)" }}
      >
        <Text className="mb-3 px-5 text-xl font-bold text-neutral-950">
          Perto de você
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 4 }}
        >
          {nearbyBusinesses.map((business) => (
            <RecommendedCard
              key={business.id}
              business={business}
              onPress={() => goToBusinessDetail(business.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View
        className="bg-[#dcdcdc] pt-5"
        style={{ paddingBottom: 140, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.10)" }}
      >
        <Text className="mb-3 px-5 text-xl font-bold text-neutral-950">
          Disponíveis hoje
        </Text>
        {availableTodayBusinesses.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 4 }}
          >
            {availableTodayBusinesses.map((business) => (
              <RecommendedCard
                key={business.id}
                business={business}
                onPress={() => goToBusinessDetail(business.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text className="px-5 text-sm text-neutral-500">
            Nenhuma empresa disponível hoje.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
