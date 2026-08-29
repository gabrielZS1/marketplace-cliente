import { View, Text, Pressable, Image } from "react-native";
import { Scissors, Info } from "lucide-react-native";
import { colors } from "../theme";

export default function ResultCard({ business, onPress }) {
  return (
    <Pressable onPress={onPress} className="mb-6">
      <View className="rounded-2xl overflow-hidden bg-surface-alt" style={{ height: 160 }}>
        {business.logoUrl ? (
          <Image source={{ uri: business.logoUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-surface-alt">
            <Text className="text-xs text-ink-faint">Sem imagem</Text>
          </View>
        )}

        {business.rating != null && (
          <View className="absolute top-3 right-3 bg-black/60 rounded-xl px-3 py-1.5 items-center">
            <Text className="text-white text-base font-bold">
              {Number(business.rating).toFixed(1).replace(".", ",")}
            </Text>
            {business.reviewCount != null && (
              <Text className="text-white text-[10px]">{business.reviewCount} avaliações</Text>
            )}
          </View>
        )}
      </View>

      <Text className="text-base font-bold text-ink mt-3">{business.name}</Text>

      <Text className="text-xs text-ink-soft mt-0.5" numberOfLines={2}>
        {business.distanceKm != null && `${business.distanceKm.toFixed(1)} km · `}
        {business.address}, {business.city}-{business.state}
      </Text>

      <View className="flex-row items-center mt-2">
        <Scissors size={14} color={colors.inkSoft} />
      </View>

      {business.featured && (
        <View className="flex-row items-center mt-1">
          <Text className="text-xs font-bold text-brand-dark">Destaque</Text>
          <Info size={12} color={colors.inkFaint} className="ml-1" />
        </View>
      )}
    </Pressable>
  );
}
