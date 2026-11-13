import { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Bell,
  MapPin,
  Info,
  LogOut,
  Trash2,
  ShieldOff,
  FileText,
  ShieldCheck,
} from "lucide-react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";

import { useAuth } from "../contexts/AuthContext";
import {
  getMe,
  updatePushToken,
  listBlockedUsers,
  unblockUser,
  API_BASE_URL,
} from "../services/api";
import { registerForPushNotificationsAsync } from "../../pushNotifications";
import { showConfirm, showAlert } from "../services/alert";
import AddressField from "../components/AddressField";
import { SettingsSkeleton } from "../components/skeletons";
import logger from "../services/logger";
import { colors } from "../theme";

function Row({ icon: Icon, label, value, right, onPress }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 border-b border-line"
    >
      <Icon color={colors.brandDark} size={18} />
      <View className="flex-1 ml-3">
        <Text className="text-sm text-ink">{label}</Text>
        {!!value && (
          <Text className="text-xs text-ink-soft mt-0.5">{value}</Text>
        )}
      </View>
      {right}
    </Wrapper>
  );
}

function SectionTitle({ children }) {
  return (
    <Text className="text-xs font-bold tracking-wide text-ink-soft mt-6 mb-2 px-1">
      {children}
    </Text>
  );
}

export default function SettingsScreen({ navigation }) {
  const { user, token, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const loadStatuses = useCallback(async () => {
    try {
      const [me, notifPerm, locPerm, blocked] = await Promise.all([
        getMe(token).catch(() => null),
        Notifications.getPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
        listBlockedUsers(token).catch(() => []),
      ]);
      if (me) setProfile(me);
      setBlockedUsers(Array.isArray(blocked) ? blocked : []);
      setNotifEnabled(notifPerm.status === "granted");
      setLocationGranted(locPerm.status === "granted");
    } catch (error) {
      logger.error("Erro ao carregar configurações:", error?.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadStatuses();
    }, [loadStatuses]),
  );

  async function toggleNotifications(next) {
    if (notifBusy) return;
    setNotifBusy(true);
    try {
      if (next) {
        const pushToken = await registerForPushNotificationsAsync();
        if (!pushToken) {
          showAlert(
            "Permissão necessária",
            "Ative as notificações nos ajustes do seu aparelho para receber avisos dos seus agendamentos.",
            () => Linking.openSettings(),
          );
          setNotifEnabled(false);
          return;
        }
        await updatePushToken(token, pushToken);
        setNotifEnabled(true);
      } else {
        await updatePushToken(token, "");
        setNotifEnabled(false);
      }
    } catch (error) {
      showAlert("Erro", error.message);
    } finally {
      setNotifBusy(false);
    }
  }

  async function handleUnblock(blockedUser) {
    try {
      await unblockUser(token, blockedUser.userId);
      setBlockedUsers((prev) => prev.filter((b) => b.userId !== blockedUser.userId));
    } catch (error) {
      showAlert("Não foi possível desbloquear", error?.message || "Tente novamente.");
    }
  }

  const name = profile?.name ?? user?.name ?? "—";
  const email = profile?.email ?? "—";
  const phone = profile?.phone ?? "—";
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-14 pb-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-alt"
        >
          <ArrowLeft color={colors.ink} size={20} />
        </Pressable>
        <Text className="text-xl font-bold text-ink ml-3">Configurações</Text>
      </View>

      {loading ? (
        <SettingsSkeleton />
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          <SectionTitle>CONTA</SectionTitle>
          <View className="rounded-2xl bg-surface-alt overflow-hidden">
            <Row icon={UserIcon} label="Nome" value={name} />
            <Row icon={Mail} label="E-mail" value={email} />
            <Row icon={Phone} label="Telefone" value={phone} />
          </View>

          <SectionTitle>ENDEREÇO</SectionTitle>
          <AddressField value={profile?.address ?? user?.address ?? ""} />

          <SectionTitle>NOTIFICAÇÕES</SectionTitle>
          <View className="rounded-2xl bg-surface-alt overflow-hidden">
            <Row
              icon={Bell}
              label="Notificações push"
              value="Avisos sobre seus agendamentos"
              right={
                notifBusy ? (
                  <ActivityIndicator color={colors.brandDark} size="small" />
                ) : (
                  <Switch
                    value={notifEnabled}
                    onValueChange={toggleNotifications}
                    trackColor={{ true: colors.brand, false: colors.line }}
                    thumbColor={colors.white}
                  />
                )
              }
            />
          </View>

          <SectionTitle>LOCALIZAÇÃO</SectionTitle>
          <View className="rounded-2xl bg-surface-alt overflow-hidden">
            <Row
              icon={MapPin}
              label="Acesso à localização"
              value={
                locationGranted
                  ? "Permitido — usado para achar estabelecimentos perto de você"
                  : "Não permitido"
              }
              right={
                <Text className="text-xs font-semibold text-brand-dark">
                  Abrir ajustes
                </Text>
              }
              onPress={() => Linking.openSettings()}
            />
          </View>

          {blockedUsers.length > 0 && (
            <>
              <SectionTitle>USUÁRIOS BLOQUEADOS</SectionTitle>
              <View className="rounded-2xl bg-surface-alt overflow-hidden">
                {blockedUsers.map((b) => (
                  <Row
                    key={b.userId}
                    icon={ShieldOff}
                    label={b.name}
                    value="Você não vê as avaliações desta pessoa"
                    right={
                      <Pressable onPress={() => handleUnblock(b)} hitSlop={8}>
                        <Text className="text-xs font-semibold text-brand-dark">Desbloquear</Text>
                      </Pressable>
                    }
                  />
                ))}
              </View>
            </>
          )}

          <SectionTitle>SOBRE</SectionTitle>
          <View className="rounded-2xl bg-surface-alt overflow-hidden">
            <Row
              icon={FileText}
              label="Termos de uso"
              onPress={() => Linking.openURL(`${API_BASE_URL}/legal/termos`)}
            />
            <Row
              icon={ShieldCheck}
              label="Política de privacidade"
              onPress={() => Linking.openURL(`${API_BASE_URL}/legal/privacidade`)}
            />
            <Row icon={Info} label="Versão do app" value={version} />
          </View>

          <Pressable
            onPress={() =>
              showConfirm("Sair", "Tem certeza que deseja sair da sua conta?", signOut)
            }
            className="flex-row items-center py-5 mt-4"
          >
            <LogOut color={colors.danger} size={20} />
            <Text className="ml-3 text-sm font-semibold text-red-600">
              Sair da conta
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("DeleteAccount")}
            className="flex-row items-center py-3"
          >
            <Trash2 color={colors.danger} size={20} />
            <Text className="ml-3 text-sm font-semibold text-red-600">
              Excluir conta
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
