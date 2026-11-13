import { View, Pressable, Linking } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { MessageCircle, Music2 } from "lucide-react-native";
import { getSocialLinks } from "../utils/social";
import { showAlert } from "../services/alert";

const SIZE = 44;

function InstagramGlyph({ size = 22, color = "#fff" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="5" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
      <Circle cx="17.2" cy="6.8" r="1.2" fill={color} />
    </Svg>
  );
}

const ICONS = {
  whatsapp: { bg: "#25D366", render: () => <MessageCircle size={22} color="#fff" strokeWidth={2.2} /> },
  instagram: { bg: "#E1306C", render: () => <InstagramGlyph /> },
  tiktok: { bg: "#111111", render: () => <Music2 size={22} color="#fff" strokeWidth={2.2} /> },
};

async function open(url) {
  try {
    await Linking.openURL(url);
  } catch {
    showAlert("Não foi possível abrir", "Verifique se o aplicativo está instalado.");
  }
}

// Ícones de WhatsApp / Instagram / TikTok. Mostra só os que o estabelecimento
// preencheu e não renderiza nada se não houver nenhum.
export default function SocialLinks({ business, className = "" }) {
  const links = getSocialLinks(business);
  if (links.length === 0) return null;

  return (
    <View className={`flex-row ${className}`} style={{ gap: 12 }}>
      {links.map((s) => (
        <Pressable
          key={s.key}
          onPress={() => open(s.url)}
          accessibilityRole="link"
          accessibilityLabel={`Abrir ${s.label}`}
          hitSlop={6}
          className="items-center justify-center rounded-full"
          style={{ width: SIZE, height: SIZE, backgroundColor: ICONS[s.key].bg }}
        >
          {ICONS[s.key].render()}
        </Pressable>
      ))}
    </View>
  );
}
