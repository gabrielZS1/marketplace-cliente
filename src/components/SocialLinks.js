import { View, Pressable, Linking } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { MessageCircle, Music2 } from "lucide-react-native";
import { getSocialLinks } from "../utils/social";
import { showAlert } from "../services/alert";

const ICON = 28;

function InstagramGlyph({ size = ICON, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="5" stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.8" />
      <Circle cx="17.2" cy="6.8" r="1.2" fill={color} />
    </Svg>
  );
}

// Só o ícone (sem círculo de fundo), na cor de cada rede.
const ICONS = {
  whatsapp: { color: "#25D366", render: (c, s) => <MessageCircle size={s} color={c} strokeWidth={1.8} /> },
  instagram: { color: "#E1306C", render: (c, s) => <InstagramGlyph size={s} color={c} /> },
  tiktok: { color: "#111111", render: (c, s) => <Music2 size={s} color={c} strokeWidth={1.8} /> },
};

// Versão discreta: pequena e cinza, para ficar no canto sem chamar atenção.
const SUBTLE_SIZE = 17;
const SUBTLE_COLOR = "#A3A3A3";

async function open(url) {
  try {
    await Linking.openURL(url);
  } catch {
    showAlert("Não foi possível abrir", "Verifique se o aplicativo está instalado.");
  }
}

// Ícones de WhatsApp / Instagram / TikTok. Mostra só os que o estabelecimento
// preencheu e não renderiza nada se não houver nenhum.
// `subtle`: ícones pequenos e cinza (tela principal do estabelecimento).
export default function SocialLinks({ business, className = "", subtle = false }) {
  const links = getSocialLinks(business);
  if (links.length === 0) return null;

  const size = subtle ? SUBTLE_SIZE : ICON;

  return (
    <View className={`flex-row items-center ${className}`} style={{ gap: subtle ? 14 : 20 }}>
      {links.map((s) => (
        <Pressable
          key={s.key}
          onPress={() => open(s.url)}
          accessibilityRole="link"
          accessibilityLabel={`Abrir ${s.label}`}
          hitSlop={subtle ? 12 : 10}
        >
          {ICONS[s.key].render(subtle ? SUBTLE_COLOR : ICONS[s.key].color, size)}
        </Pressable>
      ))}
    </View>
  );
}
