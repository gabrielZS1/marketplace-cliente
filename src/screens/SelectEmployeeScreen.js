import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { ArrowLeft, Check, ChevronRight, Star, Users } from "lucide-react-native";
import { getBusinessEmployees, getAvailability } from "../services/api";
import { colors } from "../theme";
import logger from "../services/logger";

import { EmployeeListSkeleton } from "../components/skeletons";

function formatDateParam(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function SelectEmployeeScreen({ navigation, route }) {
  const { businessId, serviceId, date, selectedSlotTime, selectedEmployeeId, onSelect } = route.params;

  const [employees, setEmployees] = useState([]);
  const [statusByEmployee, setStatusByEmployee] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  

  async function loadData() {
    try {
      const employeesData = await getBusinessEmployees(businessId);
      setEmployees(employeesData);

      const dateParam = formatDateParam(new Date(date));
      const statuses = {};

      await Promise.all(
        employeesData.map(async (employee) => {
          try {
            const slots = await getAvailability(businessId, dateParam, serviceId, employee.id);
            const availableSlots = slots.filter((s) => s.available);

            if (availableSlots.length === 0) {
              statuses[employee.id] = { type: "unavailable" };
              return;
            }

            const matchesCurrentTime = selectedSlotTime && availableSlots.some((s) => s.time === selectedSlotTime);
            if (matchesCurrentTime) {
              statuses[employee.id] = { type: "available" };
            } else {
              statuses[employee.id] = { type: "later", time: availableSlots[0].time };
            }
          } catch {
            statuses[employee.id] = { type: "unavailable" };
          }
        })
      );

      setStatusByEmployee(statuses);
    } catch (error) {
      logger.error("Erro ao carregar equipe:", error?.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(employee) {
    onSelect(employee);
    navigation.goBack();
  }

  function renderStatus(employeeId) {
    const status = statusByEmployee[employeeId];
    if (!status) return null;

    if (status.type === "available") {
      return <Text className="text-xs font-semibold text-green-600 mt-0.5">Disponível</Text>;
    }
    if (status.type === "later") {
      return <Text className="text-xs font-semibold text-orange-600 mt-0.5">Disponível às {status.time}</Text>;
    }
    return <Text className="text-xs font-semibold text-neutral-400 mt-0.5">Sem disponibilidade nesta data</Text>;
  }

  return (
    <View className="flex-1 bg-white pt-14 px-5">
      <Pressable onPress={() => navigation.goBack()} className="mb-6">
        <ArrowLeft color="#0a0a0a" size={24} />
      </Pressable>

      <Text className="text-2xl font-bold text-neutral-950 mb-6">Selecionar membro da equipe</Text>

      {loading ? (
        <EmployeeListSkeleton />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={() => handleSelect(null)}
            className="flex-row items-center py-4 border-b border-neutral-100"
          >
            <View
              className={`w-12 h-12 rounded-full bg-brand-tint items-center justify-center ${selectedEmployeeId == null ? "border-2 border-brand" : ""
                }`}
            >
              <Users color={colors.brandDark} size={20} />
            </View>
            <Text className="flex-1 ml-3 text-base font-semibold text-neutral-950">
              Sem preferência de equipe
            </Text>
            {selectedEmployeeId == null && <Check color={colors.brandDark} size={20} />}
          </Pressable>

          {employees.map((employee) => {
            const isSelected = selectedEmployeeId === employee.id;
            return (
              <Pressable
                key={employee.id}
                onPress={() => handleSelect(employee)}
                className="flex-row items-center py-4 border-b border-neutral-100"
              >
                <View className="relative">
                  <View
                    className={`w-12 h-12 rounded-full bg-neutral-300 overflow-hidden items-center justify-center ${isSelected ? "border-2 border-brand" : ""
                      }`}
                  >
                    {employee.photoUrl ? (
                      <Image source={{ uri: employee.photoUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : null}
                  </View>
                  {employee.rating != null && (
                    <View className="absolute -bottom-1 -left-1 flex-row items-center bg-brand-tint rounded-full px-1.5 py-0.5">
                      <Star color={colors.brandDark} fill={colors.brandDark} size={8} />
                      <Text className="text-[9px] font-bold text-brand-dark ml-0.5">
                        {employee.rating.toFixed(1).replace(".", ",")}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-1 ml-4">
                  <Text className="text-base font-semibold text-neutral-950">{employee.name}</Text>
                  {renderStatus(employee.id)}
                </View>

                {isSelected ? (
                  <Check color={colors.brandDark} size={20} />
                ) : (
                  <ChevronRight color="#a3a3a3" size={20} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}