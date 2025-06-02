import React, { useContext } from 'react';
import { View, Text, Image } from 'react-native';
import { AuthContext } from '../AuthProvider';

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);

  return (
    <View>
      <Text>Profile</Text>
      {user && (
        <View>
          <Image source={{ uri: user.photoURL }} style={{ width: 100, height: 100 }} />
          <Text>Name: {user.displayName}</Text>
          <Text>Email: {user.email}</Text>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;

