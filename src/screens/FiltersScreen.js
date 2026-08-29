import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Tag, Home, Monitor } from "lucide-react-native";
import { colors } from "../theme";

const FILTERS = [
  {
    key: "special_offers",
    label: "Ofertas especiais",
    Icon: Tag,
  },
  {
    key: "home_service",
    label: "Atendimento em domicílio",
    Icon: Home,
  },
  {
    key: "online_service",
    label: "Serviços online",
    Icon: Monitor,
  },
];

export default function FiltersScreen({ navigation, route }) {
  const initialFilters = route.params?.activeFilters ?? [];
  const onApply = route.params?.onApply;

  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  function toggleFilter(key) {
    setSelectedFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  }

  function handleClear() {
    setSelectedFilters([]);
  }

  function handleApply() {
    if (onApply) onApply(selectedFilters);
    navigation.goBack();
  }

  function handleDiscard() {
    navigation.goBack();
  }

  return (
    <View className="flex-1 bg-[#efefef]">

      <View className="flex-row items-start justify-between px-6 pt-14 pb-4">
        <Text className="text-2xl font-bold text-neutral-950">Filtros</Text>
        <Pressable onPress={handleDiscard} className="pt-1">
          <Text className="text-sm font-bold text-red-500">Descartar</Text>
        </Pressable>
      </View>

      <View className="flex-1 px-6 pt-2">
        <Text className="text-sm font-semibold text-neutral-600 mb-4">Filtrar por</Text>

        <View className="flex-row flex-wrap gap-3">
          {FILTERS.map(({ key, label, Icon }) => {
            const isActive = selectedFilters.includes(key);
            return (
              <Pressable
                key={key}
                onPress={() => toggleFilter(key)}
                className={`flex-row items-center rounded-lg px-3 py-2 border ${
                  isActive
                    ? "bg-brand border-brand"
                    : "bg-white border-neutral-300"
                }`}
              >
                <Icon
                  size={14}
                  color={isActive ? colors.onBrand : "#525252"}
                  strokeWidth={2}
                />
                <Text
                  className={`ml-2 text-xs font-semibold ${
                    isActive ? "text-on-brand" : "text-neutral-700"
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="flex-row items-center gap-4 px-6 pb-10 pt-4 border-t border-neutral-300 bg-[#efefef]">
        <Pressable
          onPress={handleClear}
          className="flex-1 items-center justify-center rounded-xl border border-neutral-400 py-3.5 bg-white"
        >
          <Text className="text-sm font-semibold text-neutral-700">Limpar</Text>
        </Pressable>

        <Pressable
          onPress={handleApply}
          className="flex-1 items-center justify-center rounded-xl py-3.5 bg-brand"
        >
          <Text className="text-sm font-bold text-on-brand">Ver resultados</Text>
        </Pressable>
      </View>
    </View>
  );
}
