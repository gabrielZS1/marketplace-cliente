import { Pressable, ScrollView, Text, TextInput, View, Modal, Animated, Dimensions } from "react-native";
import { Search } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, ChevronDown, Info, Circle, CheckCircle } from "lucide-react-native";
import { getBusinessesByCategory } from "../services/api";
import { FlatList } from "react-native";

import ResultCard from "../components/ResultCard";
import { ResultListSkeleton } from "../components/skeletons";
import { colors } from "../theme";
import logger from "../services/logger";

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

const POPULAR_SERVICES = [
    "Corte de Cabelo", "Manicure", "Dia de SPA", "Sobrancelha",
    "Permanente", "Alisamento / Relaxante", "Maquiagem", "Depilação",
    "Massagem", "Limpeza de Pele", "Hidratação Capilar", "Coloração",
    "Pintura de Cabelo", "Escova / Penteado",
];

const CATEGORY_LABELS = {
    BARBERSHOP: "Barbeiros",
    HAIRDRESSER: "Cabeleireiros",
    WELLNESS: "Saúde e bem-estar",
    SPA: "Spas",
    SKINCARE: "Cuidados com a pele",
    MANICURE: "Manicures",
    EYEBROWS_LASHES: "Sobrancelhas e cílios",
    MAKEUP: "Maquiadores",
    OTHER: "Outros",
    ALL: "Resultados",
};

const SORT_OPTIONS = [
    { key: "recommended", label: "Recomendada" },
    { key: "distance",    label: "Distância (mais perto)" },
    { key: "rating",      label: "Avaliações (melhores classificações primeiro)" },
];


const SCREEN_HEIGHT = Dimensions.get("window").height;



export default function SearchService({ navigation, route }) {
    const initialCategory = route.params?.category ?? "ALL";

    const [search, setSearch] = useState(route.params?.query ?? "");
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [sortOpen, setSortOpen] = useState(false);
    const [sortBy, setSortBy] = useState("recommended");
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label ?? "recomendação";

    // Sincroniza a categoria ativa quando a tela é reaberta com uma categoria
    // diferente (o React Navigation reaproveita a mesma instância da tela,
    // então o useState acima só roda uma vez — sem isso, ficava travado
    // na primeira categoria clicada).
    useEffect(() => {
        if (route.params?.category) {
            setActiveCategory(route.params.category);
        }
    }, [route.params?.category]);

    useEffect(() => {
        loadResults();
    }, [activeCategory, search]);

    async function loadResults() {
        setLoading(true);
        try {
            const category = activeCategory === "ALL" ? null : activeCategory;
            const data = await getBusinessesByCategory(category);
            const filtered = search
                ? data.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
                : data;
            setResults(filtered);
        } catch (error) {
            logger.error("Erro ao carregar resultados:", error?.message);
        } finally {
            setLoading(false);
        }
    }

    // Ordenação local dos resultados
    const sortedResults = [...results].sort((a, b) => {
        if (sortBy === "distance") {
            return (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER);
        }
        if (sortBy === "rating") {
            return (b.rating ?? 0) - (a.rating ?? 0);
        }
        return 0; // recommended — ordem original da API
    });

    return (
        <>
            <FlatList
                data={loading ? [] : sortedResults}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                className="flex-1 bg-surface-alt"
                contentContainerStyle={{ paddingBottom: 140 }}
                ListHeaderComponent={
                    <View>
                        <View className="bg-brand-dark pb-4 pt-16">
                            <Pressable
                                onPress={() => navigation.navigate("SearchInput")}
                                className="mx-6 flex-row items-center rounded-xl bg-white px-4 py-3.5"
                            >
                                <Search size={20} color="#656565" strokeWidth={2.5} />
                                <Text className="ml-2 flex-1 text-sm text-neutral-500">
                                    {search || "Pesquise serviços ou empresas"}
                                </Text>
                            </Pressable>

                            <FlatList
                                data={CATEGORIES}
                                keyExtractor={(item) => item.key}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="mt-4"
                                contentContainerStyle={{ paddingHorizontal: 20 }}
                                renderItem={({ item }) => {
                                    const isActive = activeCategory === item.key;
                                    return (
                                        <Pressable
                                            onPress={() => setActiveCategory(item.key)}
                                            className="mr-6 items-center justify-center"
                                            style={{ minHeight: 44 }}
                                        >
                                            <Text
                                                className={`text-[13px] text-center ${
                                                    isActive
                                                        ? "text-white font-extrabold"
                                                        : "text-white/75 font-bold"
                                                }`}
                                            >
                                                {item.label}
                                            </Text>
                                            {isActive && (
                                                <View className="absolute -bottom-1 h-[2px] w-8 rounded-full bg-white" />
                                            )}
                                        </Pressable>
                                    );
                                }}
                            />
                        </View>

                        <View className="px-6 pt-6">
                            <Text className="text-lg font-bold text-neutral-950 mb-3">
                                Serviços populares
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 24 }}
                            >
                                {POPULAR_SERVICES.map((service) => (
                                    <Pressable
                                        key={service}
                                        onPress={() => setSearch(service)}
                                        className="rounded-full bg-brand-tint px-4 py-2.5 mr-2"
                                    >
                                        <Text className="text-sm font-semibold text-brand-dark">
                                            {service}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        <View className="flex-row items-center px-6 mt-5 gap-2">
                            <Pressable
                                onPress={() =>
                                    navigation.navigate("Filters", {
                                        activeFilters: selectedFilters,
                                        onApply: setSelectedFilters,
                                    })
                                }
                                className={`flex-row items-center rounded-full border px-3.5 py-2.5 ${
                                    selectedFilters.length
                                        ? "border-brand-dark bg-brand-tint"
                                        : "border-line bg-white"
                                }`}
                            >
                                <SlidersHorizontal
                                    size={15}
                                    color={selectedFilters.length ? colors.brandDark : "#404040"}
                                />
                                <Text
                                    className={`text-sm font-semibold ml-1.5 ${
                                        selectedFilters.length ? "text-brand-dark" : "text-neutral-700"
                                    }`}
                                >
                                    Filtros{selectedFilters.length ? ` (${selectedFilters.length})` : ""}
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setSortOpen(true)}
                                className="flex-row items-center rounded-full border border-line bg-white px-3.5 py-2.5"
                            >
                                <Text className="text-sm font-semibold text-neutral-700">
                                    Ordenar por: {currentSortLabel}
                                </Text>
                                <ChevronDown size={15} color="#404040" className="ml-1" />
                            </Pressable>
                        </View>

                        <View className="px-6 mt-6 mb-4">
                            <Text className="text-xl font-bold text-neutral-950">
                                {CATEGORY_LABELS[activeCategory] ?? "Resultados"}
                                {loading ? "" : ` (${sortedResults.length})`}
                            </Text>
                            <Pressable className="flex-row items-center mt-1">
                                <Text className="text-xs text-neutral-500">
                                    O que afeta os resultados de pesquisa?
                                </Text>
                                <Info size={12} color="#737373" className="ml-1" />
                            </Pressable>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="px-6">
                        <ResultCard
                            business={item}
                            categoryLabel={activeCategory === "ALL" ? CATEGORY_LABELS[item.category] : null}
                            onPress={() =>
                                navigation.navigate("BusinessDetail", { businessId: item.id })
                            }
                        />
                    </View>
                )}
                ListEmptyComponent={
                    loading ? (
                        <ResultListSkeleton />
                    ) : (
                        <View className="px-6 items-center mt-10">
                            <Text className="text-neutral-500">Nenhum resultado encontrado.</Text>
                        </View>
                    )
                }
            />

            <SortBottomSheet
                visible={sortOpen}
                current={sortBy}
                onSelect={setSortBy}
                onClose={() => setSortOpen(false)}
            />
        </>
    );
}

