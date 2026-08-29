import { View, Text } from "react-native";
import Spinner from "./Spinner";
import { colors } from "../theme";

export default function LoadingScreen({ label, backgroundColor = "#ffffff" }) {
    return (
        <View
            className="flex-1 items-center justify-center"
            style={{ backgroundColor }}
        >
            <Spinner size={44} color={colors.brandDark} />
            {!!label && (
                <Text className="text-sm text-neutral-500 mt-4">{label}</Text>
            )}
        </View>
    );
}