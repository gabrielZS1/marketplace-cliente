import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ImageBackground,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { getBusinessGiftCards } from "../services/api";
import { colors } from "../theme";
import logger from "../services/logger";

import { GiftCardListSkeleton } from "../components/skeletons";


const CATEGORY_IMAGES = {
  DIAMOND: require("../assets/gift-cards/gift-card-diamond.jpg"),
  GOLD: require("../assets/gift-cards/gift-card-gold.jpg"),
  SILVER: require("../assets/gift-cards/gift-card-silver.jpg"),
};

function formatPrice(value) {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

function GiftCardItem({ card, businessId, businessName, businessAddress, navigation }) {
  const image = CATEGORY_IMAGES[card.category] ?? CATEGORY_IMAGES.SILVER;

  return (
    <Pressable
      className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{ height: 200 }}
      onPress={() =>
        navigation.navigate("GiftCardsDetail", {
          card,
          businessId,
          businessName,
          businessAddress,
        })
      }
    >
      {" "}
      <ImageBackground source={image} resizeMode="cover" style={{ flex: 1 }}>
        <View className="flex-1 p-4 justify-between">
          <View className="flex-row justify-between items-start">
            <Text className="text-white text-xs font-semibold opacity-90">
              Cartão presente
            </Text>
            <View className="items-end">
              <Text className="text-white text-[10px] opacity-80">Preço</Text>
              <Text className="text-white text-sm font-bold">
                {formatPrice(card.price)}
              </Text>
            </View>
          </View>

          <View>
            <Text className="text-white text-lg font-bold" numberOfLines={1}>
              {card.title}
            </Text>
            <Text className="text-white text-[11px] opacity-80 mt-0.5">
              {card.description || "Todos os serviços e produtos"}
            </Text>
          </View>

          <View className="flex-row justify-between items-end">
            <View className="flex-row items-center">
              <View className="w-6 h-6 rounded-full bg-white/90 mr-2" />
              <Text className="text-white text-xs font-semibold">
                {businessName}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white text-[10px] opacity-80">Valor</Text>
              <Text className="text-white text-sm font-bold">
                {formatPrice(card.price)}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

export default function GiftCardScreen({ navigation, route }) {
  const { businessId, businessName, businessAddress } = route.params;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  

  async function loadCards() {
    setLoading(true);
    try {
      const data = await getBusinessGiftCards(businessId);
      setCards(data);
    } catch (error) {
      logger.error("Erro ao carregar cartões de presente:", error?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-neutral-100">
        <Pressable onPress={() => navigation.goBack()} className="p-1 mr-3">
          <ArrowLeft size={22} color="#0a0a0a" strokeWidth={2.5} />
        </Pressable>
        <Text
          className="text-base font-bold text-neutral-950 flex-1"
          numberOfLines={1}
        >
          {businessName}
        </Text>
      </View>

      <Text className="px-5 pt-4 pb-3 text-lg font-bold text-neutral-950">
        Escolha seu cartão
      </Text>

      {loading ? (
        <GiftCardListSkeleton />
      ) : cards.length === 0 ? (
        <View
          className="flex-1 items-center justify-center px-5"
          style={{ paddingBottom: 80 }}
        >
          <Text className="text-sm text-neutral-400">
            Ainda não há cartões de presente disponíveis.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {cards.map((card) => (
            <GiftCardItem
              key={card.id}
              card={card}
              businessId={businessId}
              businessName={businessName}
              businessAddress={businessAddress}
              navigation={navigation}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
