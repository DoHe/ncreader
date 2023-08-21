import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { credentialsKey } from '../constants';
import { setCredentials } from '../slices/userSlice';

const secureGetItem = Platform.OS === 'web' ? AsyncStorage.getItem : SecureStore.getItemAsync;

async function getCredentials({ dispatch }) {
  const storedValued = await secureGetItem(credentialsKey);
  if (!storedValued) {
    return;
  }

  const storedCredentials = JSON.parse(storedValued);
  if (!(
    storedCredentials.username
      && storedCredentials.password
      && storedCredentials.url
  )) {
    return;
  }

  dispatch(setCredentials(storedCredentials));
}

export default getCredentials;
