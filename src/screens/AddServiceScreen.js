import { useEffect, useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { X, Search, ChevronDown, ChevronUp } from "lucide-react-native";
import { getBusinessServices } from "../services/api";

function formatPrice(price) {
  return `R$ ${Number(price).toFixed(2).replace(".", ",")}`;
}

export default function AddServiceScreen({ navigation, route }) {
  const { businessId, onSelect } = route.params;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const data = await getBusinessServices(businessId);
      setServices(data);

      const categories = [...new Set(data.map((s) => s.category || "Outros"))];
      setOpenCategories({ [categories[0]]: true });
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }

  const grouped = useMemo(() => {
    const filtered = services.filter(
      (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
    );

    const map = {};
    filtered.forEach((service) => {
      const key = service.category || "Outros";
      if (!map[key]) map[key] = [];
      map[key].push(service);
    });
    return map;
  }, [services, search]);

  function toggleCategory(category) {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  }

  function handleReserve(service) {
    onSelect(service);
    navigation.goBack();
  }

  return (
    <View className="flex-1 bg-white pt-14 px-5">
      <Pressable onPress={() => navigation.goBack()} className="mb-5">
        <X color="#0a0a0a" size={24} />
      </Pressable>

      <Text className="text-2xl font-bold text-neutral-950 mb-5">Adicionar serviço</Text>

      <View className="flex-row items-center bg-neutral-100 rounded-xl px-3 py-3 mb-5">
        <Search size={18} color="#737373" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Pesquise por serviços"
          placeholderTextColor="#737373"
          className="ml-2 flex-1 text-sm text-neutral-800"
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#9f7300" style={{ marginTop: 24 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(grouped).map(([category, categoryServices]) => {
            const isOpen = !!openCategories[category];
            return (
              <View key={category} className="mb-3">
                <Pressable
                  onPress={() => toggleCategory(category)}
                  className="flex-row items-center justify-between bg-neutral-100 rounded-xl px-4 py-3"
                >
                  <Text className="text-sm font-bold text-neutral-950 tracking-wide">
                    {category.toUpperCase()}
                  </Text>
                  {isOpen ? (
                    <ChevronUp size={18} color="#525252" />
                  ) : (
                    <ChevronDown size={18} color="#525252" />
                  )}
                </Pressable>

                {isOpen && (
                  <View>
                    {categoryServices.map((service, index) => (
                      <View
                        key={service.id}
                        className={`flex-row items-start justify-between py-3 ${
                          index !== categoryServices.length - 1 ? "border-b border-neutral-100" : ""
                        }`}
                      >
                        <View className="flex-1 pr-3">
                          <Text className="text-sm font-bold text-neutral-950">{service.name}</Text>
                          {service.description ? (
                            <Text className="text-xs text-neutral-600 mt-0.5" numberOfLines={1}>
                              {service.description}
                            </Text>
                          ) : null}
                        </View>

                        <View className="items-end">
                          <Text className="text-sm font-bold text-neutral-950">{formatPrice(service.price)}</Text>
                          <Text className="text-xs text-neutral-600 mb-2">{service.durationMinutes}m</Text>
                          <Pressable
                            onPress={() => handleReserve(service)}
                            className="bg-[#9f7300] rounded-lg px-4 py-2"
                          >
                            <Text className="text-white text-xs font-bold">Reservar</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}