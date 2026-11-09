import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/**
 * Skeleton loading: blocos cinza no formato do conteúdo, com um brilho
 * (shimmer) passando da esquerda pra direita enquanto os dados carregam.
 *
 * Uso:
 *   <Skeleton width={120} height={14} />
 *   <Skeleton circle width={40} />
 *   <Skeleton tone="dark" ... />   // em cima de fundos escuros
 *
 * Todos os skeletons da tela compartilham UMA animação (sincronizados e
 * baratos). Se o usuário ativou "reduzir movimento", fica só o bloco parado.
 */

const USE_NATIVE_DRIVER = Platform.OS !== "web";

const TONES = {
  light: { base: "#EAEAEA", highlight: 0.75 },
  dark: { base: "rgba(255,255,255,0.12)", highlight: 0.14 },
};

// ---------- animação compartilhada ----------
const progress = new Animated.Value(0);
let subscribers = 0;
let loop = null;

function subscribeShimmer() {
  subscribers += 1;
  if (subscribers === 1) {
    progress.setValue(0);
    loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(350),
      ]),
    );
    loop.start();
  }
  return () => {
    subscribers -= 1;
    if (subscribers === 0) {
      loop?.stop();
      loop = null;
    }
  };
}

// ---------- "reduzir movimento" (uma leitura só pro app inteiro) ----------
let reduceMotion = false;
const motionListeners = new Set();
let motionInit = false;

function subscribeReduceMotion(cb) {
  motionListeners.add(cb);
  if (!motionInit) {
    motionInit = true;
    const set = (v) => {
      reduceMotion = !!v;
      motionListeners.forEach((l) => l());
    };
    AccessibilityInfo.isReduceMotionEnabled?.().then(set).catch(() => {});
    AccessibilityInfo.addEventListener?.("reduceMotionChanged", set);
  }
  return () => motionListeners.delete(cb);
}

function useReduceMotion() {
  return useSyncExternalStore(subscribeReduceMotion, () => reduceMotion);
}

// ---------- componente ----------
export default function Skeleton({
  width,
  height = 12,
  radius = 8,
  circle = false,
  tone = "light",
  style,
  className,
}) {
  const t = TONES[tone] || TONES.light;
  const still = useReduceMotion();
  const [w, setW] = useState(0);
  const gid = "sk" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => (still ? undefined : subscribeShimmer()), [still]);

  const band = Math.max(48, Math.min(w * 0.6, 220));
  const translateX = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-band, w],
      }),
    [band, w],
  );

  const size = circle
    ? { width: width ?? height, height: width ?? height, borderRadius: 9999 }
    : { width, height, borderRadius: radius };

  return (
    <View
      className={className}
      style={[{ overflow: "hidden", backgroundColor: t.base }, size, style]}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      {!still && w > 0 ? (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: band,
            transform: [{ translateX }],
          }}
        >
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={t.highlight} />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gid})`} />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}

/**
 * Envolve um bloco de skeletons e avisa leitores de tela que está carregando
 * (os blocos em si ficam escondidos da acessibilidade).
 */
export function SkeletonGroup({ label = "Carregando", children, style, className }) {
  return (
    <View
      className={className}
      style={style}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      {children}
    </View>
  );
}
