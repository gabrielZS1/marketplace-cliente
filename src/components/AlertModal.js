import { Modal, View, Text, Pressable } from "react-native";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react-native";
import { colors } from "../theme";

const ICONS = {
  error: { Icon: XCircle, color: colors.danger, bg: "#FEE2E2" },
  success: { Icon: CheckCircle2, color: colors.success, bg: "#DCFCE7" },
  warning: { Icon: AlertTriangle, color: colors.brandDark, bg: colors.brandTint },
};

export default function AlertModal({ visible, title, message, type = "error", buttons, onClose }) {
  const { Icon, color, bg } = ICONS[type] || ICONS.error;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center px-8">
        <View className="bg-white rounded-3xl p-6 w-full items-center">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: bg }}
          >
            <Icon size={32} color={color} />
          </View>

          <Text
            className="text-lg text-ink mb-2 text-center"
            style={{ fontFamily: "Poppins_700Bold" }}
          >
            {title}
          </Text>

          {!!message && (
            <Text
              className="text-sm text-ink-soft text-center mb-6"
              style={{ fontFamily: "Poppins_400Regular" }}
            >
              {message}
            </Text>
          )}

          <View className="flex-row w-full" style={{ gap: 12 }}>
            {buttons.map((btn, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  onClose();
                  btn.onPress?.();
                }}
                className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                  btn.style === "destructive"
                    ? "bg-red-500"
                    : btn.style === "cancel"
                    ? "bg-surface-alt"
                    : "bg-brand"
                }`}
              >
                <Text
                  className={
                    btn.style === "cancel"
                      ? "text-ink-soft"
                      : btn.style === "destructive"
                      ? "text-white"
                      : "text-on-brand"
                  }
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                >
                  {btn.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
