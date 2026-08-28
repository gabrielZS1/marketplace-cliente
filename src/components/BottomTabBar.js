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
    <View className="absolute bottom-0 left-0 right-0">
      <View
  className="flex-row rounded-t-3xl bg-neutral-200 px-4 pb-6 pt-5"
  style={{
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  }}
>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const Icon = ICONS[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              className="flex-1 items-center"
            >
              <Icon
                color={isFocused ? "#d97706" : "#737373"}
                size={22}
              />

              <Text
                className={`mt-2 text-xs ${
                  isFocused
                    ? "font-semibold text-amber-500"
                    : "text-neutral-500"
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