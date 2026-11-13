import { useEffect, useMemo, useState } from "react";
import {
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
  ChevronRight,
  Search,
  Tag,
  Scissors,
  Hand,
  Sparkles,
  Eye,
  Droplet,
  HeartPulse,
  Flower2,
  Palette,
  LayoutGrid,
} from "lucide-react-native";
import { FlatList } from "react-native";
import { BusinessCardRowSkeleton, NextAppointmentSkeleton } from "../components/skeletons";
import { colors, brandGradient, shadow } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import { UPCOMING_STATUSES, withEffectiveStatus } from "../utils/appointmentStatus";

import { getAllBusinesses, getNearbyBusinesses, listMyAppointments } from "../services/api";

// Ícones simples (só o traço, sem círculo/foto) — mesmos do app do estabelecimento.
const CATEGORIES = [
  { key: "BARBERSHOP", label: "Barbeiros", Icon: Scissors },
  { key: "HAIRDRESSER", label: "Cabeleireiro", Icon: Sparkles },
  { key: "WELLNESS", label: "Saúde e\nbem-estar", Icon: HeartPulse },
  { key: "SPA", label: "SPA", Icon: Flower2 },
  { key: "SKINCARE", label: "Cuidados\ncom a pele", Icon: Droplet },
  { key: "MANICURE", label: "Manicure", Icon: Hand },
  { key: "EYEBROWS_LASHES", label: "Sobrancelhas\ne cílios", Icon: Eye },
  { key: "MAKEUP", label: "Maquiagem", Icon: Palette },
  { key: "OTHER", label: "Outros", Icon: LayoutGrid },
];


function BusinessImage({ business, className }) {
  const imageUri =
    business.logoUrl ||
    business.imageUrl ||
    business.coverImage ||
    business.photoUrl;

  return imageUri ? (
    <Image source={{ uri: imageUri }} className={className} resizeMode="cover" />
  ) : (
    <View className={`${className} items-center justify-center bg-stone-300`}>
      <Text className="text-[10px] text-stone-500">Sem imagem</Text>
    </View>
  );
}

