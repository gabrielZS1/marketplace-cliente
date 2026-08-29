import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Check,
} from "lucide-react-native";

import { showAlert } from "../services/alert";
import { API_BASE_URL } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function openLegal(path) {
    Linking.openURL(`${API_BASE_URL}${path}`).catch(() =>
      showAlert("Erro", "Não foi possível abrir o documento."),
    );
  }

  const { signUp } = useAuth();

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  function formatPhone(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    if (!numbers) return "";

    if (numbers.length <= 2) return `(${numbers}`;

    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  async function handleRegister() {
    if (loading) return;

    const cleanName = name.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanName || !cleanEmail || !cleanPhone || !password) {
      showAlert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (cleanName.length < 3) {
      showAlert("Erro", "O nome deve possuir no mínimo 3 caracteres.");
      return;
    }

    if (cleanName.length > 40) {
      showAlert("Erro", "O nome pode ter no máximo 40 caracteres.");
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      showAlert("Erro", "Digite um e-mail válido.");
      return;
    }

    if (cleanPhone.length !== 11) {
      showAlert("Erro", "Digite um telefone válido.");
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

    if (cleanEmail.length > 120) {
      showAlert("Erro", "E-mail muito longo.");
      return;
    }

    if (!acceptedTerms) {
      showAlert(
        "Atenção",
        "É preciso aceitar os Termos de Uso e a Política de Privacidade para continuar.",
      );
      return;
    }

    setLoading(true);

    try {
      await signUp(cleanName, cleanEmail, cleanPhone, password, acceptedTerms);
      setName("");
      setEmail("");
      setPhone("");
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../assets/register/register.png")}
            style={{
              marginTop: 70,
              width: "100%",
              height: 250,
            }}
            resizeMode="contain"
          />

          <View className="px-8">
            <Text className="text-[38px] font-bold text-neutral-900 mb-8">
              Cadastre-se
            </Text>

            <View className="flex-row items-center border-b border-neutral-300 pb-3">
              <Mail size={20} color="#9CA3AF" />

              <TextInput
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                className="flex-1 ml-3 text-base text-neutral-900"
                maxLength={120}
                autoCorrect={false}
                style={{ color: "#171717" }}
                autoComplete="email"
                editable={!loading}
                autoCapitalize="none"
                keyboardType="email-address"
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

            <View className="flex-row items-center border-b border-neutral-300 pb-3 mt-6">
              <User size={20} color="#9CA3AF" />

              <TextInput
                placeholder="Como quer ser chamado?"
                placeholderTextColor="#9CA3AF"
                value={name}
                className="flex-1 ml-3 text-base text-neutral-900"
                style={{ color: "#171717" }}
                maxLength={40}
                editable={!loading}
                onChangeText={(text) =>
                  setName(
                    text.replace(/[^A-Za-zÀ-ÿ\s]/g, "").replace(/\s+/g, " "),
                  )
                }
              />
            </View>

            <View className="flex-row items-center border-b border-neutral-300 pb-3 mt-6">
              <Phone size={20} color="#9CA3AF" />

              <TextInput
                placeholder="Telefone"
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-base text-neutral-900"
                style={{ color: "#171717" }}
                value={phone}
                keyboardType="phone-pad"
                editable={!loading}
                maxLength={15}
                onChangeText={(text) => setPhone(formatPhone(text))}
              />
            </View>

            <View className="flex-row items-center border-b border-neutral-300 pb-3 mt-6">
              <Lock size={20} color="#9CA3AF" />

              <TextInput
                placeholder="Senha"
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

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            <Pressable
              onPress={() => setAcceptedTerms((v) => !v)}
              disabled={loading}
              className="flex-row items-start mt-8"
            >
              <View
                className={`w-5 h-5 rounded-md border items-center justify-center mt-0.5 ${
                  acceptedTerms
                    ? "bg-brand border-brand"
                    : "bg-white border-neutral-400"
                }`}
              >
                {acceptedTerms && <Check size={14} color="#171717" />}
              </View>

              <Text className="flex-1 ml-3 text-neutral-500 text-xs leading-5">
                Li e concordo com os{" "}
                <Text
                  className="text-brand-dark font-semibold"
                  onPress={() => openLegal("/legal/termos")}
                >
                  Termos de Uso
                </Text>{" "}
                e a{" "}
                <Text
                  className="text-brand-dark font-semibold"
                  onPress={() => openLegal("/legal/privacidade")}
                >
                  Política de Privacidade
                </Text>
                .
              </Text>
            </Pressable>

            <Pressable
              onPress={handleRegister}
              disabled={loading || !acceptedTerms}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
              })}
              className={`h-14 rounded-2xl justify-center items-center mt-10 ${
                loading || !acceptedTerms ? "bg-neutral-300" : "bg-brand"
              }`}
            >
              <Text
                className={`text-lg font-bold ${
                  loading || !acceptedTerms ? "text-neutral-500" : "text-black"
                }`}
              >
                {loading ? "Criando conta..." : "Continuar"}
              </Text>
            </Pressable>

            <Pressable
              disabled={loading}
              className="items-center mt-10 mb-10"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-neutral-500 text-base">
                Já possui uma conta?
                <Text className="text-brand-dark font-bold"> Login</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
