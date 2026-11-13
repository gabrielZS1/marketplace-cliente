import { Modal, Pressable, Text, View, ActivityIndicator } from "react-native";
import { Flag } from "lucide-react-native";
import { colors } from "../theme";

export const REPORT_REASONS = [
  { key: "SPAM", label: "Spam ou propaganda" },
  { key: "OFFENSIVE", label: "Conteúdo ofensivo ou abusivo" },
  { key: "FAKE", label: "Informação falsa ou golpe" },
  { key: "INAPPROPRIATE", label: "Conteúdo impróprio" },
  { key: "OTHER", label: "Outro motivo" },
];

/**
 * Folha de denúncia: o usuário escolhe o motivo e `onSelect(reasonKey)` envia.
 * Quem usa decide o que está sendo denunciado (avaliação, estabelecimento...).
 */
export default function ReportSheet({ visible, title = "Denunciar", onClose, onSelect, busy = false }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}
        onPress={busy ? undefined : onClose}
      >
        <Pressable
          onPress={() => {}}
          className="bg-white rounded-t-3xl px-6 pt-5 pb-9"
        >
          <View className="w-10 h-1 rounded-full bg-neutral-300 self-center mb-4" />

          <View className="flex-row items-center mb-1">
            <Flag size={18} color={colors.danger} />
            <Text className="ml-2 text-lg font-bold text-neutral-950">{title}</Text>
          </View>
          <Text className="text-xs text-neutral-500 mb-3">
            Por que você está denunciando? Nossa equipe analisa em até 24 horas.
          </Text>

          {REPORT_REASONS.map((reason, index) => (
            <Pressable
              key={reason.key}
              disabled={busy}
              onPress={() => onSelect(reason.key)}
              className={`py-4 ${index < REPORT_REASONS.length - 1 ? "border-b border-neutral-100" : ""}`}
            >
              <Text className="text-sm font-medium text-neutral-800">{reason.label}</Text>
            </Pressable>
          ))}

          {busy ? (
            <View className="mt-3 items-center">
              <ActivityIndicator color={colors.brandDark} />
            </View>
          ) : (
            <Pressable onPress={onClose} className="mt-3 h-12 items-center justify-center">
              <Text className="text-sm font-semibold text-neutral-500">Cancelar</Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
