import { useState } from "react";
import { View, Text, TextInput, Pressable, Image, ScrollView } from "react-native";
import { ArrowLeft, Star, Camera, X } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { createReview } from "../services/api";
import { showAlert } from "../services/alert";
import { useImagePicker } from "../hooks/useImagePicker";
import LoadingScreen from "../components/LoadingScreen";
import { colors } from "../theme";

export default function CreateReviewScreen({ navigation, route }) {
  const { appointmentId, businessName, serviceName, employeeName } = route.params;
  const { token } = useAuth();
  const { pickImage } = useImagePicker();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handlePickPhoto() {
    const uri = await pickImage();
    if (uri) setPhotoUri(uri);
  }

  async function handleSubmit() {
    if (rating === 0) {
      showAlert("Atenção", "Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setLoading(true);

    try {
      await createReview(token, appointmentId, rating, comment, photoUri);
      showAlert("Sucesso", "Avaliação enviada!", () => navigation.goBack());
    } catch (error) {
      showAlert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pt-14 pb-4">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-alt"
        >
          <ArrowLeft size={20} color="#0a0a0a" strokeWidth={2.5} />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-950 ml-3">Avaliar atendimento</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}>
        <Text className="text-sm text-neutral-500">
          {serviceName} — {businessName}
        </Text>
        {!!employeeName && (
          <Text className="text-xs text-neutral-400 mt-0.5">Com {employeeName}</Text>
        )}

        <Text className="text-base font-bold text-neutral-950 mt-6 mb-3">Sua nota</Text>
        <View className="flex-row" style={{ gap: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)}>
              <Star
                size={32}
                color={colors.brand}
                fill={star <= rating ? colors.brand : "transparent"}
                strokeWidth={1.5}
              />
            </Pressable>
          ))}
        </View>

        <Text className="text-base font-bold text-neutral-950 mt-6 mb-3">Comentário</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Conte como foi sua experiência..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          className="border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900"
          style={{ color: "#171717", textAlignVertical: "top", minHeight: 100 }}
        />

        <Text className="text-base font-bold text-neutral-950 mt-6 mb-3">Foto (opcional)</Text>

        {photoUri ? (
          <View className="relative self-start">
            <Image source={{ uri: photoUri }} className="w-28 h-28 rounded-xl" />
            <Pressable
              onPress={() => setPhotoUri(null)}
              className="absolute -top-2 -right-2 bg-black rounded-full p-1"
            >
              <X size={14} color="white" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handlePickPhoto}
            className="w-28 h-28 rounded-xl border border-dashed border-neutral-300 items-center justify-center"
          >
            <Camera size={22} color="#9CA3AF" />
            <Text className="text-[10px] text-neutral-400 mt-1">Adicionar</Text>
          </Pressable>
        )}

        <Pressable
          onPress={handleSubmit}
          className="bg-brand rounded-2xl h-14 items-center justify-center mt-8 mb-10"
        >
          <Text className="text-on-brand text-base font-bold">Enviar avaliação</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}