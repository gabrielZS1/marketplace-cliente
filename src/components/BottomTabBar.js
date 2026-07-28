import { View, Text, TouchableOpacity } from "react-native";
import { Home, Compass, Calendar, User } from "lucide-react-native";

const ICONS = {
  Home: Home,
  Explorar: Compass,
  Agendamentos: Calendar,
  Perfil: User,
};

export default function BottomTabBar({ state, navigation }) {
  return (
    <View className="flex-row bg-neutral-200 border-t border-neutral-800 pt-2 pb-6 px-4">
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = ICONS[route.name];

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className="flex-1 items-center"
          >
            <Icon color={isFocused ? "#d97706" : "#737373"} size={22} />
            <Text className={`text-xs mt-1 ${isFocused ? "text-amber-500 font-semibold" : "text-neutral-500"}`}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}