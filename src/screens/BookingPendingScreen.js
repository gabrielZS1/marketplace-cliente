import { View, Text, Pressable } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { colors } from "../theme";

export default function BookingPendingScreen({ route, navigation }) {
  const { businessName, dateFormatted, timeFormatted } = route.params || {};

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <View className="w-20 h-20 rounded-full bg-brand-tint items-center justify-center mb-6">
        <CheckCircle2 size={40} color={colors.brandDark} strokeWidth={2} />
      </View>

      <Text className="text-2xl font-bold text-black text-center">
        Agendamento realizado!
      </Text>

      <Text className="mt-3 text-sm text-neutral-500 text-center leading-5">
        Esperando a confirmação do estabelecimento
        {businessName ? ` ${businessName}` : ""}.
      </Text>

      {(dateFormatted || timeFormatted) && (
        <Text className="mt-1 text-sm font-medium text-neutral-800 text-center">
          {dateFormatted} • {timeFormatted}
        </Text>
      )}

      <Text className="mt-6 text-xs text-neutral-400 text-center leading-4">
        Você será avisado assim que o estabelecimento confirmar o seu horário.
      </Text>

      <Pressable
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs", params: { screen: "Agendamentos" } }],
          })
        }
        className="mt-10 w-full rounded-xl bg-brand py-3.5 items-center justify-center active:opacity-90"
      >
        <Text className="text-base font-bold text-on-brand">
          Ver meus agendamentos
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs", params: { screen: "Home" } }],
          })
        }
        className="mt-3 w-full py-3 items-center justify-center"
      >
        <Text className="text-sm font-semibold text-neutral-500">
          Voltar ao início
        </Text>
      </Pressable>
    </View>
  );
}
