/**
 * Fonte única de verdade das cores/identidade do app do cliente (Glowly).
 *
 * Use estes tokens em qualquer lugar que precise de string hex: props de cor do
 * `lucide-react-native`, `LinearGradient`, `style={{ ... }}`, `ActivityIndicator`,
 * `RefreshControl`, etc.
 *
 * Para className (NativeWind) os mesmos tokens estão espelhados em
 * `tailwind.config.js` (`bg-brand`, `text-brand-dark`, `rounded-xl2`, ...).
 */

export const colors = {
  // Amarelo-ouro principal — a identidade. Mais chamativo que os tons antigos.
  brand: "#FFB800",
  // Dourado escuro, legível como texto/ícone sobre fundo claro.
  brandDark: "#8A5A00",
  // Fim de gradiente / faixas escuras douradas.
  brandDeep: "#5B4101",
  // Fundo suave: avatares, chips, badges, destaques discretos.
  brandTint: "#FFF4D6",
  // Texto/ícone sobre botão amarelo (quase preto — melhor contraste que branco).
  onBrand: "#1A1206",

  ink: "#0A0A0A",
  inkSoft: "#525252",
  inkFaint: "#A3A3A3",

  surface: "#FFFFFF",
  surfaceAlt: "#F5F5F5",
  line: "#E5E5E5",

  danger: "#DC2626",
  success: "#16A34A",
  warning: "#F6C344",

  white: "#FFFFFF",
  black: "#000000",
};

// Gradiente padrão do cabeçalho (Home e faixas douradas).
export const brandGradient = ["#FFC01E", "#B37F02", "#5B4101"];

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

export default { colors, brandGradient, radius, shadow };
