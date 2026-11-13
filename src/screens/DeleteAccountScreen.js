import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { showAlert, showConfirm } from "../services/alert";
import { colors } from "../theme";

export default function DeleteAccountScreen({ navigation }) {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = password.length > 0 && !loading;

  function handlePress() {
    if (!canSubmit) return;
    showConfirm(
      "Excluir conta",
      "Sua conta será excluída agora e não poderá ser recuperada. Suas reservas futuras serão canceladas.",
      submit,
      "Excluir",
      "Manter conta",
    );
  }

  async function submit() {
    setLoading(true);
    try {
      // Ao excluir, a sessão é limpa e o app volta sozinho para a tela de login.
      await deleteAccount(password);
    } catch (error) {
      setLoading(false);
      showAlert("Não foi possível excluir", error?.message || "Tente novamente.");
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-row items-center px-4 pt-14 pb-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-alt"
        >
          <ArrowLeft color={colors.ink} size={20} />
        </Pressable>
        <Text className="text-xl font-bold text-ink ml-3">Excluir conta</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mt-4 self-start rounded-full bg-red-50 p-3">
          <Trash2 size={22} color={colors.danger} />
        </View>

        <Text className="mt-4 text-base font-bold text-ink">
          Tem certeza que deseja excluir sua conta?
        </Text>

        <Text className="mt-3 text-sm leading-6 text-ink-soft">
          Ao excluir:
        </Text>
        <Text className="mt-1 text-sm leading-6 text-ink-soft">
          • seu nome, e-mail, telefone, endereço e foto são removidos;
        </Text>
        <Text className="text-sm leading-6 text-ink-soft">
          • suas reservas futuras são canceladas;
        </Text>
        <Text className="text-sm leading-6 text-ink-soft">
          • seu histórico e suas avaliações ficam sem identificação, como “Conta excluída”;
        </Text>
        <Text className="text-sm leading-6 text-ink-soft">
          • você sai de todos os aparelhos e não consegue recuperar a conta.
        </Text>

        <Text className="mt-6 mb-2 text-xs font-bold tracking-wide text-ink-soft">
          CONFIRME COM SUA SENHA
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Sua senha"
          placeholderTextColor="#9CA3AF"
          className="h-12 rounded-xl border border-line px-4 text-sm text-ink"
        />

        <Pressable
          onPress={handlePress}
          disabled={!canSubmit}
          className={`mt-6 h-14 items-center justify-center rounded-2xl ${
            canSubmit ? "bg-red-600" : "bg-neutral-200"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className={`text-base font-bold ${canSubmit ? "text-white" : "text-neutral-400"}`}>
              Excluir minha conta
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} className="mt-2 h-12 items-center justify-center">
          <Text className="text-sm font-semibold text-neutral-500">Voltar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
