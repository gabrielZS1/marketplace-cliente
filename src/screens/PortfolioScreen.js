import { useState } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { ArrowLeft } from "lucide-react-native";

export default function PortfolioScreen({ navigation, route }) {
    const { businessName, workspacePhotos = [], portfolioPhotos = [] } = route.params;
    const [activeTab, setActiveTab] = useState("portfolio");

    const photos = activeTab === "workspace" ? workspacePhotos : portfolioPhotos;

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row items-center px-4 pt-12 pb-4">
                <Pressable onPress={() => navigation.goBack()} className="p-1 mr-3">
                    <ArrowLeft size={22} color="#0a0a0a" strokeWidth={2.5} />
                </Pressable>
                <Text className="text-base font-bold text-neutral-950 flex-1" numberOfLines={1}>
                    {businessName}
                </Text>
            </View>

            <View className="flex-row px-4 gap-2 mb-4">
                <Pressable
                    onPress={() => setActiveTab("workspace")}
                    className={`rounded-full px-4 py-2 ${activeTab === "workspace" ? "bg-brand" : "bg-neutral-100"}`}
                >
                    <Text className={`text-xs font-bold ${activeTab === "workspace" ? "text-on-brand" : "text-neutral-600"}`}>
                        Espaço de trabalho ({workspacePhotos.length})
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab("portfolio")}
                    className={`rounded-full px-4 py-2 ${activeTab === "portfolio" ? "bg-brand" : "bg-neutral-100"}`}
                >
                    <Text className={`text-xs font-bold ${activeTab === "portfolio" ? "text-on-brand" : "text-neutral-600"}`}>
                        Portfólio ({portfolioPhotos.length})
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {photos.length === 0 ? (
                    <Text className="text-sm text-neutral-400 text-center mt-10">
                        Nenhuma foto nesta categoria ainda.
                    </Text>
                ) : activeTab === "workspace" ? (
                    // Coluna única, foto grande
                    photos.map((url, i) => (
                        <Image
                            key={i}
                            source={{ uri: url }}
                            className="w-full rounded-2xl mb-4"
                            style={{ height: 220 }}
                            resizeMode="cover"
                        />
                    ))
                ) : (
                    // Grade 2 colunas
                    <View className="flex-row flex-wrap justify-between">
                        {photos.map((url, i) => (
                            <Image
                                key={i}
                                source={{ uri: url }}
                                className="rounded-2xl mb-3"
                                style={{ width: "48%", height: 140 }}
                                resizeMode="cover"
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}