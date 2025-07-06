// File: PostDateQuestions.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList } from 'react-native';
import { db, auth } from '../firebase';
import { doc, setDoc, Timestamp, collection, query, where, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

const PostDateQuestions = () => {
  const [responses, setResponses] = useState({
    safe: '',
    happy: '',
    uncomfortable: '',
    nextSteps: ''
  });

  const navigation = useNavigation();
  const route = useRoute();
  const returnTo = route.params?.returnTo || 'Home';

  const handleChange = (field, value) => {
    setResponses((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    const timestamp = Timestamp.now();
    try {
      await setDoc(doc(db, 'postDateReflections', `${user.uid}_${timestamp.seconds}`), {
        userId: user.uid,
        timestamp,
        ...responses
      });
      Alert.alert('Saved', 'Your reflection has been saved.');
      setResponses({ safe: '', happy: '', uncomfortable: '', nextSteps: '' });
      navigation.navigate(returnTo);
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Post-Date Reflection</Text>

      <Text style={styles.label}>What made you feel safe or seen?</Text>
      <TextInput
        style={styles.input}
        multiline
        value={responses.safe}
        onChangeText={(text) => handleChange('safe', text)}
      />

      <Text style={styles.label}>What made you smile or feel joyful?</Text>
      <TextInput
        style={styles.input}
        multiline
        value={responses.happy}
        onChangeText={(text) => handleChange('happy', text)}
      />

      <Text style={styles.label}>Was there anything that made you uncomfortable?</Text>
      <TextInput
        style={styles.input}
        multiline
        value={responses.uncomfortable}
        onChangeText={(text) => handleChange('uncomfortable', text)}
      />

      <Text style={styles.label}>Would you like to go on another date?</Text>
      <TextInput
        style={styles.input}
        multiline
        value={responses.nextSteps}
        onChangeText={(text) => handleChange('nextSteps', text)}
      />

      <Button title="Save Reflection & Return Home" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 15, marginBottom: 5 },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 60 }
});

export default PostDateQuestions;

// File: ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const route = useRoute();
  const { matchedUserId } = route.params;
  const currentUser = auth.currentUser;

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
    const chatId = [currentUser.uid, matchedUserId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp()
    });
    setNewMessage('');
  };

  return (
    <View style={styles.chatContainer}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={item.senderId === currentUser.uid ? styles.myMessage : styles.theirMessage}>
            {item.text}
          </Text>
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
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#dcf8c6', padding: 10, marginVertical: 5, borderRadius: 10 },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#eee', padding: 10, marginVertical: 5, borderRadius: 10 }
});

export default ChatScreen;
