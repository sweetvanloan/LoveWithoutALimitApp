import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './AuthProvider';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from './utils/notifications';
import { auth } from './firebase';
import { registerForPushNotificationsAsync } from './utils/notificationUtils';


useEffect(() => {
  if (auth.currentUser) {
    registerForPushNotificationsAsync(auth.currentUser.uid);
  }
}, []);


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


const registerForPushNotificationsAsync = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Save token to Firestore
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { expoPushToken: token }, { merge: true });
    }
  }
};


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

const sendPushNotification = async (token, body) => {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      sound: 'default',
      title: 'New Message 💌',
      body,
    }),
  });
};

const sendPushNotification = async (token, body) => {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      sound: 'default',
      title: 'New Message 💬',
      body,
    }),
  });
};


const sendMessage = async () => {
  if (!newMessage.trim() && !selectedImage) return;
  const chatId = [currentUser.uid, matchedUserId].sort().join('_');
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  // Fetch push token
const recipientDoc = await getDoc(doc(db, 'users', matchedUserId));
const token = recipientDoc.data()?.expoPushToken;

if (token) {
  await sendPushNotification(token, newMessage);
}


  await addDoc(messagesRef, {
    senderId: currentUser.uid,
    text: newMessage,
    image: selectedImage,
    timestamp: serverTimestamp(),
    read: false,
    emojiReaction: null
  });

  // Fetch matched user's token
  const userDoc = await getDoc(doc(db, 'users', matchedUserId));
  const recipient = userDoc.data();
  if (recipient?.expoPushToken) {
    await sendPushNotification(recipient.expoPushToken, `${currentUser.displayName || 'Someone'}: ${newMessage}`);
  }

  setNewMessage('');
  setSelectedImage(null);
};

registerForPushNotificationsAsync()
