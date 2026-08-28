import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// controla como notificações aparecem quando o app está aberto (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  // notificação push só funciona em dispositivo físico, nunca em emulador
  if (!Device.isDevice) {
    console.warn('Push notifications só funcionam em dispositivo físico');
    return null;
  }

  // no Android é obrigatório criar o canal antes de pedir permissão
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('agendamentos', {
      name: 'Agendamentos',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permissão de notificação negada pelo usuário');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;

  if (!projectId) {
    console.error('projectId do EAS não encontrado — rode "eas init" no projeto');
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });

  return tokenResponse.data; // string tipo "ExponentPushToken[xxxxxxxx]"
}