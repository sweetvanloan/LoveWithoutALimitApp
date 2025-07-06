// File: DateTracker.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const DateTracker = () => {
  const [dateStarted, setDateStarted] = useState(null);
  const [mood, setMood] = useState(null);
  const [isDateActive, setIsDateActive] = useState(false);
  const navigation = useNavigation();

  const startDate = () => {
    const now = Timestamp.now();
    setDateStarted(now);
    setIsDateActive(true);
  };

  const endDate = async () => {
    const now = Timestamp.now();
    const duration = (now.seconds - dateStarted.seconds) / 60;
    const user = auth.currentUser;

    await setDoc(doc(db, 'dateLogs', `${user.uid}_${dateStarted.seconds}`), {
      userId: user.uid,
      startTime: dateStarted,
      endTime: now,
      durationMinutes: duration,
      mood,
    });

    setIsDateActive(false);
    setMood(null);
    setDateStarted(null);

    navigation.navigate('PostDateQuestions');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Date Tracker</Text>
      {isDateActive ? (
        <>
          <Text>Date is in progress...</Text>
          <Text style={styles.label}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            <Button title="😊" onPress={() => setMood('happy')} />
            <Button title="😐" onPress={() => setMood('neutral')} />
            <Button title="😕" onPress={() => setMood('unsure')} />
            <Button title="😞" onPress={() => setMood('sad')} />
          </View>
          <Button title="End Date" onPress={endDate} />
        </>
      ) : (
        <Button title="Start Date" onPress={startDate} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 20 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 10 }
});

export default DateTracker;
