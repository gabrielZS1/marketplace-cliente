import { View, Text, Pressable } from "react-native";
import { ArrowLeft, SearchX } from "lucide-react-native";

export default function PackagesScreen({ navigation, route }) {
    const { businessName } = route.params;

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-neutral-100">
                <Pressable onPress={() => navigation.goBack()} className="p-1 mr-3">
                    <ArrowLeft size={22} color="#0a0a0a" strokeWidth={2.5} />
                </Pressable>
                <Text className="text-base font-bold text-neutral-950 flex-1" numberOfLines={1}>
                    {businessName}
                </Text>
            </View>

            <View className="flex-1 items-center justify-center px-5" style={{ paddingBottom: 80 }}>
                <SearchX size={56} color="#a3a3a3" strokeWidth={1.5} />
                <Text className="text-sm text-neutral-500 mt-4">
                    Ainda não há Pacotes disponíveis
                </Text>
            </View>
        </View>
    );
}