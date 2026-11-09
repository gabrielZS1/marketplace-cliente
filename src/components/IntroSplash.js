import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";

/**
 * Abertura animada do app (animated splash / intro).
 *
 * Sequência:
 *  1. O "G" surge girando e crescendo, com um brilho dourado atrás.
 *  2. A estrelinha dispara da ponta do G, gira e começa a piscar.
 *  3. As letras de "Glowly" sobem uma a uma.
 *  4. Espera o app terminar de carregar (sessão/empresa) e então
 *     dá um zoom pra frente e some, revelando o app (estilo Netflix).
 *
 * Props:
 *  - ready: o app terminou de inicializar?
 *  - onFinish: chamado quando a animação de saída termina.
 */

const BG = "#0A0A0A"; // colors.ink
const STAR = "#FFB800"; // colors.brand
const NATIVE = Platform.OS !== "web";

const LOGO_W = 120;
const LOGO_H = Math.round((LOGO_W * 268) / 228); // proporção do intro-logo.png
const STAR_SIZE = 22;
// posição da estrela em relação ao logo (medida no arquivo original)
const STAR_X = LOGO_W * 1.0285 - STAR_SIZE / 2;
const STAR_Y = LOGO_H * 0.112 - STAR_SIZE / 2;

const WORD = "Glowly".split("");
const MIN_INTRO_MS = 2300; // não sai antes da animação "respirar"
const MAX_WAIT_MS = 8000; // se o app travar carregando, sai mesmo assim

const timing = (value, toValue, duration, easing = Easing.out(Easing.cubic), delay = 0) =>
  Animated.timing(value, { toValue, duration, easing, delay, useNativeDriver: NATIVE });

export default function IntroSplash({ ready, onFinish }) {
  const [reduceMotion, setReduceMotion] = useState(null);
  const [introDone, setIntroDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const exiting = useRef(false);

  const logo = useRef(new Animated.Value(0)).current; // 0 → 1 entrada do G
  const glow = useRef(new Animated.Value(0)).current;
  const star = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;
  const letters = useRef(WORD.map(() => new Animated.Value(0))).current;
  const exit = useRef(new Animated.Value(0)).current; // 0 → 1 saída

  useEffect(() => {
    let alive = true;
    (AccessibilityInfo.isReduceMotionEnabled?.() ?? Promise.resolve(false))
      .then((v) => alive && setReduceMotion(!!v))
      .catch(() => alive && setReduceMotion(false));
    const t = setTimeout(() => alive && setTimedOut(true), MAX_WAIT_MS);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  // ---------- entrada ----------
  useEffect(() => {
    if (reduceMotion === null) return;

    if (reduceMotion) {
      // versão calma: tudo aparece junto com um fade simples
      Animated.parallel([
        timing(logo, 1, 400),
        timing(glow, 1, 400),
        timing(star, 1, 400),
        ...letters.map((l) => timing(l, 1, 400)),
      ]).start();
      const t = setTimeout(() => setIntroDone(true), 900);
      return () => clearTimeout(t);
    }

    Animated.parallel([
      // 1. G gira e cresce com mola
      Animated.spring(logo, {
        toValue: 1,
        damping: 11,
        stiffness: 90,
        mass: 0.9,
        delay: 150,
        useNativeDriver: NATIVE,
      }),
      timing(glow, 1, 900, Easing.out(Easing.quad), 300),
      // 2. estrela dispara da ponta
      Animated.spring(star, {
        toValue: 1,
        damping: 9,
        stiffness: 140,
        delay: 750,
        useNativeDriver: NATIVE,
      }),
      // 3. letras sobem em cascata, depois do G
      Animated.sequence([
        Animated.delay(950),
        Animated.stagger(
          65,
          letters.map((l) =>
            Animated.spring(l, {
              toValue: 1,
              damping: 14,
              stiffness: 160,
              useNativeDriver: NATIVE,
            }),
          ),
        ),
      ]),
    ]).start();

    // estrela fica piscando enquanto espera
    const loop = Animated.loop(
      Animated.sequence([
        timing(twinkle, 1, 650, Easing.inOut(Easing.quad)),
        timing(twinkle, 0, 650, Easing.inOut(Easing.quad)),
      ]),
    );
    const loopStart = setTimeout(() => loop.start(), 1400);
    const done = setTimeout(() => setIntroDone(true), MIN_INTRO_MS);
    return () => {
      clearTimeout(loopStart);
      clearTimeout(done);
      loop.stop();
    };
  }, [reduceMotion]);

  // ---------- saída ----------
  useEffect(() => {
    if (!introDone || exiting.current) return;
    if (!ready && !timedOut) return;
    exiting.current = true;
    timing(exit, 1, reduceMotion ? 300 : 520, Easing.in(Easing.cubic)).start(() =>
      onFinish?.(),
    );
  }, [introDone, ready, timedOut]);

  // ---------- interpolações ----------
  const logoStyle = {
    opacity: logo.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
    transform: [
      { scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) },
      { rotate: logo.interpolate({ inputRange: [0, 1], outputRange: ["-35deg", "0deg"] }) },
    ],
  };

  const starStyle = {
    opacity: star.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
    transform: [
      // sai de dentro da ponta do G pra fora
      { translateX: star.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) },
      { translateY: star.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
      { rotate: star.interpolate({ inputRange: [0, 1], outputRange: ["-180deg", "0deg"] }) },
      {
        scale: Animated.multiply(
          star,
          twinkle.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] }),
        ),
      },
    ],
  };

  const glowStyle = {
    opacity: Animated.multiply(
      glow,
      twinkle.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
    ),
    transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
  };

  const groupStyle = {
    transform: [{ scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
    opacity: exit.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.4, 0] }),
  };

  const bgStyle = {
    opacity: exit.interpolate({ inputRange: [0, 0.45, 1], outputRange: [1, 1, 0] }),
  };

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, bgStyle]}
      pointerEvents={introDone ? "none" : "auto"}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Glowly"
    >
      <Animated.View style={[styles.center, groupStyle]}>
        {/* brilho atrás do logo */}
        <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="introGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={STAR} stopOpacity="0.28" />
                <Stop offset="0.45" stopColor={STAR} stopOpacity="0.08" />
                <Stop offset="1" stopColor={STAR} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#introGlow)" />
          </Svg>
        </Animated.View>

        {/* G + estrela */}
        <View style={{ width: LOGO_W, height: LOGO_H }}>
          <Animated.View style={logoStyle}>
            <Image
              source={require("../../assets/intro-logo.png")}
              style={{ width: LOGO_W, height: LOGO_H }}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View style={[styles.star, starStyle]}>
            <Svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 24 24">
              <Path
                d="M12 0C12.9 7.1 16.9 11.1 24 12C16.9 12.9 12.9 16.9 12 24C11.1 16.9 7.1 12.9 0 12C7.1 11.1 11.1 7.1 12 0Z"
                fill={STAR}
              />
            </Svg>
          </Animated.View>
        </View>

        {/* Glowly */}
        <View style={styles.word}>
          {WORD.map((ch, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.letter,
                {
                  opacity: letters[i],
                  transform: [
                    {
                      translateY: letters[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {ch}
            </Animated.Text>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    elevation: 1000,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 340,
    height: 340,
    top: LOGO_H / 2 - 170,
  },
  star: {
    position: "absolute",
    left: STAR_X,
    top: STAR_Y,
  },
  word: {
    flexDirection: "row",
    marginTop: 26,
  },
  letter: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});
