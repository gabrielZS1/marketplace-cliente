import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { showConfirm, showAlert } from "../services/alert";
import {
  Mail,
  Phone,
  Calendar,
  Heart,
  Bell,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { getMe, listMyAppointments } from "../services/api";
import AddressField from "../components/AddressField";
import logger from "../services/logger";
import { colors } from "../theme";

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfileScreen({ navigation }) {
  const { user, token, signOut, updateLocalUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ total: 0, upcoming: 0 });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          const [me, appointments] = await Promise.all([
            getMe(token),
            listMyAppointments(token).catch(() => []),
          ]);
          if (!active) return;

          setProfile(me);
          updateLocalUser({ name: me.name, address: me.address });

          const upcoming = appointments.filter((a) =>
            ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(a.status),
          ).length;
          setStats({ total: appointments.length, upcoming });
        } catch (error) {
          logger.error("Erro ao carregar perfil:", error?.message);
        }
      })();

      return () => {
        active = false;
      };
    }, [token]),
  );

  const name = profile?.name ?? user?.name ?? "";
  const email = profile?.email;
  const phone = profile?.phone;
  const photoUrl = profile?.photoUrl;
  const address = profile?.address ?? user?.address ?? "";

  function handleLogout() {
    showConfirm("Sair", "Tem certeza que deseja sair da sua conta?", signOut);
  }

  const MENU_ITEMS = [
    {
      icon: Calendar,
      label: "Meus agendamentos",
      onPress: () => navigation.navigate("Agendamentos"),
    },
    {
      icon: SettingsIcon,
      label: "Configurações",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      icon: Bell,
      label: "Notificações",
      onPress: () => navigation.navigate("Settings", { focus: "notifications" }),
    },
    {
      icon: Heart,
      label: "Favoritos",
      onPress: () =>
        showAlert("Em breve", "Os favoritos ainda estão sendo preparados."),
    },
    {
      icon: HelpCircle,
      label: "Ajuda",
      onPress: () =>
        showAlert("Em breve", "A central de ajuda estará disponível em breve."),
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 140 }}
    >
      <View className="items-center mb-7">
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            className="w-24 h-24 rounded-full mb-3"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-brand-tint items-center justify-center mb-3">
            <Text className="text-2xl font-bold text-brand-dark">
              {initials(name)}
            </Text>
          </View>
        )}
        <Text className="text-xl font-bold text-ink">{name}</Text>
        <Text className="text-sm text-ink-soft mt-0.5">Cliente</Text>
      </View>

      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 rounded-2xl bg-surface-alt px-4 py-4 items-center">
          <Text className="text-2xl font-bold text-brand-dark">{stats.total}</Text>
          <Text className="text-xs text-ink-soft mt-0.5">Agendamentos</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-surface-alt px-4 py-4 items-center">
          <Text className="text-2xl font-bold text-brand-dark">{stats.upcoming}</Text>
          <Text className="text-xs text-ink-soft mt-0.5">Próximos</Text>
        </View>
      </View>

      <Text className="text-xs font-bold tracking-wide text-ink-soft mb-3">
        INFORMAÇÕES PESSOAIS
      </Text>

      <View className="rounded-2xl bg-surface-alt px-4 py-2 mb-3">
        <View className="flex-row items-center py-3 border-b border-line">
          <Mail color={colors.brandDark} size={16} />
          <Text className="ml-3 text-sm text-ink flex-1">
            {email ?? "—"}
          </Text>
        </View>
        <View className="flex-row items-center py-3">
          <Phone color={colors.brandDark} size={16} />
          <Text className="ml-3 text-sm text-ink flex-1">
            {phone ?? "—"}
          </Text>
        </View>
      </View>

      <View className="mb-6">
        <AddressField value={address} />
      </View>

      <View className="mb-2">
        {MENU_ITEMS.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            className={`flex-row items-center py-4 ${
              index !== MENU_ITEMS.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <item.icon color={colors.inkSoft} size={20} />
            <Text className="flex-1 ml-3 text-sm font-medium text-ink">
              {item.label}
            </Text>
            <ChevronRight color={colors.inkFaint} size={18} />
          </Pressable>
        ))}
      </View>

      <Pressable onPress={handleLogout} className="flex-row items-center py-4">
        <LogOut color={colors.danger} size={20} />
        <Text className="ml-3 text-sm font-semibold text-red-600">Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}
