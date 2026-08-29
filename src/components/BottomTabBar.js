import { View, Text, TouchableOpacity } from "react-native";
import { Home, Compass, Calendar, User } from "lucide-react-native";
import { colors, shadow } from "../theme";

const ICONS = {
  Home: Home,
  Explorar: Compass,
  Agendamentos: Calendar,
  Perfil: User,
};

export default function BottomTabBar({ state, navigation }) {
  return (
    <View className="absolute bottom-0 left-0 right-0">
      <View
        className="flex-row rounded-t-3xl bg-white px-4 pb-6 pt-4"
        style={shadow.sheet}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const Icon = ICONS[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              className="flex-1 items-center"
              activeOpacity={0.7}
            >
              <View
                className={`items-center justify-center rounded-2xl px-4 py-1.5 ${
                  isFocused ? "bg-brand-tint" : ""
                }`}
              >
                <Icon
                  color={isFocused ? colors.brandDark : colors.inkFaint}
                  size={22}
                  strokeWidth={isFocused ? 2.6 : 2}
                />
              </View>

              <Text
                className={`mt-1 text-[11px] ${
                  isFocused ? "font-bold text-brand-dark" : "text-ink-faint"
                }`}
              >
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
