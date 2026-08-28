import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

export default function Spinner({ size = 44, color = "#9f7300" }) {
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(rotation, {
                toValue: 1,
                duration: 1100,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const squareStyle = {
        position: "absolute",
        width: size * 0.62,
        height: size * 0.62,
        borderRadius: size * 0.16,
        borderWidth: size * 0.09,
        borderColor: color,
    };

    return (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Animated.View
                style={[
                    squareStyle,
                    { transform: [{ rotate: spin }] },
                ]}
            />
            <Animated.View
                style={[
                    squareStyle,
                    {
                        transform: [
                            {
                                rotate: rotation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ["45deg", "405deg"],
                                }),
                            },
                        ],
                    },
                ]}
            />
        </View>
    );
}