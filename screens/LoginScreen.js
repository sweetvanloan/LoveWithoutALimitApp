import React from 'react';
import { View, Button, Text } from 'react-native';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

const LoginScreen = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <Text>Welcome to Love Without a Limit</Text>
      <Button title="Login with Google" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
