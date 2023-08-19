import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Input, Text } from '@rneui/themed';
import { Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { setCredentials } from '../slices/userSlice';
import StyledView from './styledView';
import { credentialsKey } from '../constants';

const secureSetItem = Platform.OS === 'web' ? AsyncStorage.setItem : SecureStore.setItemAsync;

function Login() {
  const dispatch = useDispatch();
  const [username, onChangeUsername] = useState('');
  const [password, onChangePassword] = useState('');
  const [url, onChangeUrl] = useState('');

  return (
    <StyledView style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text h4={true}>Login</Text>
      <View style={{
        maxWidth: 400,
        width: '80%',
      }}>
        <Input
          placeholder='Username'
          onChangeText={onChangeUsername}
        />
        <Input
          placeholder='Password'
          secureTextEntry={true}
          onChangeText={onChangePassword}
        />
        <Input
          placeholder='Nextcloud URL'
          onChangeText={onChangeUrl}
        />
      </View>
      <Button
        title='Login'
        onPress={() => {
          const credentials = { username, url, password };
          secureSetItem(credentialsKey, JSON.stringify(credentials));
          dispatch(setCredentials(credentials));
        }}
      />
    </StyledView>
  );
}

export default Login;
