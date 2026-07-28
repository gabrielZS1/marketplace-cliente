import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { showAlert } from "../services/alert";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  async function handleLogin() {
    if (!email || !password) {
      showAlert("Atenção", "Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      showAlert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-white">
      <View className="flex-1 justify-center px-8">
        <Text className="text-3xl font-bold text-center text-neutral-950 mb-2">Glowly</Text>
        <Text className="text-neutral-500 text-center mb-10">Entre na sua conta</Text>

        <Text className="text-neutral-500 text-xs font-bold mb-2 ml-1">E-MAIL</Text>
        <TextInput
          placeholder="seu@email.com"
          placeholderTextColor="#a3a3a3"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-[#e9e9e9] rounded-xl px-4 py-4 mb-4 text-neutral-800"
        />

        <Text className="text-neutral-500 text-xs font-bold mb-2 ml-1">SENHA</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#a3a3a3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-[#e9e9e9] rounded-xl px-4 py-4 mb-8 text-neutral-800"
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="bg-[#9f7300] rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </Text>
        </Pressable>

        <Pressable className="mt-6 items-center" onPress={() => navigation.navigate("Register")}>
          <Text className="text-neutral-500 text-sm">
            Não tem conta? <Text className="text-[#9f7300] font-bold">Cadastre-se</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}