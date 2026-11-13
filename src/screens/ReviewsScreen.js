import { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Image,
    FlatList,
    Share,
    Modal,
    Animated,
    Easing,
    Dimensions,
} from "react-native";
import { ArrowLeft, Share2, Heart, Flag, SlidersHorizontal, ChevronDown, Star, UserCircle, X, Check, MoreHorizontal } from "lucide-react-native";
import { getBusinessReviews, reportContent, blockUser } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { showAlert, showConfirm, showSuccess } from "../services/alert";
import ReportSheet from "../components/ReportSheet";
import { colors } from "../theme";
import logger from "../services/logger";
import { ReviewsSkeleton } from "../components/skeletons";

const SCREEN_WIDTH = Dimensions.get("window").width;

function StarRow({ rating, size = 16 }) {
    return (
        <View className="flex-row">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    color={colors.brand}
                    fill={star <= Math.round(rating) ? colors.brand : "transparent"}
                    strokeWidth={1.5}
                />
            ))}
        </View>
    );
}

function RatingBar({ star, count, total }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <View className="flex-row items-center mb-1.5">
            <Text className="text-xs text-neutral-600 w-4 mr-2">{star}</Text>
            <Star size={11} color={colors.brand} fill={colors.brand} strokeWidth={1.5} />
            <View className="flex-1 h-2 bg-neutral-300 rounded-full mx-2 overflow-hidden">
                <View
                    className="h-full bg-brand rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </View>
            <Text className="text-xs text-neutral-500 w-4">{count}</Text>
        </View>
    );
}

function CheckBox({ checked }) {
    return (
        <View
            className={`w-5 h-5 rounded-md items-center justify-center mr-2 ${
                checked ? "bg-brand" : "border border-neutral-300 bg-white"
            }`}
        >
            {checked && <Check size={14} color="#fff" strokeWidth={3} />}
        </View>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function ReviewCard({ review, onMenu }) {
    const initials = review.clientName
        ? review.clientName.split(" ").map((n) => n[0]).slice(0, 1).join("").toUpperCase()
        : "?";

    const COLORS = [colors.brandDark, "#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#0891b2"];
    const colorIndex = review.clientName?.charCodeAt(0) % COLORS.length ?? 0;
    const avatarColor = COLORS[colorIndex];

    return (
        <View className="bg-white rounded-2xl p-4 mb-3 mx-5">
            {/* Cabeçalho do card */}
            <View className="flex-row items-start justify-between">
                <View className="flex-row items-center flex-1 mr-2">
                    {/* Avatar */}
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: avatarColor }}
                    >
                        <Text className="text-white font-bold text-sm">{initials}</Text>
                    </View>

                    <View className="flex-1">
                        <Text className="text-sm font-bold text-neutral-900" numberOfLines={1}>
                            {review.clientName ?? "Cliente"}
                        </Text>
                        <View className="flex-row items-center mt-0.5">
                            <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                            <Text className="text-[10px] text-green-600 font-semibold">
                                Cliente verificado
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Denunciar / bloquear */}
                <Pressable
                    onPress={() => onMenu(review)}
                    className="p-1"
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Denunciar ou bloquear"
                >
                    <Flag size={15} color="#a3a3a3" strokeWidth={2} />
                </Pressable>
            </View>

            {/* Estrelas e data */}
            <View className="flex-row items-center justify-between mt-3">
                <StarRow rating={review.rating} size={14} />
                <Text className="text-[10px] text-neutral-400">{formatDate(review.createdAt)}</Text>
            </View>

            {/* Serviço e funcionário */}
            <View className="mt-2">
                {review.serviceName && (
                    <Text className="text-[11px] text-neutral-500">
                        <Text className="font-semibold">Serviço:</Text> {review.serviceName}
                    </Text>
                )}
                {review.employeeName && (
                    <Text className="text-[11px] text-neutral-500 mt-0.5">
                        <Text className="font-semibold">Equipe:</Text> {review.employeeName}
                    </Text>
                )}
            </View>

            {/* Comentário */}
            {!!review.comment && (
                <Text className="mt-2 text-sm text-neutral-700 leading-5">
                    {review.comment}
                </Text>
            )}
        </View>
    );
}

