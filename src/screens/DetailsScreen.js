import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image, Linking, ActivityIndicator } from "react-native";
import { ArrowLeft, Share2, Heart, ExternalLink, Copy, Car, PawPrint, Wifi, ChevronRight } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { getBusinessById, getBusinessEmployees, getBusinessWorkingHours, reportContent } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { showAlert, showSuccess } from "../services/alert";
import ReportSheet from "../components/ReportSheet";

import { DetailsSkeleton } from "../components/skeletons";
import SocialLinks from "../components/SocialLinks";
import { getSocialLinks } from "../utils/social";
import logger from "../services/logger";


const DAY_LABELS = {
    MONDAY: "Segunda-feira",
    TUESDAY: "Terça-feira",
    WEDNESDAY: "Quarta-feira",
    THURSDAY: "Quinta-feira",
    FRIDAY: "Sexta-feira",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function formatTime(t) {
    if (!t) return "";
    return t.slice(0, 5);
}

export default function DetailsScreen({ navigation, route }) {
    const { businessId, businessName } = route.params;
    const [business, setBusiness] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [workingHours, setWorkingHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const [reportOpen, setReportOpen] = useState(false);
    const [reporting, setReporting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function submitReport(reason) {
        if (reporting) return;
        setReporting(true);
        try {
            await reportContent(token, { targetType: "BUSINESS", targetId: businessId, reason });
            setReportOpen(false);
            showSuccess("Denúncia enviada", "Obrigado! Nossa equipe vai analisar em até 24 horas.");
        } catch (error) {
            setReportOpen(false);
            showAlert("Não foi possível denunciar", error?.message || "Tente novamente.");
        } finally {
            setReporting(false);
        }
    }

    if (loading) {
        return (
            <View className="flex-1 bg-white">
                <View className="flex-row items-center justify-between px-4 pt-12 pb-3 border-b border-neutral-100">
                    <Pressable onPress={() => navigation.goBack()} className="p-1">
                        <ArrowLeft size={22} color="#0a0a0a" strokeWidth={2.5} />
                    </Pressable>
                    <Text className="text-base font-bold text-neutral-950 flex-1 text-center mx-2" numberOfLines={1}>
                        {businessName}
                    </Text>
                    <View style={{ width: 52 }} />
                </View>
                <DetailsSkeleton />
            </View>
        );
    }

    async function loadData() {
        setLoading(true);
        try {
            const [businessData, employeesData, hoursData] = await Promise.all([
                getBusinessById(businessId),
                getBusinessEmployees(businessId).catch(() => []),
                getBusinessWorkingHours(businessId).catch(() => []),
            ]);
            setBusiness(businessData);
            setEmployees(employeesData ?? []);
            setWorkingHours(hoursData ?? []);
        } catch (error) {
            logger.error("Erro ao carregar detalhes:", error?.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCopyPhone() {
        if (!business?.phone) return;
        await Clipboard.setStringAsync(business.phone);
    }

    function openInMaps() {
        if (!business?.latitude || !business?.longitude) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
        Linking.openURL(url);
    }

    const sortedHours = [...workingHours].sort(
        (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
    );

    

    const mapUrl = business.latitude && business.longitude
        ? `https://staticmap.openstreetmap.de/staticmap.php?center=${business.latitude},${business.longitude}&zoom=15&size=600x300&markers=${business.latitude},${business.longitude},red-pushpin`
        : null;

        

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 pt-12 pb-3 border-b border-neutral-100">
                <Pressable onPress={() => navigation.goBack()} className="p-1">
                    <ArrowLeft size={22} color="#0a0a0a" strokeWidth={2.5} />
                </Pressable>
                <Text className="text-base font-bold text-neutral-950 flex-1 text-center mx-2" numberOfLines={1}>
                    {businessName}
                </Text>
                <View className="flex-row items-center gap-3">
                    <Pressable className="p-1">
                        <Share2 size={20} color="#0a0a0a" strokeWidth={2} />
                    </Pressable>
                    <Pressable className="p-1">
                        <Heart size={20} color="#e53935" fill="#e53935" strokeWidth={2} />
                    </Pressable>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {mapUrl && (
                    <View className="relative">
                        <Image source={{ uri: mapUrl }} style={{ width: "100%", height: 160 }} resizeMode="cover" />

                        <View className="absolute -bottom-10 left-4 right-4 bg-white rounded-2xl p-4 flex-row items-center shadow-sm border border-neutral-100">
                            <View className="w-9 h-9 rounded-full bg-neutral-900 mr-3" />
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-neutral-950" numberOfLines={1}>
                                    {business.name}
                                </Text>
                                <Text className="text-xs text-neutral-500" numberOfLines={1}>
                                    {business.address}, {business.city}-{business.state}
                                </Text>
                            </View>
                            <Pressable
                                onPress={openInMaps}
                                className="w-9 h-9 rounded-full border border-neutral-300 items-center justify-center ml-2"
                            >
                                <ExternalLink size={16} color="#0a0a0a" />
                            </Pressable>
                        </View>
                    </View>
                )}

                <View style={{ marginTop: mapUrl ? 56 : 24 }} className="px-5">
                    {!!business.description && (
                        <View className="mb-6">
                            <Text className="text-sm font-bold text-neutral-950 mb-2">SOBRE NÓS</Text>
                            <Text className="text-sm text-neutral-600 leading-5">{business.description}</Text>
                        </View>
                    )}

                    {employees.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-sm font-bold text-neutral-950 mb-3">MEMBROS DA EQUIPE</Text>
                            <View className="flex-row flex-wrap gap-5">
                                {employees.map((emp) => (
                                    <View key={emp.id} className="items-center" style={{ width: 70 }}>
                                        {emp.photoUrl ? (
                                            <Image
                                                source={{ uri: emp.photoUrl }}
                                                className="w-14 h-14 rounded-full bg-neutral-300 mb-1.5"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="w-14 h-14 rounded-full bg-neutral-300 mb-1.5" />
                                        )}
                                        <Text className="text-xs text-neutral-700 text-center" numberOfLines={1}>
                                            {emp.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {!!business.phone && (
                        <View className="mb-6">
                            <Text className="text-sm font-bold text-neutral-950 mb-3">CONTATO</Text>
                            <View className="flex-row items-center justify-between bg-neutral-50 rounded-xl px-4 py-3">
                                <Text className="text-sm text-neutral-800">{business.phone}</Text>
                                <Pressable
                                    onPress={handleCopyPhone}
                                    className="flex-row items-center border border-neutral-300 rounded-full px-3 py-1.5"
                                >
                                    <Copy size={13} color="#404040" />
                                    <Text className="text-xs font-semibold text-neutral-700 ml-1.5">Copiar</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {sortedHours.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-sm font-bold text-neutral-950 mb-3">HORÁRIOS DE FUNCIONAMENTO</Text>
                            {sortedHours.map((h) => (
                                <View key={h.dayOfWeek} className="flex-row justify-between py-2 border-b border-neutral-100">
                                    <Text className="text-sm text-neutral-700">{DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek}</Text>
                                    <Text className={`text-sm font-semibold ${h.closed ? "text-red-500" : "text-neutral-900"}`}>
                                        {h.closed ? "Fechado" : `${formatTime(h.openTime)} - ${formatTime(h.closeTime)}`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {getSocialLinks(business).length > 0 && (
                        <View className="mb-6">
                            <Text className="text-sm font-bold text-neutral-950 mb-3">
                                MÍDIAS SOCIAIS E COMPARTILHAMENTOS
                            </Text>
                            <SocialLinks business={business} />
                        </View>
                    )}

                    {(business.hasParking || business.allowsPets || business.hasWifi) && (
                        <View className="mb-6">
                            <Text className="text-sm font-bold text-neutral-950 mb-3">COMODIDADES</Text>
                            {business.hasParking && (
                                <View className="flex-row items-center py-2">
                                    <Car size={18} color="#404040" />
                                    <Text className="text-sm text-neutral-700 ml-3">Estacionamento</Text>
                                </View>
                            )}
                            {business.allowsPets && (
                                <View className="flex-row items-center py-2">
                                    <PawPrint size={18} color="#404040" />
                                    <Text className="text-sm text-neutral-700 ml-3">Permitida entrada de pets</Text>
                                </View>
                            )}
                            {business.hasWifi && (
                                <View className="flex-row items-center py-2">
                                    <Wifi size={18} color="#404040" />
                                    <Text className="text-sm text-neutral-700 ml-3">Wi-Fi</Text>
                                </View>
                            )}
                        </View>
                    )}

                    <Pressable
                        onPress={() => setReportOpen(true)}
                        className="flex-row items-center justify-between py-4 border-t border-neutral-100"
                    >
                        <Text className="text-sm text-neutral-700">Denunciar</Text>
                        <ChevronRight size={18} color="#a3a3a3" />
                    </Pressable>
                </View>
            </ScrollView>

            <ReportSheet
                visible={reportOpen}
                title="Denunciar estabelecimento"
                busy={reporting}
                onClose={() => setReportOpen(false)}
                onSelect={submitReport}
            />
        </View>
    );
}