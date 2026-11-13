import { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Scissors } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { listMyAppointments, cancelAppointment } from "../services/api";
import { showAlert, showConfirm } from "../services/alert";
import { withEffectiveStatus, isUpcoming } from "../utils/appointmentStatus";
import { colors } from "../theme";

import { AppointmentListSkeleton } from "../components/skeletons";
import logger from "../services/logger";

const STATUS_LABELS = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  NO_SHOW: "Não compareceu",
};

function AppointmentCard({ appointment, onBookAgain, onReview, onCancel }) {
  const date = new Date(appointment.startsAt);
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  const day = date.getDate();
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const status = appointment.status;
  const canCancel = status === "PENDING" || status === "CONFIRMED";
  const canReview = status === "COMPLETED";
  const canRebook = status === "COMPLETED" || status === "CANCELLED" || status === "NO_SHOW";

  return (
    <View className="bg-[#f3f3f3] rounded-2xl p-4 mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <View className="self-start bg-surface-alt rounded-full px-2.5 py-1 mb-2">
            <Text className="text-[10px] font-bold text-ink-soft">
              {STATUS_LABELS[status] ?? status}
            </Text>
          </View>

          <Text className="text-base font-bold text-neutral-950">{appointment.serviceName}</Text>
          <Text className="text-xs text-neutral-500 mt-0.5">Com {appointment.employeeName}</Text>

          <View className="flex-row items-center mt-2">
            <View className="w-2 h-2 rounded-full bg-neutral-950 mr-2" />
            <Text className="text-xs text-neutral-700">Na {appointment.businessName}</Text>
          </View>

          {(canCancel || canRebook || canReview) && (
            <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
              {canRebook && (
                <Pressable
                  onPress={() => onBookAgain(appointment)}
                  className="bg-brand rounded-lg px-4 py-2.5 self-start"
                >
                  <Text className="text-on-brand text-xs font-bold">Reservar novamente</Text>
                </Pressable>
              )}

              {canReview && (
                <Pressable
                  onPress={() => onReview(appointment)}
                  className="border border-brand-dark rounded-lg px-4 py-2.5 self-start"
                >
                  <Text className="text-brand-dark text-xs font-bold">Avaliar</Text>
                </Pressable>
              )}

              {canCancel && (
                <Pressable
                  onPress={() => onCancel(appointment)}
                  className="border border-neutral-300 rounded-lg px-4 py-2.5 self-start"
                >
                  <Text className="text-neutral-700 text-xs font-bold">Cancelar reserva</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        <View className="items-end">
          <Text className="text-xs text-neutral-500 capitalize">{month}</Text>
          <Text className="text-2xl font-bold text-neutral-950">{day}</Text>
          <Text className="text-xs text-neutral-500">{time}</Text>
        </View>
      </View>
    </View>
  );
}

export default function AppointmentsScreen({ navigation }) {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [token])
  );

  async function loadAppointments() {
    try {
      const data = await listMyAppointments(token);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error("Erro ao carregar agendamentos:", error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleReview(appointment) {
    navigation.navigate("CreateReview", {
      appointmentId: appointment.id,
      businessName: appointment.businessName,
      serviceName: appointment.serviceName,
      employeeName: appointment.employeeName,
    });
  }

  function handleBookAgain(appointment) {
    navigation.navigate("BusinessDetail", { businessId: appointment.businessId });
  }

  function handleCancel(appointment) {
    showConfirm(
      "Cancelar reserva",
      `Cancelar ${appointment.serviceName} na ${appointment.businessName}? Essa ação não pode ser desfeita.`,
      async () => {
        try {
          await cancelAppointment(appointment.id, token);
          await loadAppointments();
        } catch (error) {
          showAlert("Não foi possível cancelar", error?.message || "Tente novamente.");
        }
      },
      "Cancelar reserva",
      "Manter"
    );
  }

  // O status é ajustado pela data: reserva que já passou vai para "finalizadas".
  const { upcoming, finished } = useMemo(() => {
    const items = appointments.map((a) => withEffectiveStatus(a));
    return {
      upcoming: items
        .filter(isUpcoming)
        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
      finished: items
        .filter((a) => !isUpcoming(a))
        .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt)),
    };
  }, [appointments]);

  if (loading) {
    return (
      <View className="flex-1 bg-white px-6">
        <Text className="text-2xl font-bold text-neutral-950 mt-14 mb-6">Agendamentos</Text>
        <AppointmentListSkeleton />
      </View>
    );
  }

  return (
    <FlatList
      data={finished}
      keyExtractor={(item) => item.id}
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadAppointments();
          }}
          tintColor={colors.brandDark}
        />
      }
      ListHeaderComponent={
        <View>
          <Text className="text-2xl font-bold text-neutral-950 mt-14 mb-6">Agendamentos</Text>

          {upcoming.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-bold text-neutral-500 mb-3">Próximos</Text>
              {upcoming.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onBookAgain={handleBookAgain}
                  onReview={handleReview}
                  onCancel={handleCancel}
                />
              ))}
            </View>
          )}

          <Text className="text-sm font-bold text-neutral-500 mb-3">Reservas finalizadas</Text>
        </View>
      }
      renderItem={({ item }) => (
        <AppointmentCard
          appointment={item}
          onBookAgain={handleBookAgain}
          onReview={handleReview}
          onCancel={handleCancel}
        />
      )}
      ListEmptyComponent={
        <View className="items-center mt-6">
          <Scissors color={colors.inkFaint} size={40} />
          <Text className="text-neutral-400 text-sm mt-3">Nenhum agendamento finalizado ainda.</Text>
        </View>
      }
    />
  );
}
