import { View, Text, TouchableOpacity } from "react-native";

export default function CategoryButton({ icon: Icon, label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center mr-4" style={{ width: 72 }}>
      <View
        className={`w-16 h-16 rounded-full items-center justify-center ${
          active ? "bg-amber-500" : "bg-neutral-100"
        }`}
      >
        <Icon color={active ? "#1c1917" : "#525252"} size={24} />
      </View>
      <Text className="text-xs text-neutral-600 text-center mt-1.5" numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}