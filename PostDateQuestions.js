// File: PostDateQuestions.js
// [unchanged code remains above...]

// File: ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { db, auth } from '../firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';

const emojiOptions = ['❤️', '😂', '👍', '😢', '🔥'];

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const route = useRoute();
  const { matchedUserId } = route.params;
  const currentUser = auth.currentUser;
  const [matchedUserData, setMatchedUserData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const docSnap = await getDoc(doc(db, 'users', matchedUserId));
      if (docSnap.exists()) {
        setMatchedUserData(docSnap.data());
      }
    };
    fetchUserData();
  }, [matchedUserId]);

  useEffect(() => {
    const chatId = [currentUser.uid, matchedUserId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);

      // Mark messages as read
      snapshot.docs.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (!data.read && data.senderId !== currentUser.uid) {
          await updateDoc(docSnap.ref, { read: true });
        }
      });
    });

    return unsubscribe;
  }, [matchedUserId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
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

    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      text: newMessage,
      image: selectedImage,
      timestamp: serverTimestamp(),
      read: false,
      emojiReaction: null
    });

    // Send push notification
    const recipientDoc = await getDoc(doc(db, 'users', matchedUserId));
    const token = recipientDoc.data()?.expoPushToken;
    if (token) await sendPushNotification(token, newMessage);

    setNewMessage('');
    setSelectedImage(null);
  };

  const addEmojiReaction = async (msgId, emoji) => {
    const chatId = [currentUser.uid, matchedUserId].sort().join('_');
    const msgRef = doc(db, 'chats', chatId, 'messages', msgId);
    await updateDoc(msgRef, { emojiReaction: emoji });
  };

  return (
    <View style={styles.chatContainer}>
      {loading ? <ActivityIndicator size="large" color="#888" /> : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={item.senderId === currentUser.uid ? styles.myMessageWrapper : styles.theirMessageWrapper}>
              {item.senderId !== currentUser.uid && matchedUserData?.profilePicture && (
                <Image source={{ uri: matchedUserData.profilePicture }} style={styles.avatar} />
              )}
              <TouchableOpacity>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.sharedImage} />
                )}
                <Text style={item.senderId === currentUser.uid ? styles.myMessage : styles.theirMessage}>
                  {item.text} {item.emojiReaction ? item.emojiReaction : ''}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiBar}>
                  {emojiOptions.map((emoji) => (
                    <TouchableOpacity key={emoji} onPress={() => addEmojiReaction(item.id, emoji)}>
                      <Text style={styles.emoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {item.read && item.senderId === currentUser.uid && (
                  <Text style={styles.readReceipt}>Seen</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {isTyping && (
        <Text style={{ marginLeft: 10, fontStyle: 'italic', color: '#888' }}>
          You are typing...
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={text => {
            setNewMessage(text);
            setIsTyping(text.length > 0);
          }}
          placeholder="Type your message..."
          style={styles.input}
        />
        <Button title="📷" onPress={pickImage} />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chatContainer: { flex: 1, padding: 10, backgroundColor: '#fff' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  input: { flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, padding: 10, marginRight: 5 },
  myMessageWrapper: { alignSelf: 'flex-end', marginVertical: 5 },
  theirMessageWrapper: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  myMessage: { backgroundColor: '#dcf8c6', padding: 10, borderRadius: 10 },
  theirMessage: { backgroundColor: '#eee', padding: 10, borderRadius: 10 },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 5 },
  sharedImage: { width: 150, height: 150, borderRadius: 10, marginTop: 5 },
  emojiBar: { flexDirection: 'row', marginTop: 5 },
  emoji: { fontSize: 18, marginHorizontal: 4 },
  readReceipt: { fontSize: 10, color: '#888', marginTop: 2 }
});

export default ChatScreen;
