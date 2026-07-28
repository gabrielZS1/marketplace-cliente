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
    createAppointment,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { showAlert } from "../services/alert";

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
    const { businessId, service } = route.params;
    const { token } = useAuth();
    const scrollRef = useRef(null);

    const [employees, setEmployees] = useState([]);
    const [workingHours, setWorkingHours] = useState([]);
    const [loadingBase, setLoadingBase] = useState(true);

    const [selectedEmployee, setSelectedEmployee] = useState(null); // null = "Qualquer"
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null); // { time, employeeId, employeeName }
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadBase();
    }, []);

    useEffect(() => {
        setSelectedSlot(null);
        loadSlots();
    }, [selectedDate, selectedEmployee]);

    async function loadBase() {
        try {
            const [employeesData, hoursData] = await Promise.all([
                getBusinessEmployees(businessId),
                getBusinessWorkingHours(businessId),
            ]);
            setEmployees(employeesData);
            setWorkingHours(hoursData);
        } catch (error) {
            console.log(error.message);
        } finally {
            setLoadingBase(false);
        }
    }

    async function loadSlots() {
        setLoadingSlots(true);
        try {
            const data = await getAvailability(
                businessId,
                formatDateParam(selectedDate),
                service.id,
                selectedEmployee?.id
            );
            setSlots(data);
        } catch (error) {
            console.log(error.message);
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }

    async function goToNextAvailableDate() {
        let date = new Date(selectedDate);
        for (let i = 0; i < 60; i++) {
            date = new Date(date);
            date.setDate(date.getDate() + 1);
            try {
                const data = await getAvailability(businessId, formatDateParam(date), service.id, selectedEmployee?.id);
                if (data.some((s) => s.available)) {
                    setSelectedDate(date);
                    return;
                }
            } catch {
                // segue tentando
            }
        }
        showAlert("Sem disponibilidade", "Não encontramos horários nos próximos dias.");
    }

    const availableDaysOfWeek = useMemo(() => {
        const filtered = selectedEmployee
            ? workingHours.filter((wh) => wh.employeeId === selectedEmployee.id)
            : workingHours;
        return new Set(filtered.map((wh) => wh.dayOfWeek));
    }, [workingHours, selectedEmployee]);

    const hasAvailableSlots = slots.some((s) => s.available);

    async function handleReserve() {
        if (!selectedSlot) return;

        const startsAt = `${formatDateParam(selectedDate)}T${selectedSlot.time}:00-03:00`;

        setSubmitting(true);
        try {
            await createAppointment(token, {
                employeeId: selectedSlot.employeeId,
                serviceId: service.id,
                startsAt,
                isHomeService: false,
                notes,
            });

            showAlert("Agendamento confirmado! 💈", "", () => navigation.navigate("MainTabs", { screen: "Agendamentos" }));
        } catch (error) {
            showAlert("Não foi possível agendar", error.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingBase) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator color="#9f7300" size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                {/* Header */}
                <View className="flex-row items-center px-5 pt-14 pb-2">
                    <Pressable onPress={() => navigation.goBack()} className="mr-4">
                        <ArrowLeft color="#0a0a0a" size={24} />
                    </Pressable>
                    <Text className="text-xl font-bold text-neutral-950">Selecionar Data e Hora</Text>
                </View>

                {/* Seleção de profissional */}
                <View className="px-5 mt-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                        <Pressable onPress={() => setSelectedEmployee(null)} className="items-center mr-4">
                            <View
                                className={`w-16 h-16 rounded-full items-center justify-center ${selectedEmployee === null ? "bg-[#e9e9e9] border-2 border-[#9f7300]" : "bg-[#e9e9e9]"
                                    }`}
                            >
                                <Users color="#a3a3a3" size={24} />
                            </View>
                            <Text className="text-xs font-semibold text-neutral-800 mt-1.5">Qualquer</Text>
                        </Pressable>

                        <View className="w-[1px] bg-neutral-200 mr-4" style={{ height: 64 }} />

                        {employees.map((employee) => {
                            const isSelected = selectedEmployee?.id === employee.id;
                            return (
                                <Pressable key={employee.id} onPress={() => setSelectedEmployee(employee)} className="items-center mr-4">
                                    <View
                                        className={`w-16 h-16 rounded-full items-center justify-center overflow-hidden ${isSelected ? "bg-neutral-300 border-2 border-[#9f7300]" : "bg-neutral-300"
                                            }`}
                                    >
                                        {employee.photoUrl ? (
                                            <Image source={{ uri: employee.photoUrl }} className="w-full h-full" resizeMode="cover" />
                                        ) : null}
                                    </View>
                                    <Text className="text-xs font-semibold text-neutral-800 mt-1.5" numberOfLines={1} style={{ maxWidth: 72 }}>
                                        {employee.name}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                <View className="h-[1px] bg-neutral-400 mt-4" />

                {/* Calendário */}
                <View className="px-5 mt-5">
                    <Calendar
                        availableDaysOfWeek={availableDaysOfWeek}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                    />
                </View>

                {/* Horários ou estado vazio */}
                {loadingSlots ? (
                    <View className="items-center py-8">
                        <ActivityIndicator color="#9f7300" />
                    </View>
                ) : !hasAvailableSlots ? (
                    <View className="items-center px-5 mt-6">
                        <View className="w-16 h-16 rounded-full bg-neutral-200 mb-3" />
                        <Text className="text-sm font-semibold text-neutral-400 text-center">
                            {selectedEmployee
                                ? `${selectedEmployee.name} não tem disponibilidade nesta data`
                                : "Não há disponibilidade nesta data"}
                        </Text>
                        <Pressable onPress={goToNextAvailableDate} className="bg-[#9f7300] rounded-full px-5 py-2.5 mt-3">
                            <Text className="text-white text-xs font-bold">Próxima data disponível</Text>
                        </Pressable>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mt-2" contentContainerStyle={{ paddingRight: 20 }}>
                        {slots.map((slot) => {
                            const isSelected = selectedSlot?.time === slot.time;

                            if (!slot.available) {
                                return (
                                    <View key={slot.time} className="mr-3 px-4 py-3">
                                        <Text className="text-sm text-neutral-400">{slot.time}</Text>
                                    </View>
                                );
                            }

                            return (
                                <Pressable
                                    key={slot.time}
                                    onPress={() => setSelectedSlot(slot)}
                                    className={`mr-3 px-4 py-3 rounded-xl border-2 ${isSelected ? "bg-[#9f7300] border-[#9f7300]" : "bg-white border-[#d4af37]"
                                        }`}
                                >
                                    <Text className={`text-sm font-bold ${isSelected ? "text-white" : "text-neutral-950"}`}>
                                        {slot.time}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Resumo do serviço */}
                <View className="mx-5 mt-5 bg-neutral-400 rounded-2xl p-4">
                    <View className="flex-row justify-between items-start">
                        <Text className="text-base font-semibold text-neutral-950">{service.name}</Text>
                        <Text className="text-base font-semibold text-neutral-950">{formatPrice(service.price)}</Text>
                    </View>
                    {selectedSlot && (
                        <Text className="text-xs text-neutral-600 mt-0.5">
                            {selectedSlot.time} - {addMinutes(selectedSlot.time, service.durationMinutes)}
                        </Text>
                    )}

                    <View className="flex-row items-center justify-between mt-4">
                        <View className="flex-row items-center">
                            <View className="w-7 h-7 rounded-full bg-white items-center justify-center mr-2">
                                <Users color="#9f7300" size={14} />
                            </View>
                            <Text className="text-sm text-neutral-800">
                                Equipe: {selectedSlot?.employeeName ?? (selectedEmployee ? selectedEmployee.name : "Qualquer Funcionário")}
                            </Text>
                        </View>
                        <Pressable
                            onPress={() =>
                                navigation.navigate("SelectEmployee", {
                                    businessId,
                                    serviceId: service.id,
                                    date: selectedDate.toISOString(),
                                    selectedSlotTime: selectedSlot?.time,
                                    selectedEmployeeId: selectedEmployee?.id ?? null,
                                    onSelect: setSelectedEmployee,
                                })
                            }
                            className="bg-white rounded-lg px-4 py-2"
                        >
                            <Text className="text-xs font-bold text-neutral-800">Alterar</Text>
                        </Pressable>
                    </View>
                </View>

                <Pressable
                    className="px-5 mt-4"
                    onPress={() =>
                        navigation.navigate("AddService", {
                            businessId,
                            onSelect: (newService) => showAlert("Em breve", `Suporte a múltiplos serviços no mesmo agendamento ainda está em construção. Serviço escolhido: ${newService.name}`),
                        })
                    }
                >
                    <Text className="text-sm font-bold text-[#9f7300]">+ Adicionar outro serviço</Text>
                </Pressable>

                {/* Observação */}
                <View className="px-5 mt-6">
                    <Text className="text-sm font-bold text-neutral-950 mb-2">Alguma observação ou pedido para sua visita?</Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Observação do agendamento"
                        placeholderTextColor="#737373"
                        multiline
                        className="bg-neutral-100 rounded-xl px-4 py-3 text-sm text-neutral-800"
                        style={{ minHeight: 60, textAlignVertical: "top" }}
                    />
                </View>
            </ScrollView>

            {/* Barra fixa inferior */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-600 px-5 pt-3 pb-8">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-xs text-neutral-600">{service.durationMinutes}m</Text>
                        <Text className="text-lg font-bold text-neutral-950">{formatPrice(service.price)}</Text>
                    </View>
                    <Pressable
                        onPress={handleReserve}
                        disabled={!selectedSlot || submitting}
                        className={`rounded-xl px-8 py-3.5 ${selectedSlot ? "bg-[#9f7300]" : "bg-neutral-5w00"}`}
                    >
                        <Text className="text-white font-bold">{submitting ? "Reservando..." : "Reservar"}</Text>
                    </Pressable>
                </View>
                <Text className="text-[10px] font-bold text-neutral-800 mt-2">
                    Seus dados pessoais serão processados pelo parceiro com o qual você está realizando o agendamento.
                </Text>
            </View>
        </View>
    );
}