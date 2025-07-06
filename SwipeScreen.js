// File: SwipeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const SwipeScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchProfiles = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== auth.currentUser.uid) {
          userList.push({ id: doc.id, ...doc.data() });
        }
      });
      setProfiles(userList);
    };
    fetchProfiles();
  }, []);

  const handleSwipe = async (like) => {
    const user = auth.currentUser;
    const target = profiles[currentIndex];
    if (!target) return;

    await setDoc(doc(db, 'swipes', `${user.uid}_${target.id}`), {
      userId: user.uid,
      targetId: target.id,
      like,
      timestamp: new Date()
    });

    setCurrentIndex((prev) => prev + 1);
  };

  const currentProfile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      {currentProfile ? (
        <View style={styles.card}>
          <Image source={{ uri: currentProfile.profilePicture }} style={styles.image} />
          <Text style={styles.name}>{currentProfile.name}</Text>
          <Text>{currentProfile.pronouns}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={() => handleSwipe(false)} style={styles.nope}>
              <Text>❌</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSwipe(true)} style={styles.yep}>
              <Text>❤️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text>No more profiles</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { width: 300, height: 400, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#fff', padding: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  image: { width: 150, height: 150, borderRadius: 75, marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold' },
  buttons: { flexDirection: 'row', marginTop: 20 },
  nope: { marginRight: 40 },
  yep: { marginLeft: 40 }
});

export default SwipeScreen;
