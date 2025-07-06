// File: PostDateQuestions.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const PostDateQuestions = () => {
  const [responses, setResponses] = useState({
    safe: '',
    happy: '',
    uncomfortable: '',
    nextSteps: ''
  });

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

      <Button title="Save Reflection" onPress={handleSubmit} />
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
