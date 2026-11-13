// Converte o que o estabelecimento cadastra no painel (um @perfil ou um número
// de telefone) em links que abrem o app/site da rede social.
// Só devolvemos links dos domínios esperados — nunca uma URL arbitrária vinda da API.

const HANDLE_RE = /^[A-Za-z0-9._]{1,40}$/;

function cleanHandle(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  // Aceita link completo só do domínio esperado: pega o último trecho do caminho.
  const fromUrl = raw.match(/^https?:\/\/(?:www\.)?(?:instagram\.com|tiktok\.com)\/([^/?#]+)/i);
  const handle = (fromUrl ? fromUrl[1] : raw).replace(/^@/, "");

  return HANDLE_RE.test(handle) ? handle : null;
}

export function instagramLink(value) {
  const handle = cleanHandle(value);
  return handle ? `https://www.instagram.com/${handle}` : null;
}

export function tiktokLink(value) {
  const handle = cleanHandle(value);
  return handle ? `https://www.tiktok.com/@${handle}` : null;
}

export function whatsappLink(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountry}`;
}

/** Lista só as redes que o estabelecimento preencheu (e que têm link válido). */
export function getSocialLinks(business) {
  if (!business) return [];
  return [
    { key: "whatsapp", label: "WhatsApp", url: whatsappLink(business.whatsappUrl) },
    { key: "instagram", label: "Instagram", url: instagramLink(business.instagramUrl) },
    { key: "tiktok", label: "TikTok", url: tiktokLink(business.tiktokUrl) },
  ].filter((s) => !!s.url);
}
