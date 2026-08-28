import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";

import { ArrowLeft } from "lucide-react-native";
import { createAppointment, getBusinessById } from "../services/api";

export default function BookingConfirmationScreen({ route, navigation }) {
  console.log("PARAMS RECEBIDOS:", route.params);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const {
    businessId,
    service,
    employee,
    appointmentDate,
    dateFormatted,
    timeFormatted,
    endTimeFormatted,
  } = route.params;

  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await getBusinessById(businessId);
        setBusiness(data);
      } catch (error) {
        console.log(error);
      }
    }

    if (businessId) {
      loadBusiness();
    }
  }, [businessId]);

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `R$ ${num.toFixed(2).replace(".", ",")}`;
  };

  const employeeName = employee?.name ?? "Qualquer profissional";
  const servicePriceFormatted = formatCurrency(service?.price);

  async function handleConfirmBooking() {
    console.log("========== AUTH DEBUG ==========");
    console.log("TOKEN EXISTE:", !!token);
    console.log("TOKEN:", token ? "TEM TOKEN" : "SEM TOKEN");
    console.log("TOKEN TAMANHO:", token?.length);
    console.log("================================");

    const payload = {
      serviceId: service?.id,
      employeeId: employee?.id ?? null,
      startsAt: appointmentDate,
    };

    console.log("PAYLOAD:", payload);

    setLoading(true);

    try {
      await createAppointment(payload, token);

      navigation.replace("BookingPending", {
        businessName: business?.name,
        dateFormatted,
        timeFormatted,
      });
    } catch (error) {
      console.error("Erro ao agendar:", error);

      Alert.alert(
        "Erro no Agendamento",
        "Não foi possível confirmar seu agendamento. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white pt-12 px-6">
      <Pressable
        onPress={() => navigation.goBack()}
        className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-100"
      >
        <ArrowLeft size={28} color="#000000" strokeWidth={2.5} />
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      >
        <Text className="mt-4 text-2xl font-bold text-black tracking-tight">
          Avaliação e Confirmação
        </Text>

        <Text className="mt-2 text-sm font-medium text-neutral-800">
          {dateFormatted} • {timeFormatted}
        </Text>

        <Text className="mt-1 text-xs text-neutral-500 leading-4">
          {business?.name}
          {business?.address ? ` • ${business.address}` : ""}
        </Text>

        <View
          className="mt-6 rounded-3xl bg-[#dbdbdb] p-8"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 8, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row justify-between items-start">
            <Text className="text-base font-bold text-neutral-900 flex-1 mr-2">
              {service?.name}
            </Text>
            <Text className="text-base font-bold text-neutral-900">
              {servicePriceFormatted}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-xs text-neutral-700">
              Funcionário: {employeeName}
            </Text>
            <Text className="text-xs text-neutral-600">
              {timeFormatted} - {endTimeFormatted}
            </Text>
          </View>

          <View className="my-3 border-b border-black/15" />

          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-semibold text-neutral-800">
              Subtotal
            </Text>
            <Text className="text-base font-bold text-neutral-900">
              {servicePriceFormatted}
            </Text>
          </View>
        </View>

        <View className="flex-1 min-h-[120px]" />

        <View className="rounded-2xl bg-[#D8BE7A] p-6 mb-4">
          <Text className="text-sm font-bold text-neutral-950">
            Garanta sua vaga agora, pague depois
          </Text>
          <Text className="mt-1 text-xs text-neutral-800 leading-4">
            Confirme seu agendamento agora e pague quando o serviço estiver
            concluído.
          </Text>
        </View>

        <Pressable
          onPress={handleConfirmBooking}
          disabled={loading}
          className="w-full rounded-xl bg-[#bd9020] py-3.5 items-center justify-center active:opacity-90"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-bold text-white">
              Confirmar e agendar
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
