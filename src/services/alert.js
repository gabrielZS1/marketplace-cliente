import { Alert, Platform } from "react-native";

export function showAlert(title, message, onPress) {
  if (Platform.OS === "web") {
    window.alert(`${title}${message ? `\n\n${message}` : ""}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, onPress ? [{ text: "OK", onPress }] : undefined);
  }
}

export function showConfirm(title, message, onConfirm) {
  if (Platform.OS === "web") {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: onConfirm },
    ]);
  }
}