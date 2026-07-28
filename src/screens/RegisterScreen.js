import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { showAlert } from "../services/alert";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  async function handleRegister() {
    if (!name || !email || !phone || !password) {
  showAlert("Atenção", "Preencha todos os campos.");
  return;
}

    setLoading(true);
    try {
      await signUp(name, email, phone, password);
    } catch (error) {
      showAlert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-8 py-12">
          <Text className="text-3xl font-bold text-center text-neutral-950 mb-2">Criar Conta</Text>
          <Text className="text-neutral-500 text-center mb-8">Bem-vindo ao Glowly</Text>

          <Text className="text-neutral-500 text-xs font-bold mb-2 ml-1">NOME</Text>
          <TextInput
            placeholder="Seu nome completo"
            placeholderTextColor="#a3a3a3"
            value={name}
            onChangeText={setName}
            className="bg-[#e9e9e9] rounded-xl px-4 py-4 mb-4 text-neutral-800"
          />

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

          <Text className="text-neutral-500 text-xs font-bold mb-2 ml-1">TELEFONE</Text>
          <TextInput
            placeholder="11999999999"
            placeholderTextColor="#a3a3a3"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
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
            onPress={handleRegister}
            disabled={loading}
            className="bg-[#9f7300] rounded-xl py-4 items-center"
          >
            <Text className="text-white font-bold text-base">
              {loading ? "CRIANDO CONTA..." : "CRIAR CONTA"}
            </Text>
          </Pressable>

          <Pressable className="mt-6 items-center" onPress={() => navigation.goBack()}>
            <Text className="text-neutral-500 text-sm">
              Já tem conta? <Text className="text-[#9f7300] font-bold">Entrar</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}