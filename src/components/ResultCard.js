import { View, Text, Pressable, Image } from "react-native";
import { Star } from "lucide-react-native";
import { colors, shadow } from "../theme";

export default function ResultCard({ business, onPress, categoryLabel }) {
  return (
    // Sombra no wrapper externo, recorte arredondado no interno — evita o
    // Android desenhar a sombra retangular ("quadrada" nas quinas de baixo).
    <Pressable onPress={onPress} className="mb-5 rounded-2xl" style={shadow.card}>
      <View className="overflow-hidden rounded-2xl bg-white">
        <View style={{ height: 150 }}>
          {business.logoUrl ? (
            <Image source={{ uri: business.logoUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-surface-alt">
              <Text className="text-xs text-ink-faint">Sem imagem</Text>
            </View>
          )}

          {business.rating != null && (
            <View className="absolute top-2.5 right-2.5 flex-row items-center rounded-lg bg-black/55 px-2 py-1">
              <Star size={11} color={colors.brand} fill={colors.brand} />
              <Text className="ml-1 text-xs font-bold text-white">
                {Number(business.rating).toFixed(1).replace(".", ",")}
              </Text>
              {business.reviewCount != null && (
                <Text className="ml-1 text-[10px] text-white/80">({business.reviewCount})</Text>
              )}
            </View>
          )}

          {business.featured && (
            <View className="absolute left-2.5 top-2.5 rounded-full bg-brand px-2.5 py-1">
              <Text className="text-[10px] font-bold text-on-brand">Destaque</Text>
            </View>
          )}
        </View>

        <View className="px-3.5 py-3">
          <Text numberOfLines={1} className="text-sm font-bold text-ink">{business.name}</Text>
          <Text numberOfLines={1} className="mt-0.5 text-xs text-ink-soft">
            {[business.address, business.city].filter(Boolean).join(", ")}
          </Text>

          {(business.distanceKm != null || categoryLabel) && (
            <View className="mt-2 flex-row items-center" style={{ gap: 6 }}>
              {business.distanceKm != null && (
                <View className="rounded-full bg-brand-tint px-2 py-0.5">
                  <Text className="text-[10px] font-medium text-brand-dark">
                    {business.distanceKm.toFixed(1)} km
                  </Text>
                </View>
              )}
              {categoryLabel && (
                <View className="rounded-full bg-surface-alt px-2 py-0.5">
                  <Text className="text-[10px] font-medium text-ink-soft">{categoryLabel}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
