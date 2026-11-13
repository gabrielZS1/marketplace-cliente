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

export function showConfirm(title, message, onConfirm, confirmText = "Sair", cancelText = "Cancelar") {
  const show = getAlertHandler();
  if (show) {
    show({
      type: "warning",
      title,
      message,
      buttons: [
        { text: cancelText, style: "cancel" },
        { text: confirmText, style: "destructive", onPress: onConfirm },
      ],
    });
  }
}