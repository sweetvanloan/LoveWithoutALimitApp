// utils/notificationUtils.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Permission for notifications not granted!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;

    // Optional: Set notification handling behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    // Save token to Firestore
    const user = auth.currentUser;
    if (user && token) {
      await updateDoc(doc(db, 'users', user.uid), {
        expoPushToken: token,
      });
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