// ── Componente do Bottom Sheet de ordenação ──────────────────────────────────
function SortBottomSheet({ visible, current, onSelect, onClose }) {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (visible) {
            setModalVisible(true);
            // Entrada: spring suave de baixo para cima + fade do overlay
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    damping: 20,
                    stiffness: 160,
                    mass: 0.8,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Saída: timing rápido para baixo + fade do overlay
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => setModalVisible(false));
        }
    }, [visible]);

    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Animated.View
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", opacity: overlayOpacity }}
            >
                <Pressable style={{ flex: 1 }} onPress={onClose} />
            </Animated.View>

            <Animated.View
                style={[
                    { transform: [{ translateY }] },
                    { position: "absolute", bottom: 0, left: 0, right: 0 },
                ]}
            >
            <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
                <View className="w-10 h-1 rounded-full bg-neutral-300 self-center mb-5" />
                <Text className="text-2xl font-bold text-neutral-950 mb-5">Ordenar por</Text>

                {SORT_OPTIONS.map((option, index) => {
                    const isSelected = current === option.key;
                    return (
                        <View key={option.key}>
                            <Pressable
                                onPress={() => {
                                    onSelect(option.key);
                                    onClose();
                                }}
                                className="flex-row items-center py-4"
                            >
                                {isSelected ? (
                                    <CheckCircle size={22} color={colors.brandDark} strokeWidth={2} />
                                ) : (
                                    <Circle size={22} color="#a3a3a3" strokeWidth={2} />
                                )}
                                <Text
                                    className={`ml-3 text-sm ${
                                        isSelected
                                            ? "font-bold text-neutral-950"
                                            : "font-medium text-neutral-700"
                                    }`}
                                >
                                    {option.label}
                                </Text>
                            </Pressable>

                            {index < SORT_OPTIONS.length - 1 && (
                                <View className="h-[1px] bg-neutral-200" />
                            )}
                        </View>
                    );
                })}
            </View>
            </Animated.View>
        </Modal>
    );
}
// ─────────────────────────────────────────────────────────────────────────────