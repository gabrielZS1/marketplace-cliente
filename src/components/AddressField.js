import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { MapPin, Check } from "lucide-react-native";
import { showAlert } from "../services/alert";
import { useAuth } from "../contexts/AuthContext";
import { updateUserAddress } from "../services/api";
import { colors } from "../theme";

/**
 * Campo de endereço com edição inline. Usa o endpoint real
 * PATCH /api/users/me/address e atualiza o cache local da sessão.
 * Compartilhado entre a tela de Perfil e a de Configurações.
 */
export default function AddressField({ value }) {
  const { token, updateLocalAddress } = useAuth();
  const [address, setAddress] = useState(value ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateUserAddress(token, address.trim());
      updateLocalAddress(address.trim());
      setEditing(false);
    } catch (error) {
      showAlert("Erro", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="rounded-2xl bg-surface-alt px-4 py-4">
      <View className="flex-row items-center mb-2">
        <MapPin color={colors.brandDark} size={16} />
        <Text className="ml-2 text-xs font-bold tracking-wide text-ink-soft">
          MEU ENDEREÇO
        </Text>
      </View>

      {editing ? (
        <View className="flex-row items-center">
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Digite seu endereço"
            placeholderTextColor={colors.inkFaint}
            autoFocus
            className="flex-1 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink"
          />
          <Pressable
            onPress={save}
            disabled={saving}
            className="ml-2 h-10 w-10 items-center justify-center rounded-xl bg-brand"
          >
            {saving ? (
              <ActivityIndicator color={colors.onBrand} size="small" />
            ) : (
              <Check color={colors.onBrand} size={18} />
            )}
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setEditing(true)}>
          <Text className={`text-sm ${address ? "text-ink" : "text-ink-faint"}`}>
            {address || "Toque para adicionar seu endereço"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
