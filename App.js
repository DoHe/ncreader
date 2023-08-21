import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  darkColors, lightColors, createTheme, ThemeProvider,
} from '@rneui/themed';
import { Platform, useColorScheme } from 'react-native';
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './store';

import ADrawer from './components/drawer';
import Feed from './components/feed';
import Login from './components/login';
import sync from './data/sync';
import getCredentials from './data/credentials';

const mocked = false;

const theme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.web,
      android: lightColors.platform.android,
      ios: lightColors.platform.ios,
    }),
  },
  darkColors: {
    ...Platform.select({
      default: darkColors.platform.web,
      android: darkColors.platform.android,
      ios: darkColors.platform.ios,
    }),
  },
});

function App() {
  const dispatch = useDispatch();
  theme.mode = useColorScheme();

  const feeds = useSelector((state) => state.news.feeds);
  const folders = useSelector((state) => state.news.folders);
  const selectedItems = useSelector((state) => state.news.selectedItems);
  const allItems = useSelector((state) => state.news.allItems);

  const credentials = useSelector((state) => state.user.credentials);
  const haveCredentials = !!(
    credentials.username
    && credentials.password
    && credentials.url
  );

  const getCredentialsIfNecessary = async () => {
    if (mocked || haveCredentials) {
      return;
    }

    await getCredentials({ dispatch });
  };

  const getData = async () => {
    await sync({
      dispatch, mocked, credentials,
    });
  };

  useEffect(() => {
    getCredentialsIfNecessary();
    getData();
  }, [credentials]);

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        { haveCredentials
          ? (<ADrawer
            content={<Feed
              items={selectedItems}
              feeds={feeds}
            />}
            folders={folders}
            feeds={feeds}
            items={allItems}
          />)
          : (<Login/>)
        }
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function AppWrapper() {
  return (
    <ReduxProvider store={store}>
      <App />
    </ReduxProvider>
  );
}
