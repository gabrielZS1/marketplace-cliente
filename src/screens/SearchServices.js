import { Pressable, ScrollView, Text, TextInput, View, Modal, Animated, Dimensions } from "react-native";
import { CalendarDays, MapPin, Search } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, ChevronDown, Info, Circle, CheckCircle } from "lucide-react-native";
import { getBusinessesByCategory } from "../services/api";
import { FlatList } from "react-native";

import ResultCard from "../components/ResultCard";
import LoadingScreen from "../components/LoadingScreen";

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

const CATEGORY_ITEM_WIDTH = 110;
const CATEGORY_REPEAT_COUNT = 40;

const repeatedCategories = Array.from({ length: CATEGORY_REPEAT_COUNT }).flatMap((_, i) =>
    CATEGORIES.map((c) => ({ ...c, uid: `${c.key}-${i}` }))
);

const initialCategoryScrollIndex = Math.floor(CATEGORY_REPEAT_COUNT / 2) * CATEGORIES.length;

const SCREEN_HEIGHT = Dimensions.get("window").height;



export default function SearchService({ navigation, route }) {
    const initialCategory = route.params?.category ?? "ALL";

    const [search, setSearch] = useState(route.params?.query ?? "");
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [address, setAddress] = useState("");
    const [date, setDate] = useState(null);
    const [sortOpen, setSortOpen] = useState(false);
    const [sortBy, setSortBy] = useState("recommended");
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
            console.log(error.message);
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

    if (loading) {
    return <LoadingScreen />;
}

    return (
        <>
            <FlatList
                data={sortedResults}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                className="flex-1 bg-[#dcdcdc]"
                contentContainerStyle={{ paddingBottom: 90 }}
                ListHeaderComponent={
                    <View>
                        <View className="bg-[#9f7300] pb-2 pt-11">
                            <Pressable
                                onPress={() => navigation.navigate("SearchInput")}
                                className="mx-6 flex-row items-center rounded-lg bg-[#d9d9d9] px-3 py-2"
                            >
                                <Search size={22} color="#656565" strokeWidth={3} />
                                <Text className="ml-2 flex-1 text-[11px] text-[#555]">
                                    {search || "Pesquise serviços ou empresas"}
                                </Text>
                            </Pressable>

                            <View className="mx-7 mt-2 flex-row gap-2">
                                <Pressable
                                    onPress={() => navigation.navigate("LocationSearch", { onSelect: setAddress })}
                                    className="h-8 flex-1 flex-row items-center rounded-lg bg-[#d9d9d9] px-2"
                                >
                                    <MapPin size={13} color="#656565" strokeWidth={3} />
                                    <Text numberOfLines={1} className="ml-1 text-[8px] text-[#555]">
                                        {address || "Rua João Mendes Mesquita"}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => navigation.navigate("DatePicker", { onSelect: setDate })}
                                    className="h-8 flex-1 flex-row items-center rounded-lg bg-[#d9d9d9] px-2"
                                >
                                    <CalendarDays size={13} color="#656565" strokeWidth={3} />
                                    <Text numberOfLines={1} className="ml-1 text-[8px] text-[#555]">
                                        {date || "Quando?"}
                                    </Text>
                                </Pressable>
                            </View>

                            <FlatList
                                data={repeatedCategories}
                                keyExtractor={(item) => item.uid}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                initialScrollIndex={initialCategoryScrollIndex}
                                getItemLayout={(_, index) => ({
                                    length: CATEGORY_ITEM_WIDTH,
                                    offset: CATEGORY_ITEM_WIDTH * index,
                                    index,
                                })}
                                className="mt-4"
                                contentContainerStyle={{ paddingHorizontal: 6 }}
                                renderItem={({ item }) => {
                                    const isActive = activeCategory === item.key;
                                    return (
                                        <Pressable
                                            onPress={() => setActiveCategory(item.key)}
                                            className="mr-6 items-center justify-start"
                                            style={{ width: CATEGORY_ITEM_WIDTH - 24, height: 34 }}
                                        >
                                            <Text
                                                className={`text-[11px] text-center ${
                                                    isActive
                                                        ? "text-white font-extrabold"
                                                        : "text-white/75 font-bold"
                                                }`}
                                            >
                                                {item.label}
                                            </Text>
                                            {isActive && (
                                                <View className="absolute bottom-0 h-[2px] w-8 rounded-full bg-white" />
                                            )}
                                        </Pressable>
                                    );
                                }}
                            />
                        </View>

                        <View className="px-6 pt-5">
                            <Text className="text-base font-bold text-neutral-950 mb-3">
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
                                        className="rounded-full bg-[#e7e7e7] px-4 py-2 mr-2"
                                    >
                                        <Text className="text-xs font-semibold text-neutral-800">
                                            {service}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        <View className="flex-row items-center px-6 mt-4 gap-2">
                            <Pressable
                                onPress={() =>
                                    navigation.navigate("Filters", {
                                        activeFilters: [],
                                        onApply: (filters) => console.log("Filtros:", filters),
                                    })
                                }
                                className="flex-row items-center rounded-full border border-neutral-400 px-3 py-2"
                            >
                                <SlidersHorizontal size={14} color="#404040" />
                                <Text className="text-xs font-semibold text-neutral-700 ml-1.5">
                                    Filtros
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setSortOpen(true)}
                                className="flex-row items-center rounded-full border border-neutral-400 px-3 py-2"
                            >
                                <Text className="text-xs font-semibold text-neutral-700">
                                    Ordenar por: {currentSortLabel}
                                </Text>
                                <ChevronDown size={14} color="#404040" className="ml-1" />
                            </Pressable>
                        </View>

                        <View className="px-6 mt-5 mb-4">
                            <Text className="text-xl font-bold text-neutral-950">
                                {CATEGORY_LABELS[activeCategory] ?? "Resultados"} ({sortedResults.length})
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
                            onPress={() =>
                                navigation.navigate("BusinessDetail", { businessId: item.id })
                            }
                        />
                    </View>
                )}
                ListEmptyComponent={
                    !loading && (
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
                                    <CheckCircle size={22} color="#946900" strokeWidth={2} />
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