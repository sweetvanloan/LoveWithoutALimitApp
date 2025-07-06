// File: MatchConsentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

const MatchConsentScreen = ({ route, navigation }) => {
  const { matchedUserId } = route.params;
  const currentUser = auth.currentUser;

  const [consentGiven, setConsentGiven] = useState(false);
  const [matchedConsent, setMatchedConsent] = useState(false);

  useEffect(() => {
    const fetchConsent = async () => {
      const docSnap = await getDoc(doc(db, 'matchConsents', `${matchedUserId}_${currentUser.uid}`));
      if (docSnap.exists()) {
        setMatchedConsent(docSnap.data().consentGiven);
      }
    };
    fetchConsent();
  }, [matchedUserId]);

  const handleSubmit = async () => {
    await setDoc(doc(db, 'matchConsents', `${currentUser.uid}_${matchedUserId}`), {
      from: currentUser.uid,
      to: matchedUserId,
      consentGiven,
      timestamp: Timestamp.now()
    });

    if (consentGiven && matchedConsent) {
      // Both users have opted in, navigate to chat
      navigation.navigate('ChatScreen', { matchedUserId });
    } else {
      Alert.alert('Waiting for Match', 'Your chat will unlock once both users opt-in.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Consent to Connect</Text>
      <Text style={styles.text}>Do you want to open communication with this match?</Text>
      <View style={styles.switchContainer}>
        <Text>{consentGiven ? '✅ Yes' : '❌ No'}</Text>
        <Switch value={consentGiven} onValueChange={setConsentGiven} />
      </View>
      <Button title="Submit Consent" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 }
});

export default MatchConsentScreen;

// Update DateTracker.js to auto-navigate to PostDateQuestions.js
// Add the following lines to the endDate function in DateTracker.js:
// navigation.navigate('PostDateQuestions');
