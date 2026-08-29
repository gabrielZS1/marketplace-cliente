import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Star, Search, Info } from "lucide-react-native";
import { getBusinessById, getBusinessServices } from "../services/api";
import { showAlert } from "../services/alert";
import { colors } from "../theme";

import LoadingScreen from "../components/LoadingScreen";
import logger from "../services/logger";

const TABS = [
  "SERVIÇOS",
  "AVALIAÇÕES",
  "PORTFÓLIO",
  "CARTÃO DE PRESENTE",
  "PACOTES",
  "DETALHES",
];

function formatPrice(price) {
  return `R$ ${Number(price).toFixed(2).replace(".", ",")}`;
}

function ServiceRow({ service, onBook }) {
  return (
    <View className="flex-row justify-between items-start py-3 border-b border-neutral-100">
      <View className="flex-1 pr-3">
        <Text className="text-sm font-bold text-neutral-950">
          {service.name}
        </Text>
        <Text className="text-xs text-neutral-500 mt-0.5">
          {service.description || "Serviços populares"}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-sm font-bold text-neutral-950">
          {formatPrice(service.price)}
        </Text>
        <Text className="text-xs text-neutral-500 mb-2">
          {service.durationMinutes}m
        </Text>
        <Pressable
          onPress={() => onBook(service)}
          className="bg-brand rounded-lg px-4 py-2"
        >
          <Text className="text-on-brand text-xs font-bold">Reservar</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function BusinessDetailScreen({ navigation, route }) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("SERVIÇOS");
  const [search, setSearch] = useState("");
  const [servicesFilter, setServicesFilter] = useState("popular");

  useEffect(() => {
    loadData();
  }, [businessId]);

  

  async function loadData() {
    try {
      const [businessData, servicesData] = await Promise.all([
        getBusinessById(businessId),
        getBusinessServices(businessId),
      ]);
      setBusiness(businessData);
      setServices(servicesData);
    } catch (error) {
      logger.error("Erro ao carregar estabelecimento:", error?.message);
    } finally {
      setLoading(false);
    }
  }

  function handleTabPress(tab) {
    if (tab === "SERVIÇOS") {
      setActiveTab(tab);
    } else if (tab === "AVALIAÇÕES") {
      navigation.navigate("Reviews", {
        businessId: business.id,
        businessName: business.name,
      });
    } else if (tab === "PORTFÓLIO") {
      navigation.navigate("Portfolio", {
        businessName: business.name,
        workspacePhotos: business.workspacePhotos ?? [],
        portfolioPhotos: business.portfolioPhotos ?? [],
      });
    } else if (tab === "PACOTES") {
      navigation.navigate("Packages", {
        businessName: business.name,
      });
    } else if (tab === "CARTÃO DE PRESENTE") {
      navigation.navigate("GiftCards", {
        businessId: business.id,
        businessName: business.name,
      });
    } else if (tab === "DETALHES") {
      navigation.navigate("Details", {
        businessId: business.id,
        businessName: business.name,
      });
    } else {
      showAlert("Em breve", "Essa seção ainda está em construção.");
    }
  }

  function handleBook(service) {
  navigation.navigate("Booking", {
    businessId,
    business,
    service,
  });
}

  if (loading || !business) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.brandDark} size="large" />
      </View>
    );
  }

  const mainPhoto = business.photos?.[0];
  const thumbnails = business.photos?.slice(1, 5) ?? [];
  const extraCount = (business.photos?.length ?? 0) - 5;

  const filteredServices = services
    .filter((s) => (servicesFilter === "popular" ? s.popular : !s.popular))
    .filter(
      (s) => !search || s.name.toLowerCase().includes(search.toLowerCase()),
    );

    if (loading) {
    return <LoadingScreen />;
}

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View className="relative">
        {mainPhoto ? (
          <Image
            source={{ uri: mainPhoto }}
            className="w-full"
            style={{ height: 260 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-full bg-neutral-200 items-center justify-center"
            style={{ height: 260 }}
          />
        )}

        <Pressable
          onPress={() => navigation.goBack()}
          className="absolute top-14 left-5 bg-white/90 rounded-full w-10 h-10 items-center justify-center"
        >
          <ArrowLeft color="#0a0a0a" size={20} />
        </Pressable>
      </View>

      {thumbnails.length > 0 && (
        <View className="flex-row px-5 mt-3 gap-2">
          {thumbnails.map((photo, index) => {
            const isLast = index === thumbnails.length - 1 && extraCount > 0;
            return (
              <View
                key={photo}
                className="relative flex-1"
                style={{ height: 56 }}
              >
                <Image
                  source={{ uri: photo }}
                  className="w-full h-full rounded-xl"
                  resizeMode="cover"
                />
                {isLast && (
                  <View className="absolute inset-0 bg-black/55 rounded-xl items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      +{extraCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View className="px-5 mt-4">
        {business.featured && (
          <View className="flex-row items-center mb-2">
            <Star color={colors.brand} fill={colors.brand} size={12} />
            <Text className="ml-1.5 text-xs font-semibold text-brand-dark">
              Recomendado pela Glowly
            </Text>
          </View>
        )}

        <Text className="text-2xl font-bold text-neutral-950">
          {business.name}
        </Text>

        {business.rating != null && (
          <View className="flex-row items-center mt-1.5">
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={16}
                  color={colors.brand}
                  fill={n <= Math.round(business.rating) ? colors.brand : "none"}
                />
              ))}
            </View>
            <Text className="ml-2 text-sm font-bold text-neutral-800">
              {business.rating.toFixed(1).replace(".", ",")}
            </Text>
            {business.reviewCount != null && business.reviewCount > 0 && (
              <Text className="ml-1 text-sm text-brand-dark font-semibold">
                {business.reviewCount} avaliações
              </Text>
            )}
          </View>
        )}

        <Text className="text-sm text-neutral-500 mt-2">
          {business.address}, {business.city}-{business.state}
        </Text>

        <View className="flex-row items-center mt-1.5">
          {business.featured && (
            <Pressable
              onPress={() =>
                navigation.navigate("Reviews", {
                  businessId: business.id,
                  businessName: business.name,
                })
              }
              className="flex-row items-center mr-3"
            >
              <Text className="text-xs text-neutral-400">Destaque</Text>
              <Info size={11} color="#a3a3a3" className="ml-1" />
            </Pressable>
          )}
          <Text className="text-xs text-neutral-400">Empreendedor</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-5 border-b border-neutral-100"
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => handleTabPress(tab)}
              className="mr-6 pb-3"
            >
              <Text
                className={`text-[12px] ${isActive ? "font-extrabold text-neutral-950" : "font-semibold text-neutral-400"}`}
              >
                {tab}
              </Text>
              {isActive && <View className="mt-2 h-[2px] bg-neutral-950" />}
            </Pressable>
          );
        })}
      </ScrollView>

      {activeTab === "SERVIÇOS" && (
        <View className="px-5 mt-4 pb-8">
          <View className="flex-row items-center bg-[#f3f3f3] rounded-xl px-3 py-3 mb-4">
            <Search size={18} color="#737373" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar serviços"
              placeholderTextColor="#a3a3a3"
              className="ml-2 flex-1 text-sm text-neutral-800"
            />
          </View>

          <View className="flex-row gap-2 mb-5">
            <Pressable
              onPress={() => setServicesFilter("popular")}
              className={`rounded-full px-4 py-2 border ${servicesFilter === "popular" ? "bg-brand border-brand" : "bg-white border-neutral-300"}`}
            >
              <Text
                className={`text-xs font-bold ${servicesFilter === "popular" ? "text-on-brand" : "text-neutral-700"}`}
              >
                Serviços populares
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setServicesFilter("other")}
              className={`rounded-full px-4 py-2 border ${servicesFilter === "other" ? "bg-brand border-brand" : "bg-white border-neutral-300"}`}
            >
              <Text
                className={`text-xs font-bold ${servicesFilter === "other" ? "text-on-brand" : "text-neutral-700"}`}
              >
                Outros serviços
              </Text>
            </Pressable>
          </View>

          <Text className="text-lg font-bold text-neutral-950 mb-2">
            {servicesFilter === "popular"
              ? "Serviços populares"
              : "Outros serviços"}
          </Text>

          {filteredServices.length === 0 ? (
            <Text className="text-sm text-neutral-400 mt-3">
              Nenhum serviço encontrado.
            </Text>
          ) : (
            filteredServices.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                onBook={handleBook}
              />
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}
