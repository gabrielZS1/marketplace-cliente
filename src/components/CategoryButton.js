import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "../theme";

export default function CategoryButton({ icon: Icon, label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center mr-4" style={{ width: 72 }}>
      <View
        className={`w-16 h-16 rounded-full items-center justify-center ${
          active ? "bg-brand" : "bg-surface-alt"
        }`}
      >
        <Icon color={active ? colors.onBrand : colors.inkSoft} size={24} />
      </View>
      <Text className="text-xs text-ink-soft text-center mt-1.5" numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
