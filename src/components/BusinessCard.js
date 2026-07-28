import { View, Text, TouchableOpacity, Image } from "react-native";
import { Star, Heart, Store } from "lucide-react-native";

export default function BusinessCard({ business, onPress, onFavoritePress, variant = "grid" }) {
  const isHorizontal = variant === "horizontal";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-white rounded-2xl overflow-hidden ${isHorizontal ? "w-56 mr-3" : "flex-1"}`}
      style={{ elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}
    >
      <View className="w-full h-28 bg-neutral-200 items-center justify-center">
        {business.logoUrl ? (
          <Image source={{ uri: business.logoUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Store color="#a3a3a3" size={32} />
        )}

        {business.rating ? (
          <View className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-1 flex-row items-center">
            <Star color="#f59e0b" fill="#f59e0b" size={12} />
            <Text className="text-xs font-bold ml-1">{business.rating.toFixed(1)}</Text>
            {business.reviewsCount ? (
              <Text className="text-xs text-neutral-500 ml-1">({business.reviewsCount})</Text>
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity
          onPress={onFavoritePress}
          className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5"
        >
          <Heart color="#525252" size={14} />
        </TouchableOpacity>
      </View>

      <View className="p-3">
        <Text className="font-semibold text-neutral-900" numberOfLines={1}>
          {business.name}
        </Text>
        <Text className="text-neutral-500 text-xs mt-0.5" numberOfLines={1}>
          {business.address}, {business.city}
        </Text>

        {business.distanceKm != null ? (
          <View className="bg-amber-50 self-start rounded-full px-2 py-0.5 mt-2">
            <Text className="text-amber-700 text-xs font-medium">
              {business.distanceKm < 1
                ? `${Math.round(business.distanceKm * 1000)} m`
                : `${business.distanceKm.toFixed(1)} km`}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}