function ActionSheet({ visible, onClose, onShare, onReport }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                onPress={onClose}
            >
                <View style={{ padding: 12, paddingBottom: 24 }}>
                    <View style={{ backgroundColor: "#e8e8e8", borderRadius: 14, overflow: "hidden" }}>
                        <Pressable
                            onPress={onShare}
                            style={{
                                paddingVertical: 16,
                                alignItems: "center",
                                borderBottomWidth: 1,
                                borderBottomColor: "#d0d0d0",
                            }}
                        >
                            <Text style={{ fontSize: 16, color: "#111" }}>Compartilhar</Text>
                        </Pressable>
                        <Pressable onPress={onReport} style={{ paddingVertical: 16, alignItems: "center" }}>
                            <Text style={{ fontSize: 16, color: "#e53935", fontWeight: "600" }}>Denunciar ou bloquear</Text>
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

function PhotoViewerModal({ visible, photos, initialIndex, onClose, onMenu }) {
    const [index, setIndex] = useState(initialIndex);
    const [actionSheetOpen, setActionSheetOpen] = useState(false);

    useEffect(() => {
        if (visible) setIndex(initialIndex);
    }, [visible, initialIndex]);

    if (!visible || photos.length === 0) return null;

    const current = photos[index] ?? photos[0];

    const initials = current.clientName
        ? current.clientName.split(" ").map((n) => n[0]).slice(0, 1).join("").toUpperCase()
        : "?";

    function onScrollEnd(e) {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setIndex(newIndex);
    }

    async function handleShare() {
        setActionSheetOpen(false);
        try {
            await Share.share({ message: "Confira essa avaliação no Glowly!" });
        } catch (_) {}
    }

    function handleReport() {
        setActionSheetOpen(false);
        // Quem decide (denunciar ou bloquear) é a tela principal, depois de fechar o visualizador.
        onMenu?.(current);
    }

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: "#000" }}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 pt-12 pb-3">
                    <Pressable onPress={onClose} className="p-1">
                        <X size={24} color="#fff" strokeWidth={2.5} />
                    </Pressable>
                    <Text className="text-white text-sm font-semibold">
                        {index + 1}/{photos.length}
                    </Text>
                    <Pressable onPress={() => setActionSheetOpen(true)} className="p-1">
                        <MoreHorizontal size={22} color="#fff" strokeWidth={2.5} />
                    </Pressable>
                </View>

                {/* Foto (swipe horizontal entre as fotos) */}
                <FlatList
                    data={photos}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={initialIndex}
                    getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
                    onMomentumScrollEnd={onScrollEnd}
                    keyExtractor={(_, i) => String(i)}
                    renderItem={({ item }) => (
                        <Image
                            source={{ uri: item.photoUrl }}
                            style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                            resizeMode="cover"
                        />
                    )}
                />

                {/* Info da avaliação dona da foto */}
                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                    <View className="flex-row items-center">
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: colors.brandDark }}
                        >
                            <Text className="text-white font-bold text-sm">{initials}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-sm">
                                {current.clientName ?? "Cliente"}
                            </Text>
                            <View className="flex-row items-center mt-0.5">
                                <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                                <Text className="text-[10px] text-green-500 font-semibold">
                                    Cliente verificado
                                </Text>
                            </View>
                        </View>
                        <Text className="text-[10px] text-neutral-400">
                            {formatDate(current.createdAt)}
                        </Text>
                    </View>

                    <View className="mt-3">
                        <StarRow rating={current.rating} size={16} />
                    </View>

                    <View className="mt-2">
                        {current.serviceName && (
                            <Text className="text-xs text-neutral-300">
                                <Text className="font-semibold text-white">Serviço:</Text> {current.serviceName}
                            </Text>
                        )}
                        {current.employeeName && (
                            <Text className="text-xs text-neutral-300 mt-0.5">
                                <Text className="font-semibold text-white">Equipe:</Text> {current.employeeName}
                            </Text>
                        )}
                    </View>

                    {!!current.comment && (
                        <Text className="mt-2 text-sm text-neutral-200 leading-5">
                            {current.comment}
                        </Text>
                    )}
                </ScrollView>

                <ActionSheet
                    visible={actionSheetOpen}
                    onClose={() => setActionSheetOpen(false)}
                    onShare={handleShare}
                    onReport={handleReport}
                />
            </View>
        </Modal>
    );
}

