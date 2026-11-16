// Relatório de falhas (Sentry).
//
// Só liga em builds de produção E com EXPO_PUBLIC_SENTRY_DSN definido (no eas.json ou no
// .env). Sem DSN, nada é carregado nem enviado — o app funciona igual.
//
// O que é enviado: o erro (mensagem e stack) e dados do aparelho/versão. Nada de dados
// pessoais (sendDefaultPii: false). Para stack traces legíveis, configure depois o upload
// de source maps com SENTRY_AUTH_TOKEN no ambiente de build.

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || "";

let Sentry = null;

export function initMonitoring() {
  if (__DEV__ || !DSN || Sentry) return;

  try {
    Sentry = require("@sentry/react-native");
  } catch {
    Sentry = null;
    return;
  }

  try {
    Sentry.init({
      dsn: DSN,
      sendDefaultPii: false,
      enableAutoSessionTracking: true,
      tracesSampleRate: 0,
    });

    // Marca qual atualização OTA (EAS Update) estava rodando quando o erro aconteceu.
    try {
      const Updates = require("expo-updates");
      const scope = Sentry.getGlobalScope();
      scope.setTag("expo-update-id", Updates.updateId ?? "embedded");
      scope.setTag("expo-is-embedded-update", String(Updates.isEmbeddedLaunch));
      if (Updates.channel) scope.setTag("expo-channel", Updates.channel);
    } catch {
      // expo-updates ausente — segue sem as tags.
    }
  } catch {
    Sentry = null;
  }
}

/** Envia um erro ao Sentry (no-op se o Sentry não estiver ativo). */
export function reportError(error, context) {
  if (!Sentry) return;
  try {
    if (error instanceof Error) {
      Sentry.captureException(error, context ? { extra: context } : undefined);
    } else {
      Sentry.captureMessage(String(error), "error");
    }
  } catch {
    // nunca deixar o relatório de erro derrubar o app
  }
}
