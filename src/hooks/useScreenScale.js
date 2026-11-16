import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Altura (em dp) do celular onde as telas foram desenhadas. Em telas iguais ou
// maiores fica tudo como foi desenhado; em telas menores (ou com DPI/"tamanho
// da tela" diferente) ilustrações e espaçamentos encolhem juntos, para os
// botões não irem parar lá embaixo.
const REFERENCE_HEIGHT = 900;
const MIN_SCALE = 0.6;

export default function useScreenScale() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(1, Math.max(MIN_SCALE, height / REFERENCE_HEIGHT));

  // s(valor, mínimo): medida proporcional à altura da tela.
  const s = (value, min = 0) => Math.max(min, Math.round(value * scale));

  return { scale, s, insets };
}
