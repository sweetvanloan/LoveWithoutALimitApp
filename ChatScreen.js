// File: ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const route = useRoute();
  const { matchedUserId } = route.params;
  const currentUser = auth.currentUser;
  const [matchedUserData, setMatchedUserData] = useState({});

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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [matchedUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const chatId = [currentUser.uid, matchedUserId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
      read: false,
      emojiReaction: null
    });
    setNewMessage('');
  };

  const toggleEmojiReaction = async (msgId) => {
    const chatId = [currentUser.uid, matchedUserId].sort().join('_');
    const msgRef = doc(db, 'chats', chatId, 'messages', msgId);
    await updateDoc(msgRef, {
      emojiReaction: '❤️'
    });
  };

  return (
    <View style={styles.chatContainer}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.senderId === currentUser.uid ? styles.myMessageWrapper : styles.theirMessageWrapper}>
            {item.senderId !== currentUser.uid && matchedUserData?.profilePicture && (
              <Image source={{ uri: matchedUserData.profilePicture }} style={styles.avatar} />
            )}
            <TouchableOpacity onPress={() => toggleEmojiReaction(item.id)}>
              <Text style={item.senderId === currentUser.uid ? styles.myMessage : styles.theirMessage}>
                {item.text} {item.emojiReaction ? item.emojiReaction : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          style={styles.input}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chatContainer: { flex: 1, padding: 10, backgroundColor: '#fff' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  input: { flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, padding: 10, marginRight: 10 },
  myMessageWrapper: { alignSelf: 'flex-end', marginVertical: 5 },
  theirMessageWrapper: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  myMessage: { backgroundColor: '#dcf8c6', padding: 10, borderRadius: 10 },
  theirMessage: { backgroundColor: '#eee', padding: 10, borderRadius: 10 },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 5 }
});

export default ChatScreen;
