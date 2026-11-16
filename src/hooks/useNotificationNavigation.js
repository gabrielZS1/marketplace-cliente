import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { navigationRef } from "../navigation/navigationRef";
import logger from "../services/logger";

// Notificações já tratadas (evita abrir duas vezes a mesma ao voltar para o app).
const handled = new Set();

function openFromNotification(response, attempt = 0) {
  const id = response?.notification?.request?.identifier;
  const data = response?.notification?.request?.content?.data;
  if (!data || (id && handled.has(id))) return;

  if (!navigationRef.isReady()) {
    // App ainda abrindo (ex.: aberto pela própria notificação) — tenta de novo.
    if (attempt < 20) setTimeout(() => openFromNotification(response, attempt + 1), 300);
    return;
  }

  if (id) handled.add(id);

  try {
    if (data.type === "APPOINTMENT_STATUS") {
      // A tela de agendamentos recarrega a lista sozinha ao ganhar foco.
      navigationRef.navigate("MainTabs", { screen: "Agendamentos" });
    }
  } catch (err) {
    logger.warn("Não foi possível abrir a tela da notificação:", err?.message);
  }
}

/**
 * Ao tocar numa notificação de "agendamento confirmado/recusado", abre "Agendamentos".
 * Montar só quando o cliente está logado (as rotas de dentro do app existem).
 */
export function useNotificationNavigation() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(openFromNotification);

    // App fechado e aberto pelo toque na notificação.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) openFromNotification(response);
      })
      .catch(() => {});

    return () => sub.remove();
  }, []);
}
