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
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={route.name}
            >
              {/* Só o ícone: a cor e a espessura do traço mostram qual aba está ativa. */}
              <Icon
                color={isFocused ? colors.brandDark : colors.inkFaint}
                size={24}
                strokeWidth={isFocused ? 2.4 : 1.8}
              />

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
