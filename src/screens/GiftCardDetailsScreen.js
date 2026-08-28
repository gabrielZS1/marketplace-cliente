import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  ScrollView,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";

const CATEGORY_IMAGES = {
  DIAMOND: require("../assets/gift-cards/gift-card-diamond.jpg"),
  GOLD: require("../assets/gift-cards/gift-card-gold.jpg"),
  SILVER: require("../assets/gift-cards/gift-card-silver.jpg"),
};

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}



export default function GiftCardDetailsScreen({ navigation, route }) {
  const [showSummary, setShowSummary] = useState(false);

  const { card, businessName, businessAddress } = route.params;
  const image = CATEGORY_IMAGES[card.category] ?? CATEGORY_IMAGES.SILVER;
  const benefits = card.benefits ?? [];
  const validityLabel = card.validityLabel ?? "—";

  function handleConcluirPedido() {
    setShowSummary(false);
    navigation.navigate("GiftCardCheckout", { card, businessName });
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="flex-row items-center px-5 pt-14 pb-3">
          <Pressable onPress={() => navigation.goBack()} className="p-1">
            <ArrowLeft size={22} color="#111827" strokeWidth={2.5} />
          </Pressable>
          <Text className="flex-1 text-center text-base font-bold text-neutral-900 mr-3">
            Detalhes do cartão
          </Text>
        </View>

        <View className="mx-5 mt-4 rounded-3xl overflow-hidden rounded-2xl" style={{ height: 190 }}>
          <ImageBackground source={image} resizeMode="cover" style={{ flex: 1 }}>
            <View className="flex-1 p-4 justify-between" style={{ backgroundColor: "rgba(0,0,0,0.15)" }}>
              <View className="flex-row justify-between items-start">
                <Text className="text-white text-xs font-semibold opacity-90">Cartão presente</Text>
                <View className="items-end">
                  <Text className="text-white text-[10px] opacity-80">Preço</Text>
                  <Text className="text-white text-sm font-bold">{formatPrice(card.price)}</Text>
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
                  <Text className="text-white text-xs font-semibold">{businessName}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white text-[10px] opacity-80">Valor</Text>
                  <Text className="text-white text-sm font-bold">{formatPrice(card.price)}</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View className="px-5 mt-6">
          {benefits.map((benefit, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <View className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 mr-3" />
              <Text className="flex-1 text-sm text-neutral-700 leading-5">{benefit}</Text>
            </View>
          ))}
        </View>

        <View className="px-5 mt-2">
          <Text className="text-sm font-bold text-neutral-950">Válido para:</Text>
          <Text className="text-sm text-neutral-500 mt-1">
            {card.description || "Todos os serviços e produtos"}
          </Text>
        </View>

        <View className="flex-row items-center px-5 mt-6">
          <View className="w-9 h-9 rounded-full bg-neutral-900 mr-3" />
          <View className="flex-1">
            <Text className="text-sm font-bold text-neutral-950">{businessName}</Text>
            {!!businessAddress && (
              <Text className="text-xs text-neutral-500 mt-0.5">{businessAddress}</Text>
            )}
          </View>
        </View>

        <View className="px-5 mt-5">
          <View className="flex-row justify-between py-3 border-b border-neutral-100">
            <Text className="text-sm text-neutral-500">Preço</Text>
            <Text className="text-sm font-bold text-neutral-950">{formatPrice(card.price)}</Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-neutral-100">
            <Text className="text-sm text-neutral-500">Valor</Text>
            <Text className="text-sm font-bold text-neutral-950">{formatPrice(card.price)}</Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-neutral-100">
            <Text className="text-sm text-neutral-500">Expira após</Text>
            <Text className="text-sm font-bold text-neutral-950">{validityLabel}</Text>
          </View>
        </View>

        <View className="px-5 mt-5">
          <Text className="text-xs text-neutral-400 leading-5 mb-3">
            Os Cartões Presente não são personalizados e podem ser usados por qualquer pessoa com o número do cartão.
          </Text>
          <Text className="text-xs text-neutral-400 leading-5">
            Os Cartões Presente não são de uso único e podem ser usados quantas vezes forem necessárias até que o saldo seja totalmente consumido.
          </Text>
        </View>

        <View className="px-5 mt-6">
          <Pressable
            onPress={() => setShowSummary(true)}
            className="h-14 bg-[#9f7300] rounded-2xl items-center justify-center"
          >
            <Text className="font-bold text-white text-base">Continuar</Text>
          </Pressable>
        </View>
      </ScrollView>

      <SummaryModal
        visible={showSummary}
        onClose={() => setShowSummary(false)}
        image={image}
        card={card}
        businessName={businessName}
        onConcluir={handleConcluirPedido}
      />
    </View>
  );
}

function SummaryModal({ visible, onClose, image, card, businessName, onConcluir }) {
  const [renderModal, setRenderModal] = useState(visible);
  const translateY = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setRenderModal(true);
      translateY.setValue(400);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          mass: 0.9,
          stiffness: 160,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (renderModal) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 400,
          duration: 220,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => setRenderModal(false));
    }
  }, [visible]);

  if (!renderModal) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            opacity: backdropOpacity,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY }],
            minHeight: "60%",
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
          }}
        >
          <View className="flex-row justify-between items-center mb-5">
            <Pressable onPress={onClose}>
              <Text className="text-red-500 font-semibold">Cancelar</Text>
            </Pressable>
            <Text className="font-bold text-base text-neutral-950">Resumo</Text>
            <View style={{ width: 60 }} />
          </View>

          <View className="rounded-2xl overflow-hidden" style={{ height: 130 }}>
            <ImageBackground source={image} resizeMode="cover" style={{ flex: 1 }}>
              <View className="flex-1 p-4 justify-between" style={{ backgroundColor: "rgba(0,0,0,0.15)" }}>
                <View className="flex-row justify-between items-start">
                  <Text className="text-white text-xs opacity-90">Cartão presente</Text>
                  <View className="items-end">
                    <Text className="text-white text-[10px] opacity-80">Valor</Text>
                    <Text className="text-white text-sm font-bold">{formatPrice(card.price)}</Text>
                  </View>
                </View>
                <View>
                  <Text className="text-white text-sm font-bold" numberOfLines={1}>
                    {card.title}
                  </Text>
                  <Text className="text-white text-[11px] opacity-80 mt-0.5">
                    {card.description || "Todos os serviços e produtos"}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-5 h-5 rounded-full bg-white/90 mr-2" />
                  <Text className="text-white text-xs font-semibold">{businessName}</Text>
                </View>
              </View>
            </ImageBackground>
          </View>

          <View className="mt-5">
            <View className="flex-row items-center gap-2">
              <Text className="font-bold text-neutral-950">Detalhes do pagamento</Text>
              <View className="bg-red-50 rounded-full px-2 py-0.5">
                <Text className="text-red-500 text-[10px] font-bold">Pagamento fora da Glowly</Text>
              </View>
            </View>
            <Text className="text-xs text-neutral-500 mt-2 leading-5">
              Entre em contato diretamente com o comerciante para concluir o pagamento deste cartão presente.
            </Text>
          </View>

          <View className="mt-auto pt-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-neutral-500">Total</Text>
              <Text className="font-bold text-lg text-neutral-950">{formatPrice(card.price)}</Text>
            </View>
            <Pressable
              onPress={onConcluir}
              className="bg-[#9f7300] h-14 rounded-2xl items-center justify-center"
            >
              <Text className="font-bold text-white text-base">Concluir pedido</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}