// Card único reutilizado em todas as listas de negócios da Home. O tamanho e os
// selos exibidos mudam conforme a seção, evitando manter 3 componentes quase
// idênticos (como no design original) só para variar a largura do card.
function ServiceCard({ business, onPress, size = "lg", showPromotion = false }) {
  const isSmall = size === "sm";

  return (
    // A sombra fica no wrapper externo (sem overflow-hidden) e o recorte
    // arredondado no wrapper interno — juntar as duas coisas na mesma View faz
    // o Android desenhar a sombra retangular, "quadrada" nas quinas de baixo.
    <Pressable
      onPress={onPress}
      className={`rounded-2xl ${isSmall ? "w-40 mr-3" : "w-56 mr-4"}`}
      style={shadow.card}
    >
      <View className="overflow-hidden rounded-2xl bg-white">
        <View>
          <BusinessImage business={business} className={`w-full ${isSmall ? "h-24" : "h-32"}`} />

          {!isSmall && business.rating != null && (
            <View className="absolute right-2 top-2 rounded-lg bg-black/55 px-2 py-1">
              <Text className="text-[11px] font-bold text-white">
                {Number(business.rating).toFixed(1).replace(".", ",")}
              </Text>
            </View>
          )}

          {showPromotion && !!business.promotionText && (
            <View className="absolute bottom-2 left-2 flex-row items-center rounded-full bg-brand px-2 py-1">
              <Tag size={10} color={colors.onBrand} />
              <Text className="ml-1 text-[10px] font-bold text-on-brand">
                {business.promotionText}
              </Text>
            </View>
          )}
        </View>

        <View className="px-3 py-2.5">
          <Text numberOfLines={1} className={`font-bold text-ink ${isSmall ? "text-xs" : "text-sm"}`}>
            {business.name}
          </Text>

          {!isSmall && (
            <Text numberOfLines={1} className="mt-0.5 text-[11px] text-ink-soft">
              {[business.address, business.city].filter(Boolean).join(", ") || "Endereço não informado"}
            </Text>
          )}

          {(business.distanceKm != null || business.availableToday) && (
            <View className="mt-1.5 flex-row items-center" style={{ gap: 6 }}>
              {business.distanceKm != null && !isSmall && (
                <View className="rounded-full bg-brand-tint px-2 py-0.5">
                  <Text className="text-[10px] font-medium text-brand-dark">
                    {business.distanceKm < 1
                      ? `${Math.round(business.distanceKm * 1000)} m`
                      : `${business.distanceKm.toFixed(1)} km`}
                  </Text>
                </View>
              )}
              {business.availableToday && (
                <View className="flex-row items-center">
                  <View
                    className="mr-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: colors.success }}
                  />
                  <Text className="text-[10px] font-medium text-ink-soft">Disponível hoje</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// Único cartão de status logo abaixo das categorias: mostra o próximo
// compromisso real do cliente (quando existe) ou um convite para explorar —
// substitui os dois blocos separados ("Seus Recentes" + banner genérico) do
// layout de referência por uma única ação clara.
function NextAppointmentCard({ appointment, onPress }) {
  const date = new Date(appointment.startsAt);
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const day = date.getDate();
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <Pressable
      onPress={onPress}
      className="mx-5 mt-5 flex-row items-center rounded-2xl bg-white px-4 py-3"
      style={shadow.card}
    >
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-brand-tint">
        <Text className="text-[10px] font-bold uppercase text-brand-dark">{month}</Text>
        <Text className="text-base font-bold text-brand-dark">{day}</Text>
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wide text-brand-dark">
          Seu próximo horário
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-sm font-bold text-ink">
          {appointment.serviceName} · {appointment.businessName}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-xs text-ink-soft">
          {time} com {appointment.employeeName}
        </Text>
      </View>

      <ChevronRight size={20} color={colors.inkFaint} />
    </Pressable>
  );
}

function EmptyAppointmentsCard({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-5 mt-5 flex-row items-center justify-between rounded-2xl bg-white px-4 py-4"
      style={shadow.card}
    >
      <View className="flex-1 pr-3">
        <Text className="text-sm font-bold text-ink">Ainda não há agendamentos</Text>
        <Text className="mt-0.5 text-xs text-ink-soft">
          Explore serviços perto de você e reserve em poucos toques.
        </Text>
      </View>

      <ArrowRight size={22} color={colors.brandDark} strokeWidth={2.4} />
    </Pressable>
  );
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <View className="mb-3 flex-row items-center justify-between px-5">
      <Text className="text-lg font-bold text-ink">{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} className="flex-row items-center">
          <Text className="mr-1 text-xs font-bold text-brand-dark">Ver tudo</Text>
          <ArrowRight size={12} color={colors.brandDark} strokeWidth={3} />
        </Pressable>
      )}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { token, user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHome();
  }, []);

  async function fetchBusinesses() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const { coords } = await Location.getCurrentPositionAsync({});
        return await getNearbyBusinesses(coords.latitude, coords.longitude);
      }
      return await getAllBusinesses();
    } catch {
      return await getAllBusinesses();
    }
  }

  async function loadHome() {
    try {
      const [businessesData, appointmentsData] = await Promise.all([
        fetchBusinesses().catch(() => []),
        listMyAppointments(token).catch(() => []),
      ]);
      setBusinesses(Array.isArray(businessesData) ? businessesData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } finally {
      // Sem isto, uma falha de rede deixava o esqueleto de carregamento para sempre.
      setLoading(false);
      setRefreshing(false);
    }
  }

  const nearbyBusinesses = useMemo(
    () =>
      [...businesses].sort(
        (a, b) =>
          (a.distanceKm ?? Number.MAX_SAFE_INTEGER) -
          (b.distanceKm ?? Number.MAX_SAFE_INTEGER),
      ),
    [businesses],
  );

  const offerBusinesses = useMemo(
    () => businesses.filter((business) => business.promotionText),
    [businesses],
  );

  const nextAppointment = useMemo(() => {
    const upcoming = appointments
      .map((appointment) => withEffectiveStatus(appointment))
      .filter((appointment) => UPCOMING_STATUSES.includes(appointment.status))
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return upcoming[0] ?? null;
  }, [appointments]);

  const firstName = user?.name?.split(" ")[0];

  // ─── Helpers de navegação ────────────────────────────────────────────────────

  function goToBusinessDetail(businessId) {
    navigation.navigate("Explorar", {
      screen: "BusinessDetail",
      params: { businessId },
    });
  }

  function goToSearchWithCategory(categoryKey) {
    navigation.navigate("Explorar", {
      screen: "SearchServices",
      params: { category: categoryKey },
    });
  }

  function goToSearch() {
    navigation.navigate("Explorar", { screen: "SearchInput" });
  }

  function goToExplore() {
    navigation.navigate("Explorar", { screen: "SearchServices" });
  }

  function goToAppointments() {
    navigation.navigate("Agendamentos");
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      className="flex-1 bg-surface-alt"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadHome();
          }}
          tintColor={colors.brandDark}
        />
      }
    >
      <LinearGradient colors={brandGradient} className="overflow-hidden pb-6 pt-14">
        <Text className="px-5 text-[11px] font-bold uppercase tracking-widest text-white/60">
          Glowly
        </Text>
        <Text
          className="mt-2 px-5 text-[26px] text-white"
          style={{ fontFamily: "Poppins_700Bold", letterSpacing: -0.3 }}
        >
          Olá{firstName ? `, ${firstName}` : ""}
        </Text>
        <Text className="mt-1 px-5 text-xs text-white/70">
          O que vamos agendar hoje?
        </Text>

        <Pressable
          onPress={goToSearch}
          className="mx-5 mt-4 flex-row items-center rounded-full bg-[#e9e9e9] px-4 py-3"
        >
          <Search size={20} color="#666" strokeWidth={2.5} />
          <Text className="ml-2 flex-1 text-sm text-neutral-500">
            Pesquise serviços ou empresas
          </Text>
        </Pressable>

        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
          contentContainerStyle={{ paddingLeft: 8, paddingRight: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => goToSearchWithCategory(item.key)}
              className="mr-3 w-[78px] items-center"
              accessibilityRole="button"
              accessibilityLabel={item.label.replace("\n", " ")}
            >
              <item.Icon size={30} color="#FFFFFF" strokeWidth={1.7} />
              <Text className="mt-2 text-center text-[10px] font-bold leading-3 text-white">
                {item.label}
              </Text>
            </Pressable>
          )}
        />

        {loading ? (
          <NextAppointmentSkeleton />
        ) : nextAppointment ? (
          <NextAppointmentCard appointment={nextAppointment} onPress={goToAppointments} />
        ) : (
          <EmptyAppointmentsCard onPress={goToExplore} />
        )}
      </LinearGradient>

      <View className="bg-surface-alt pt-6">
        <SectionHeader title="Perto de você" onSeeAll={goToExplore} />
        {loading ? (
          <BusinessCardRowSkeleton />
        ) : nearbyBusinesses.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 4 }}
          >
            {nearbyBusinesses.map((business) => (
              <ServiceCard
                key={business.id}
                business={business}
                onPress={() => goToBusinessDetail(business.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text className="px-5 text-sm text-neutral-500">
            Nenhuma empresa encontrada perto de você.
          </Text>
        )}
      </View>

      {!loading && offerBusinesses.length > 0 && (
        <View className="bg-surface-alt pb-10 pt-7">
          <SectionHeader title="Ofertas especiais" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 4 }}
          >
            {offerBusinesses.map((business) => (
              <ServiceCard
                key={business.id}
                business={business}
                showPromotion
                onPress={() => goToBusinessDetail(business.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ height: 140 }} />
    </ScrollView>
  );
}
