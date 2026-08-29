import { getAlertHandler } from "../contexts/alertStore";

export function showAlert(title, message, onPress) {
  const show = getAlertHandler();
  if (show) {
    show({
      type: "error",
      title,
      message,
      buttons: [{ text: "OK", onPress, style: "primary" }],
    });
  }
}

export function showSuccess(title, message, onPress) {
  const show = getAlertHandler();
  if (show) {
    show({
      type: "success",
      title,
      message,
      buttons: [{ text: "OK", onPress, style: "primary" }],
    });
  }
}

export function showConfirm(title, message, onConfirm) {
  const show = getAlertHandler();
  if (show) {
    show({
      type: "warning",
      title,
      message,
      buttons: [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: onConfirm },
      ],
    });
  }
}