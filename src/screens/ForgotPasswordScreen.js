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
} from "react-native";
import { ArrowLeft, Mail } from "lucide-react-native";

import { showAlert } from "../services/alert";
import { forgotPassword } from "../services/api";

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!emailRegex.test(cleanEmail)) {
      showAlert("Erro", "Digite um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(cleanEmail);
      navigation.navigate("ResetPassword", { email: cleanEmail });
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
              Esqueceu a senha?
            </Text>

            <Text className="text-neutral-500 text-base leading-6 mt-3">
              Digite o e-mail da sua conta. Enviaremos um código de 6 dígitos
              para você criar uma nova senha.
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
                textContentType="emailAddress"
                editable={!loading}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(text) =>
                  setEmail(text.replace(/\s/g, "").replace(/[^A-Za-z0-9@._%+-]/g, ""))
                }
              />
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
                {loading ? "Enviando..." : "Enviar código"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("ResetPassword", { email: email.trim().toLowerCase() })}
              disabled={loading}
              className="items-center mt-8"
            >
              <Text className="text-neutral-500 text-base">
                Já tem um código?
                <Text className="text-brand-dark font-bold"> Redefinir senha</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
