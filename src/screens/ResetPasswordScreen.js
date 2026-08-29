import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ArrowLeft, Mail, Lock, KeyRound, Eye, EyeOff } from "lucide-react-native";

import { showAlert, showSuccess } from "../services/alert";
import { resetPassword } from "../services/api";

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function ResetPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!emailRegex.test(cleanEmail)) {
      showAlert("Erro", "Digite um e-mail válido.");
      return;
    }

    if (code.length !== 6) {
      showAlert("Erro", "O código tem 6 dígitos.");
      return;
    }

    if (password.length < 8) {
      showAlert("Erro", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password.length > 64) {
      showAlert("Erro", "A senha pode ter no máximo 64 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(cleanEmail, code, password);
      showSuccess(
        "Senha alterada",
        "Sua senha foi redefinida. Faça login com a nova senha.",
        () => navigation.navigate("Login"),
      );
    } catch (error) {
      showAlert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="px-8 pt-16">
            <Pressable
              onPress={() => navigation.goBack()}
              disabled={loading}
              className="w-10 h-10 items-center justify-center rounded-full -ml-2"
            >
              <ArrowLeft size={24} color="#0a0a0a" />
            </Pressable>

            <Text className="text-[34px] font-bold text-neutral-900 mt-6">
              Redefinir senha
            </Text>

            <Text className="text-neutral-500 text-base leading-6 mt-3">
              Digite o código que enviamos por e-mail e escolha uma nova senha.
              O código expira em 15 minutos.
            </Text>

            <View className="flex-row items-center border-b border-neutral-300 pb-3 mt-10">
              <Mail size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                className="flex-1 ml-3 text-base text-neutral-900"
                style={{ color: "#171717" }}
                maxLength={120}
                autoCorrect={false}
                autoComplete="email"
                editable={!loading}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(text) =>
                  setEmail(text.replace(/\s/g, "").replace(/[^A-Za-z0-9@._%+-]/g, ""))
                }
              />
            </View>

            <View className="flex-row items-center border-b border-neutral-300 pb-3 mt-6">
              <KeyRound size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Código de 6 dígitos"
                placeholderTextColor="#9CA3AF"
                value={code}
                className="flex-1 ml-3 text-base text-neutral-900 tracking-[4px]"
                style={{ color: "#171717" }}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
                onChangeText={(text) => setCode(text.replace(/\D/g, "").slice(0, 6))}
              />
            </View>

            <View className="flex-row items-center border-b border-neutral-300 pb-3 mt-6">
              <Lock size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Nova senha"
                placeholderTextColor="#9CA3AF"
                value={password}
                className="flex-1 ml-3 text-base text-neutral-900"
                style={{ color: "#171717" }}
                secureTextEntry={!showPassword}
                editable={!loading}
                autoComplete="new-password"
                maxLength={64}
                onChangeText={(text) =>
                  setPassword(text.replace(/[^a-zA-Z0-9!@#$%^&*()_\-+=]/g, ""))
                }
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              className={`h-14 rounded-2xl justify-center items-center mt-10 ${
                loading ? "bg-neutral-300" : "bg-brand"
              }`}
            >
              <Text className="text-black text-lg font-bold">
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
