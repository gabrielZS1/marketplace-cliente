import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { showAlert, showConfirm } from "../services/alert";
import {
  User as UserIcon,
  MapPin,
  Calendar,
  Heart,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { updateUserAddress } from "../services/api";

const MENU_ITEMS = [
  { icon: Calendar, label: "Meus agendamentos", route: "Agendamentos" },
  { icon: Heart, label: "Favoritos", route: "Favorites" },
  { icon: Bell, label: "Notificações", route: "Notifications" },
  { icon: HelpCircle, label: "Ajuda", route: "Help" },
];

export default function ProfileScreen({ navigation }) {
  const { user, token, signOut, updateLocalAddress } = useAuth();
  const [address, setAddress] = useState(user?.address ?? "");
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  async function saveAddress() {
    setSavingAddress(true);
    try {
      await updateUserAddress(token, address);
      updateLocalAddress(address);
      setEditingAddress(false);
    } catch (error) {
      showAlert("Erro", error.message);
    } finally {
      setSavingAddress(false);
    }
  }

  function handleLogout() {
    showConfirm("Sair", "Tem certeza que deseja sair da sua conta?", signOut);
  }

  return (
    <View className="flex-1 bg-white pt-14 px-6">
      {/* Header do perfil */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-[#f3e6c8] items-center justify-center mb-3">
          <UserIcon color="#9f7300" size={32} />
        </View>
        <Text className="text-xl font-bold text-neutral-950">{user?.name}</Text>
        <Text className="text-sm text-neutral-500 mt-0.5">{user?.role === "CLIENT" ? "Cliente" : user?.role}</Text>
      </View>

      {/* Endereço */}
      <View className="bg-[#f7f7f7] rounded-2xl px-4 py-4 mb-6">
        <View className="flex-row items-center mb-2">
          <MapPin color="#9f7300" size={16} />
          <Text className="ml-2 text-xs font-bold text-neutral-500">MEU ENDEREÇO</Text>
        </View>

        {editingAddress ? (
          <View className="flex-row items-center">
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Digite seu endereço"
              placeholderTextColor="#a3a3a3"
              autoFocus
              className="flex-1 text-sm text-neutral-800 bg-white rounded-lg px-3 py-2.5 border border-neutral-200"
            />
            <Pressable
              onPress={saveAddress}
              disabled={savingAddress}
              className="ml-2 bg-[#9f7300] rounded-lg w-10 h-10 items-center justify-center"
            >
              <Check color="#fff" size={18} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditingAddress(true)}>
            <Text className={`text-sm ${address ? "text-neutral-800" : "text-neutral-400"}`}>
              {address || "Toque para adicionar seu endereço"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Menu de opções */}
      <View className="mb-6">
        {MENU_ITEMS.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={() => navigation.navigate(item.route)}
            className={`flex-row items-center py-4 ${index !== MENU_ITEMS.length - 1 ? "border-b border-neutral-100" : ""}`}
          >
            <item.icon color="#525252" size={20} />
            <Text className="flex-1 ml-3 text-sm font-medium text-neutral-800">{item.label}</Text>
            <ChevronRight color="#a3a3a3" size={18} />
          </Pressable>
        ))}
      </View>

      {/* Sair */}
      <Pressable onPress={handleLogout} className="flex-row items-center py-4">
        <LogOut color="#dc2626" size={20} />
        <Text className="ml-3 text-sm font-semibold text-red-600">Sair da conta</Text>
      </Pressable>
    </View>
  );
}