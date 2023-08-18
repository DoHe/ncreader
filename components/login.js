import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Input, Text } from '@rneui/themed';
import { View } from 'react-native';
import { setCredentials } from '../slices/userSlice';
import StyledView from './styledView';

function Login() {
  const dispatch = useDispatch();
  const [username, onChangeUsername] = useState('');
  const [password, onChangePassword] = useState('');
  const [url, onChangeUrl] = useState('');

  useEffect(() => {
    // dispatch(setCredentials({ username: 'hi', password: 'secret' }));
  }, []);
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
        onPress={() => { console.log({ username, url, password }); }}
      />
    </StyledView>
  );
}

export default Login;
