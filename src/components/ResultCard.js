import { View, Text, Pressable, Image } from "react-native";
import { Star, Scissors, Info } from "lucide-react-native";

export default function ResultCard({ business, onPress }) {
  return (
    <Pressable onPress={onPress} className="mb-6">
      <View className="rounded-2xl overflow-hidden bg-neutral-300" style={{ height: 160 }}>
        {business.logoUrl ? (
          <Image source={{ uri: business.logoUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-neutral-300">
            <Text className="text-xs text-neutral-500">Sem imagem</Text>
          </View>
        )}

        {business.rating != null && (
          <View className="absolute top-3 right-3 bg-black/55 rounded-xl px-3 py-1.5 items-center">
            <Text className="text-white text-base font-bold">
              {Number(business.rating).toFixed(1).replace(".", ",")}
            </Text>
            {business.reviewCount != null && (
              <Text className="text-white text-[10px]">{business.reviewCount} avaliações</Text>
            )}
          </View>
        )}
      </View>

      <Text className="text-base font-bold text-neutral-950 mt-3">{business.name}</Text>

      <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={2}>
        {business.distanceKm != null && `${business.distanceKm.toFixed(1)} km · `}
        {business.address}, {business.city}-{business.state}
      </Text>

      <View className="flex-row items-center mt-2">
        <Scissors size={14} color="#525252" />
      </View>

      {business.featured && (
        <View className="flex-row items-center mt-1">
          <Text className="text-xs font-bold text-neutral-800">Destaque</Text>
          <Info size={12} color="#737373" className="ml-1" />
        </View>
      )}
    </Pressable>
  );
}