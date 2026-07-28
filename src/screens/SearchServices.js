import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { CalendarDays, MapPin, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import { SlidersHorizontal, ChevronDown, Info } from "lucide-react-native";
import { getBusinessesByCategory } from "../services/api";
import { FlatList } from "react-native";

import ResultCard from "../components/ResultCard";

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

const POPULAR_SERVICES = ["Corte de Cabelo", "Manicure", "Dia de SPA", "Sobrancelha", "Permanente", "Alisanento / Relaxante", "Maquiagem", "Depilação", "Massagem", "Limpeza de Pele", "Hidratação Capilar", "Coloração", "Pintura de Cabelo", "Escova / Penteado"];

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

const CATEGORY_ITEM_WIDTH = 110;
const CATEGORY_REPEAT_COUNT = 40;

const repeatedCategories = Array.from({ length: CATEGORY_REPEAT_COUNT }).flatMap((_, i) =>
    CATEGORIES.map((c) => ({ ...c, uid: `${c.key}-${i}` }))
);

const initialCategoryScrollIndex = Math.floor(CATEGORY_REPEAT_COUNT / 2) * CATEGORIES.length;

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

    const SORT_LABELS = {
        recommended: "recomendação",
        distance: "distância",
        rating: "avaliação",
    };

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

    return (
        <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            className="flex-1 bg-[#dcdcdc]"
            contentContainerStyle={{ paddingBottom: 24 }}
            ListHeaderComponent={
                <View>
                    <View className="bg-[#9f7300] pb-2 pt-11">
                        <View className="mx-6 flex-row items-center rounded-lg bg-[#d9d9d9] px-3 py-2">
                            <Search size={22} color="#656565" strokeWidth={3} />
                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                placeholder="Pesquise serviços ou empresas"
                                placeholderTextColor="#555"
                                returnKeyType="search"
                                className="ml-2 flex-1 text-[11px] text-neutral-800"
                            />
                        </View>



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
                            getItemLayout={(_, index) => ({ length: CATEGORY_ITEM_WIDTH, offset: CATEGORY_ITEM_WIDTH * index, index })}
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
                                            className={`text-[11px] text-center ${isActive ? "text-white font-extrabold" : "text-white/75 font-bold"}`}
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

                    {/* Serviços populares */}
                    <View className="px-6 pt-5">
                        <Text className="text-base font-bold text-neutral-950 mb-3">Serviços populares</Text>
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
                                    <Text className="text-xs font-semibold text-neutral-800">{service}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Filtros e ordenação */}
                    <View className="flex-row items-center px-6 mt-4 gap-2">
                        <Pressable
                            onPress={() => navigation.navigate("Filters")}
                            className="flex-row items-center rounded-full border border-neutral-400 px-3 py-2"
                        >
                            <SlidersHorizontal size={14} color="#404040" />
                            <Text className="text-xs font-semibold text-neutral-700 ml-1.5">Filtros</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setSortOpen(!sortOpen)}
                            className="flex-row items-center rounded-full border border-neutral-400 px-3 py-2"
                        >
                            <Text className="text-xs font-semibold text-neutral-700">Ordenar por: {SORT_LABELS[sortBy]}</Text>
                            <ChevronDown size={14} color="#404040" className="ml-1" />
                        </Pressable>
                    </View>

                    {/* Cabeçalho de resultados */}
                    <View className="px-6 mt-5 mb-4">
                        <Text className="text-xl font-bold text-neutral-950">
                            {CATEGORY_LABELS[activeCategory] ?? "Resultados"} ({results.length})
                        </Text>
                        <Pressable className="flex-row items-center mt-1">
                            <Text className="text-xs text-neutral-500">O que afeta os resultados de pesquisa?</Text>
                            <Info size={12} color="#737373" className="ml-1" />
                        </Pressable>
                    </View>
                </View>
            }
            renderItem={({ item }) => (
                <View className="px-6">
                    <ResultCard
                        business={item}
                        onPress={() => navigation.navigate("BusinessDetail", { businessId: item.id })}
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
    );
}