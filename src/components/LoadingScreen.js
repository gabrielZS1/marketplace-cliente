import { View } from "react-native";
import { PageSkeleton } from "./skeletons";

// Tela de carregamento genérica: um skeleton de página no lugar do antigo
// spinner. As telas principais usam skeletons próprios (ver ./skeletons.js).
export default function LoadingScreen({ backgroundColor = "#ffffff" }) {
    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <PageSkeleton />
        </View>
    );
}
