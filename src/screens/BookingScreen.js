import { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Users } from "lucide-react-native";

import Calendar from "../components/Calendar";

import {
  getBusinessEmployees,
  getBusinessWorkingHours,
  getAvailability,
} from "../services/api";

import { useAuth } from "../contexts/AuthContext";
import { showAlert } from "../services/alert";
import logger from "../services/logger";
import { colors } from "../theme";

function formatDateParam(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function formatPrice(price) {
  return `R$ ${Number(price).toFixed(2).replace(".", ",")}`;
}

function addMinutes(time, minutes) {
  const [h, m] = time.split(":").map(Number);

  const total = h * 60 + m + minutes;

  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");

  return `${hh}:${mm}`;
}

export default function BookingScreen({ navigation, route }) {
  const { businessId, business, service } = route.params;

  const { token } = useAuth();

  const scrollRef = useRef(null);

  const [employees, setEmployees] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);

  const [loadingBase, setLoadingBase] = useState(true);

  // null = qualquer funcionário
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState(null);

  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /*
   * =========================================================
   * CARREGAR FUNCIONÁRIOS E HORÁRIOS
   * =========================================================
   */

  useEffect(() => {
    loadBase();
  }, [businessId, token]);

  async function loadBase() {
    try {
      setLoadingBase(true);

      const [employeesData, hoursData] = await Promise.all([
        getBusinessEmployees(businessId, token),
        getBusinessWorkingHours(businessId, token),
      ]);

      setEmployees(employeesData || []);
      setWorkingHours(hoursData || []);
    } catch (error) {
      logger.error("Erro ao carregar dados do agendamento:", error?.message);

      setEmployees([]);
      setWorkingHours([]);
    } finally {
      setLoadingBase(false);
    }
  }

  /*
   * =========================================================
   * CARREGAR HORÁRIOS DISPONÍVEIS
   * =========================================================
   */

  useEffect(() => {
    setSelectedSlot(null);

    loadSlots();
  }, [selectedDate, selectedEmployee, businessId, service?.id]);

  async function loadSlots() {
    if (!businessId || !service?.id || !selectedDate) {
      return;
    }

    setLoadingSlots(true);

    try {
      const dateParam = formatDateParam(selectedDate);

      const data = await getAvailability(
        businessId,
        dateParam,
        service.id,
        selectedEmployee?.id,
        token
      );

      setSlots(data || []);
    } catch (error) {
      logger.error("Erro ao buscar disponibilidade:", error?.message);

      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  /*
   * =========================================================
   * PRÓXIMA DATA DISPONÍVEL
   * =========================================================
   */

  async function goToNextAvailableDate() {
    let date = new Date(selectedDate);

    for (let i = 0; i < 60; i++) {
      date = new Date(date);

      date.setDate(date.getDate() + 1);

      try {
        const dateParam = formatDateParam(date);

        const data = await getAvailability(
          businessId,
          dateParam,
          service.id,
          selectedEmployee?.id,
          token
        );

        if (data.some((slot) => slot.available)) {
          setSelectedDate(date);

          return;
        }
      } catch (error) {
        logger.error("Erro procurando próxima data:", error?.message);
      }
    }

    showAlert(
      "Sem disponibilidade",
      "Não encontramos horários disponíveis nos próximos dias."
    );
  }

  /*
   * =========================================================
   * DIAS DA SEMANA DISPONÍVEIS
   * =========================================================
   */

  const availableDaysOfWeek = useMemo(() => {
  if (!selectedEmployee) {
    return new Set(workingHours.map((wh) => wh.dayOfWeek));
  }

  const employeeHours = workingHours.filter(
    (wh) => wh.employeeId === selectedEmployee.id
  );

  // Se o funcionário não tem horário próprio, usa o horário geral da empresa
  // (mesma regra de fallback que o backend já aplica)
  const hoursToUse =
    employeeHours.length > 0
      ? employeeHours
      : workingHours.filter((wh) => !wh.employeeId);

  return new Set(hoursToUse.map((wh) => wh.dayOfWeek));
}, [workingHours, selectedEmployee]);

  /*
   * =========================================================
   * VERIFICAR SE EXISTE HORÁRIO
   * =========================================================
   */

  const hasAvailableSlots = slots.some(
    (slot) => slot.available
  );

  /*
   * =========================================================
   * RESERVAR
   * =========================================================
   */

  function handleReserve() {
    if (!selectedSlot) return;

    const appointmentDate =
      `${formatDateParam(selectedDate)}T${selectedSlot.time}:00-03:00`;

    navigation.navigate("BookingConfirmation", {
      businessId,
      business,
      service,

      employee: selectedEmployee,

      notes: notes.trim(),

      appointmentDate,

      dateFormatted:
        selectedDate.toLocaleDateString("pt-BR"),

      timeFormatted: selectedSlot.time,

      endTimeFormatted: addMinutes(
        selectedSlot.time,
        service.durationMinutes
      ),
    });
  }

  /*
   * =========================================================
   * TELA
   * =========================================================
   */

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* HEADER */}

        <View className="flex-row items-center px-5 pt-14 pb-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <ArrowLeft
              color="#0a0a0a"
              size={24}
            />
          </Pressable>

          <Text className="text-xl font-bold text-neutral-950">
            Selecionar Data e Hora
          </Text>
        </View>

        {/* FUNCIONÁRIOS */}

        <View className="px-5 mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: 20,
            }}
          >
            {/* QUALQUER */}

            <Pressable
              onPress={() => setSelectedEmployee(null)}
              className="items-center mr-4"
            >
              <View
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  selectedEmployee === null
                    ? "bg-[#e9e9e9] border-2 border-brand"
                    : "bg-[#e9e9e9]"
                }`}
              >
                <Users
                  color="#a3a3a3"
                  size={24}
                />
              </View>

              <Text className="text-xs font-semibold text-neutral-800 mt-1.5">
                Qualquer
              </Text>
            </Pressable>

            <View
              className="w-[1px] bg-neutral-200 mr-4"
              style={{
                height: 64,
              }}
            />

            {/* FUNCIONÁRIOS */}

            {employees.map((employee) => {
              const isSelected =
                selectedEmployee?.id === employee.id;

              return (
                <Pressable
                  key={employee.id}
                  onPress={() =>
                    setSelectedEmployee(employee)
                  }
                  className="items-center mr-4"
                >
                  <View
                    className={`w-16 h-16 rounded-full items-center justify-center overflow-hidden ${
                      isSelected
                        ? "bg-neutral-300 border-2 border-brand"
                        : "bg-neutral-300"
                    }`}
                  >
                    {employee.photoUrl ? (
                      <Image
                        source={{
                          uri: employee.photoUrl,
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Users
                        color="#a3a3a3"
                        size={24}
                      />
                    )}
                  </View>

                  <Text
                    className="text-xs font-semibold text-neutral-800 mt-1.5"
                    numberOfLines={1}
                    style={{
                      maxWidth: 72,
                    }}
                  >
                    {employee.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="h-[1px] bg-neutral-200 mt-4" />

        {/* CALENDÁRIO */}

        <View className="px-5 mt-5">
          <Calendar
            availableDaysOfWeek={availableDaysOfWeek}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </View>

        {/* HORÁRIOS */}

        {loadingSlots ? (
          <View className="items-center py-8">
            <ActivityIndicator
              color={colors.brandDark}
            />
          </View>
        ) : !hasAvailableSlots ? (
          <View className="items-center px-5 mt-6">
            <View className="w-16 h-16 rounded-full bg-neutral-200 mb-3" />

            <Text className="text-sm font-semibold text-neutral-400 text-center">
              {selectedEmployee
                ? `${selectedEmployee.name} não tem disponibilidade nesta data`
                : "Não há disponibilidade nesta data"}
            </Text>

            <Pressable
              onPress={goToNextAvailableDate}
              className="bg-brand rounded-full px-5 py-2.5 mt-3"
            >
              <Text className="text-on-brand text-xs font-bold">
                Próxima data disponível
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5 mt-2"
            contentContainerStyle={{
              paddingRight: 20,
            }}
          >
            {slots.map((slot) => {
              const isSelected =
                selectedSlot?.time === slot.time;

              if (!slot.available) {
                return (
                  <View
                    key={slot.time}
                    className="mr-3 px-4 py-3"
                  >
                    <Text className="text-sm text-neutral-400">
                      {slot.time}
                    </Text>
                  </View>
                );
              }

              return (
                <Pressable
                  key={slot.time}
                  onPress={() =>
                    setSelectedSlot(slot)
                  }
                  className={`mr-3 px-4 py-3 rounded-xl border-2 ${
                    isSelected
                      ? "bg-brand border-brand"
                      : "bg-white border-brand"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isSelected
                        ? "text-on-brand"
                        : "text-neutral-950"
                    }`}
                  >
                    {slot.time}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* SERVIÇO */}

        <View
          className="mx-5 mt-5 rounded-2xl bg-neutral-200 p-8"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 8,
              height: 4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row justify-between items-start">
            <Text className="text-base font-semibold text-neutral-950">
              {service.name}
            </Text>

            <Text className="text-base font-semibold text-neutral-950">
              {formatPrice(service.price)}
            </Text>
          </View>

          {selectedSlot && (
            <Text className="text-xs text-neutral-600 mt-0.5">
              {selectedSlot.time} -{" "}
              {addMinutes(
                selectedSlot.time,
                service.durationMinutes
              )}
            </Text>
          )}

          <View className="flex-row items-center justify-between mt-4">
            <View className="flex-row items-center">
              <View className="w-7 h-7 rounded-full bg-white items-center justify-center mr-2">
                <Users
                  color={colors.brandDark}
                  size={14}
                />
              </View>

              <Text className="text-sm text-neutral-800">
                Equipe:{" "}
                {selectedSlot?.employeeName ??
                  (selectedEmployee
                    ? selectedEmployee.name
                    : "Qualquer Funcionário")}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                navigation.navigate(
                  "SelectEmployee",
                  {
                    businessId,
                    serviceId: service.id,
                    date: selectedDate.toISOString(),
                    selectedSlotTime:
                      selectedSlot?.time,
                    selectedEmployeeId:
                      selectedEmployee?.id ?? null,
                    onSelect:
                      setSelectedEmployee,
                  }
                )
              }
              className="bg-white rounded-lg px-4 py-2"
            >
              <Text className="text-xs font-bold text-neutral-800">
                Alterar
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ADICIONAR SERVIÇO */}

        <Pressable
          className="px-5 mt-4"
          onPress={() =>
            navigation.navigate("AddService", {
              businessId,

              onSelect: (newService) =>
                showAlert(
                  "Em breve",
                  `Suporte a múltiplos serviços no mesmo agendamento ainda está em construção. Serviço escolhido: ${newService.name}`
                ),
            })
          }
        >
          <Text className="text-sm font-bold text-brand-dark">
            + Adicionar outro serviço
          </Text>
        </Pressable>

        {/* OBSERVAÇÃO */}

        <View className="px-5 mt-6">
          <Text className="text-px6 font-bold text-neutral-800 mb-2">
            Alguma observação ou pedido para sua visita?
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Observação do agendamento"
            placeholderTextColor="#737373"
            multiline
            className="bg-neutral-100 rounded-xl px-4 py-3 text-px-6 text-neutral-800"
            style={{
              minHeight: 90,
              textAlignVertical: "top",
            }}
          />
        </View>
      </ScrollView>

      {/* RODAPÉ */}

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-5 pt-3 pb-8">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-neutral-600">
              {service.durationMinutes}m
            </Text>

            <Text className="text-lg font-bold text-neutral-950">
              {formatPrice(service.price)}
            </Text>
          </View>

          <Pressable
            onPress={handleReserve}
            disabled={
              !selectedSlot || submitting
            }
            className={`rounded-xl px-8 py-3.5 ${
              selectedSlot
                ? "bg-brand"
                : "bg-neutral-300"
            }`}
          >
            <Text className={`font-bold ${selectedSlot ? "text-on-brand" : "text-neutral-500"}`}>
              {submitting
                ? "Reservando..."
                : "Reservar"}
            </Text>
          </Pressable>
        </View>

        <Text className="text-[13px] font-bold text-neutral-800 mt-2">
          Seus dados pessoais serão processados pelo parceiro com o qual você
          está realizando o agendamento.
        </Text>
      </View>
    </View>
  );
}