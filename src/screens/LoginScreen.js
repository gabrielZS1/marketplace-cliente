import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity 
} from "react-native";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { showAlert } from "../services/alert";
import { useAuth } from "../contexts/AuthContext";

import LoadingScreen from "../components/LoadingScreen";




export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  async function handleLogin() {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      showAlert("Atenção", "Preencha e-mail e senha.");
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      showAlert("Erro", "Digite um e-mail válido.");
      return;
    }

    if (cleanEmail.length > 120) {
      showAlert("Erro", "E-mail muito longo.");
      return;
    }

    if (password.length < 8) {
      showAlert("Erro", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password.length > 64) {
      showAlert("Erro", "Senha muito longa.");
      return;
    }

    setLoading(true);

    try {
      await signIn(cleanEmail, password);

      setEmail("");
      setPassword("");
    } catch (error) {
      showAlert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingScreen />;
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
        >
          

          <Image
            source={require("../assets/login/login.png")}
            style={{
              marginTop: 100,
              width: "100%",
              height: 250,
            }}
            resizeMode="contain"
          />

          <View className="px-8">
            <Text className="text-[38px] font-bold text-neutral-900 mb-8"
            style={{ fontFamily: "Poppins_700Bold" }}
            >
              Login
            </Text>

            <View className="flex-row items-center border-b border-neutral-300 pb-3">
              <Mail size={20} color="#9ca3af" />

              <TextInput
                value={email}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-base text-neutral-900"
                style={{ color: "#171717" }}
                editable={!loading}
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                autoCapitalize="none"
                keyboardType="email-address"
                maxLength={120}
                onChangeText={(text) => {
                  let value = text
                    .replace(/\s/g, "")
                    .replace(/[^A-Za-z0-9@._%+-]/g, "");

                  const firstAt = value.indexOf("@");

                  if (firstAt !== -1) {
                    value =
                      value.substring(0, firstAt + 1) +
                      value.substring(firstAt + 1).replace(/@/g, "");
                  }

                  setEmail(value);
                }}
              />
            </View>


            <View className="flex-row items-center border-b border-neutral-300 pb-3 mt-7">
              <Lock size={20} color="#9ca3af" />

              <TextInput
                value={password}
                placeholder="Senha"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                editable={!loading}
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                maxLength={64}
                className="flex-1 ml-3 text-base text-neutral-900"
                style={{ color: "#171717" }}
                onChangeText={(text) => setPassword(text.replace(/\s/g, ""))}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
            <Pressable
              disabled={loading}
              onPress={() => navigation.navigate("ForgotPassword")}
              className="self-end mt-4"
            >
              <Text className="text-brand-dark font-semibold">
                Esqueceu a senha?
              </Text>
            </Pressable>


            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
              })}
              className={`rounded-2xl h-14 justify-center items-center mt-10 ${
                loading ? "bg-neutral-300" : "bg-brand"
              }`}
            >
              <Text className="text-black text-lg font-bold">
                {loading ? "Entrando..." : "Continuar"}
              </Text>
            </Pressable>


            <View className="flex-row items-center my-3">
              <View className="flex-1 h-px bg-neutral-200" />

              <Text className="mx-4 text-neutral-400 font-medium">OU</Text>

              <View className="flex-1 h-px bg-neutral-200" />
            </View>


            <Pressable className="h-14 rounded-2xl bg-neutral-100 flex-row items-center justify-center">
              <Image
                source={require("../assets/login/google.png")}
                style={{
                  width: 22,
                  height: 22,
                  marginRight: 12,
                }}
                resizeMode="contain"
              />

              <Text className="ml-3 text-neutral-600 font-semibold text-base">
                Login com Google
              </Text>
            </Pressable>


            <Pressable
              disabled={loading}
              className="items-center mt-10"
              onPress={() => navigation.navigate("Register")}
            >
              <Text className="text-neutral-500">
                Não possui conta?
                <Text className="text-brand-dark font-bold"> Cadastre-se</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