// Menu de uma avaliação: denunciar o conteúdo ou bloquear quem escreveu.
function ReviewMenu({ review, onClose, onReport, onBlock }) {
    return (
        <Modal visible={!!review} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
            <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                onPress={onClose}
            >
                <View style={{ padding: 12, paddingBottom: 24 }}>
                    <View style={{ backgroundColor: "#fff", borderRadius: 14, overflow: "hidden" }}>
                        <Pressable
                            onPress={() => onReport(review)}
                            style={{ paddingVertical: 16, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" }}
                        >
                            <Text style={{ fontSize: 16, color: "#e53935", fontWeight: "600" }}>Denunciar avaliação</Text>
                        </Pressable>
                        <Pressable onPress={() => onBlock(review)} style={{ paddingVertical: 16, alignItems: "center" }}>
                            <Text style={{ fontSize: 16, color: "#111", fontWeight: "600" }}>
                                Bloquear {review?.clientName ?? "usuário"}
                            </Text>
                        </Pressable>
                    </View>
                    <Pressable
                        onPress={onClose}
                        style={{ marginTop: 8, backgroundColor: "#fff", borderRadius: 14, paddingVertical: 16, alignItems: "center" }}
                    >
                        <Text style={{ fontSize: 16, color: "#111" }}>Cancelar</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}

function FiltersModal({ visible, onClose, starCounts, employees, draftStars, setDraftStars, draftEmployee, setDraftEmployee, onClear, onApply }) {
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

    function toggleStar(star) {
        setDraftStars((prev) =>
            prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
        );
    }

    if (!renderModal) return null;

    return (
        <Modal visible transparent animationType="none" onRequestClose={onClose}>
            <View className="flex-1 justify-end">
                {/* Fundo escurecendo */}
                <Animated.View
                    style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        opacity: backdropOpacity,
                    }}
                >
                    <Pressable style={{ flex: 1 }} onPress={onClose} />
                </Animated.View>

                {/* Card deslizando */}
                <Animated.View
                    style={{
                        transform: [{ translateY }],
                        maxHeight: "85%",
                        backgroundColor: "#f0f0f0",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingHorizontal: 20,
                        paddingTop: 20,
                        paddingBottom: 32,
                    }}
                >
                    {/* Cabeçalho */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-2xl font-bold text-neutral-950">Filtros</Text>
                        <Pressable onPress={onClose}>
                            <Text className="text-sm font-bold text-red-500">Descartar</Text>
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text className="text-sm text-neutral-500 mb-3">Filtrar por</Text>

                        {/* Avaliações */}
                        <Text className="text-base font-bold text-neutral-950 mb-3">Avaliações</Text>
                        {starCounts.map(({ star, count, total }) => (
                            <Pressable
                                key={star}
                                onPress={() => toggleStar(star)}
                                className="flex-row items-center mb-2"
                            >
                                <CheckBox checked={draftStars.includes(star)} />
                                <View className="flex-1">
                                    <RatingBar star={star} count={count} total={total} />
                                </View>
                            </Pressable>
                        ))}

                        {/* Funcionários */}
                        <Text className="text-base font-bold text-neutral-950 mt-5 mb-3">Funcionários</Text>

                        <Pressable
                            onPress={() => setDraftEmployee(null)}
                            className="flex-row items-center py-2.5 border-b border-neutral-200"
                        >
                            <UserCircle size={34} color="#a3a3a3" strokeWidth={1.5} />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-neutral-900">
                                    Sem preferência de funcionário
                                </Text>
                                <Text className="text-xs text-neutral-400">Qualquer funcionário</Text>
                            </View>
                            {draftEmployee === null && <Check size={18} color={colors.brandDark} strokeWidth={3} />}
                        </Pressable>

                        {employees.map((name) => (
                            <Pressable
                                key={name}
                                onPress={() => setDraftEmployee(name)}
                                className="flex-row items-center py-2.5 border-b border-neutral-200"
                            >
                                <View className="w-[34px] h-[34px] rounded-full bg-neutral-300 items-center justify-center">
                                    <Text className="text-xs font-bold text-neutral-700">
                                        {name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                                    </Text>
                                </View>
                                <View className="flex-1 ml-3">
                                    <Text className="text-sm font-semibold text-neutral-900">{name}</Text>
                                    <Text className="text-xs text-neutral-400">Barbeiro</Text>
                                </View>
                                {draftEmployee === name && <Check size={18} color={colors.brandDark} strokeWidth={3} />}
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* Botões */}
                    <View className="flex-row gap-3 mt-5">
                        <Pressable
                            onPress={onClear}
                            className="flex-1 items-center justify-center rounded-xl border border-neutral-400 py-3.5"
                        >
                            <Text className="text-sm font-bold text-neutral-700">Limpar</Text>
                        </Pressable>
                        <Pressable
                            onPress={onApply}
                            className="flex-1 items-center justify-center rounded-xl bg-brand py-3.5"
                        >
                            <Text className="text-sm font-bold text-on-brand">Ver resultados</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

export default function ReviewsScreen({ navigation, route }) {
    const { businessId, businessName } = route.params;
    const { token } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [menuReview, setMenuReview] = useState(null);
    const [reportTarget, setReportTarget] = useState(null);
    const [reporting, setReporting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("recent");
    const [sortMenuOpen, setSortMenuOpen] = useState(false);

    const ALL_STARS = [5, 4, 3, 2, 1];
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [appliedStars, setAppliedStars] = useState(ALL_STARS);
    const [appliedEmployee, setAppliedEmployee] = useState(null);
    const [draftStars, setDraftStars] = useState(ALL_STARS);
    const [draftEmployee, setDraftEmployee] = useState(null);

    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    const SORT_LABELS = {
        recent:      "Mais recente",
        highest:     "Maior nota",
        lowest:      "Menor nota",
    };

    useEffect(() => {
        loadReviews();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 bg-[#f0f0f0]">
                <View className="flex-row items-center justify-between bg-white px-4 pt-12 pb-3 border-b border-neutral-200">
                    <Pressable onPress={() => navigation.goBack()} className="p-1">
                        <ArrowLeft size={24} color="#0a0a0a" strokeWidth={2.5} />
                    </Pressable>
                    <Text className="text-base font-bold text-neutral-900 flex-1 text-center mx-2" numberOfLines={1}>
                        {businessName}
                    </Text>
                    <View style={{ width: 60 }} />
                </View>
                <ScrollView scrollEnabled={false} showsVerticalScrollIndicator={false}>
                    <ReviewsSkeleton />
                </ScrollView>
            </View>
        );
    }

    async function loadReviews() {
        setLoading(true);
        try {
            // Com o token, o servidor já esconde as avaliações de quem foi bloqueado.
            const data = await getBusinessReviews(businessId, token);
            setReviews(data);
        } catch (error) {
            logger.error("Erro ao carregar avaliações:", error?.message);
        } finally {
            setLoading(false);
        }
    }

    const totalReviews = reviews.length;
    const averageRating =
        totalReviews > 0
            ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalReviews
            : 0;

    const starCounts = ALL_STARS.map((star) => ({
        star,
        count: reviews.filter((r) => Math.round(r.rating) === star).length,
        total: totalReviews,
    }));

    const employees = [...new Set(reviews.map((r) => r.employeeName).filter(Boolean))];

    const clientPhotos = reviews.filter((r) => r.photoUrl);

    function openFilters() {
        setDraftStars(appliedStars);
        setDraftEmployee(appliedEmployee);
        setFiltersOpen(true);
    }

    function handleClearFilters() {
        setDraftStars(ALL_STARS);
        setDraftEmployee(null);
    }

    function handleApplyFilters() {
        setAppliedStars(draftStars);
        setAppliedEmployee(draftEmployee);
        setFiltersOpen(false);
    }

    function openPhotoViewer(index) {
        setViewerIndex(index);
        setViewerVisible(true);
    }

    const filteredReviews = reviews.filter(
        (r) =>
            appliedStars.includes(Math.round(r.rating ?? 0)) &&
            (!appliedEmployee || r.employeeName === appliedEmployee)
    );

    const sortedReviews = [...filteredReviews].sort((a, b) => {
        if (sortBy === "highest") return (b.rating ?? 0) - (a.rating ?? 0);
        if (sortBy === "lowest")  return (a.rating ?? 0) - (b.rating ?? 0);
        return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
    });

    async function handleShare() {
        try {
            await Share.share({ message: `Confira as avaliações de ${businessName} no Glowly!` });
        } catch (_) {}
    }

    // Abre o menu de uma avaliação (fecha antes o visualizador de fotos, se estiver aberto).
    function openReviewMenu(review) {
        if (!review) return;
        setViewerVisible(false);
        setMenuReview(review);
    }

    function startReportReview(review) {
        setMenuReview(null);
        setReportTarget({ targetType: "REVIEW", targetId: review.id, title: "Denunciar avaliação" });
    }

    function startBlock(review) {
        setMenuReview(null);
        if (!review?.clientId) return;
        showConfirm(
            "Bloquear usuário",
            `Você não verá mais as avaliações de ${review.clientName ?? "esta pessoa"}. Dá para desbloquear em Configurações.`,
            async () => {
                try {
                    await blockUser(token, review.clientId);
                    setReviews((prev) => prev.filter((r) => r.clientId !== review.clientId));
                    showSuccess("Usuário bloqueado", "As avaliações dessa pessoa foram ocultadas.");
                } catch (error) {
                    showAlert("Não foi possível bloquear", error?.message || "Tente novamente.");
                }
            },
            "Bloquear",
        );
    }

    async function submitReport(reason) {
        if (!reportTarget || reporting) return;
        setReporting(true);
        try {
            await reportContent(token, {
                targetType: reportTarget.targetType,
                targetId: reportTarget.targetId,
                reason,
            });
            setReportTarget(null);
            showSuccess("Denúncia enviada", "Obrigado! Nossa equipe vai analisar em até 24 horas.");
        } catch (error) {
            setReportTarget(null);
            showAlert("Não foi possível denunciar", error?.message || "Tente novamente.");
        } finally {
            setReporting(false);
        }
    }

    

    return (
        <View className="flex-1 bg-[#f0f0f0]">
            {/* ── Header fixo ── */}
            <View className="flex-row items-center justify-between bg-white px-4 pt-12 pb-3 border-b border-neutral-200">
                <Pressable onPress={() => navigation.goBack()} className="p-1">
                    <ArrowLeft size={24} color="#0a0a0a" strokeWidth={2.5} />
                </Pressable>

                <Text className="text-base font-bold text-neutral-900 flex-1 text-center mx-2" numberOfLines={1}>
                    {businessName}
                </Text>

                <View className="flex-row items-center gap-3">
                    <Pressable onPress={handleShare} className="p-1">
                        <Share2 size={20} color="#0a0a0a" strokeWidth={2} />
                    </Pressable>
                    <Pressable className="p-1">
                        <Heart size={20} color="#e53935" fill="#e53935" strokeWidth={2} />
                    </Pressable>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

                {/* ── Resumo de rating ── */}
                <View className="bg-white mx-5 mt-5 rounded-2xl p-5">
                    <View className="flex-row items-center">
                        {/* Nota grande */}
                        <View className="items-center mr-5">
                            <Text className="text-5xl font-bold text-neutral-950">
                                {averageRating.toFixed(1).replace(".", ",")}
                            </Text>
                            <StarRow rating={averageRating} size={18} />
                            <Text className="text-xs text-neutral-500 mt-1">
                                {totalReviews} avaliações
                            </Text>
                        </View>

                        {/* Barras por estrela */}
                        <View className="flex-1">
                            {starCounts.map(({ star, count, total }) => (
                                <RatingBar
                                    key={star}
                                    star={star}
                                    count={count}
                                    total={total}
                                />
                            ))}
                        </View>
                    </View>
                </View>

                {/* ── Fotos de clientes ── */}
                <View className="mt-5">
                    <Text className="px-5 text-base font-bold text-neutral-950 mb-3">
                        Fotos de clientes
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 4 }}
                    >
                        {clientPhotos.slice(0, 10).map((r, i) => (
                            <Pressable key={i} onPress={() => openPhotoViewer(i)}>
                                <Image
                                    source={{ uri: r.photoUrl }}
                                    className="w-20 h-20 rounded-xl mr-2"
                                    resizeMode="cover"
                                />
                            </Pressable>
                        ))}
                        {clientPhotos.length === 0 && (
                            <Text className="text-sm text-neutral-400 px-1">
                                Nenhuma foto enviada ainda.
                            </Text>
                        )}
                    </ScrollView>
                </View>

                {/* ── Filtros e ordenação ── */}
                <View className="flex-row items-center px-5 mt-5 gap-2">
                    <Pressable
                        onPress={openFilters}
                        className="flex-row items-center rounded-full border border-neutral-400 bg-white px-3 py-2"
                    >
                        <SlidersHorizontal size={14} color="#404040" />
                        <Text className="text-xs font-semibold text-neutral-700 ml-1.5">Filtros</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setSortMenuOpen(!sortMenuOpen)}
                        className="flex-row items-center rounded-full border border-neutral-400 bg-white px-3 py-2"
                    >
                        <Text className="text-xs font-semibold text-neutral-700">
                            Ordenar por: {SORT_LABELS[sortBy]}
                        </Text>
                        <ChevronDown size={14} color="#404040" className="ml-1" />
                    </Pressable>
                </View>

                {/* Mini menu de ordenação */}
                {sortMenuOpen && (
                    <View className="mx-5 mt-2 bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200">
                        {Object.entries(SORT_LABELS).map(([key, label]) => (
                            <Pressable
                                key={key}
                                onPress={() => { setSortBy(key); setSortMenuOpen(false); }}
                                className={`px-4 py-3 border-b border-neutral-100 ${sortBy === key ? "bg-[#fdf3d8]" : "bg-white"}`}
                            >
                                <Text className={`text-sm ${sortBy === key ? "font-bold text-brand-dark" : "text-neutral-700"}`}>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* ── Lista de avaliações ── */}
                <View className="flex-row items-center justify-between px-5 mt-5 mb-3">
                    <Text className="text-base font-bold text-neutral-950">Avaliações</Text>
                    <Pressable
                        onPress={() =>
                            setReportTarget({ targetType: "BUSINESS", targetId: businessId, title: "Denunciar estabelecimento" })
                        }
                    >
                        <Text className="text-[10px] text-neutral-400">
                            Viu algo errado?{" "}
                            <Text className="text-brand-dark font-bold">Denuncie</Text>
                        </Text>
                    </Pressable>
                </View>

                {sortedReviews.length === 0 ? (
                    <View className="items-center mt-10 px-5">
                        <Text className="text-neutral-400 text-sm">
                            Nenhuma avaliação encontrada para os filtros selecionados.
                        </Text>
                    </View>
                ) : (
                    sortedReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} onMenu={openReviewMenu} />
                    ))
                )}
            </ScrollView>

            {/* ── Modal de Filtros ── */}
            <FiltersModal
                visible={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                starCounts={starCounts}
                employees={employees}
                draftStars={draftStars}
                setDraftStars={setDraftStars}
                draftEmployee={draftEmployee}
                setDraftEmployee={setDraftEmployee}
                onClear={handleClearFilters}
                onApply={handleApplyFilters}
            />

            {/* ── Visualizador de fotos ── */}
            <PhotoViewerModal
                visible={viewerVisible}
                photos={clientPhotos}
                initialIndex={viewerIndex}
                onClose={() => setViewerVisible(false)}
                onMenu={openReviewMenu}
            />

            {/* ── Denunciar / bloquear ── */}
            <ReviewMenu
                review={menuReview}
                onClose={() => setMenuReview(null)}
                onReport={startReportReview}
                onBlock={startBlock}
            />
            <ReportSheet
                visible={!!reportTarget}
                title={reportTarget?.title}
                busy={reporting}
                onClose={() => setReportTarget(null)}
                onSelect={submitReport}
            />
        </View>
    );
}