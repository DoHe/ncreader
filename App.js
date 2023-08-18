import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  darkColors, lightColors, createTheme, ThemeProvider,
} from '@rneui/themed';
import {
  Platform, useColorScheme,
} from 'react-native';
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './store';
import {
  setAllItems, setFeeds, setFolders, setSelectedByUnread,
} from './slices/newsSlice';

import items from './mocks/items.json';
import folders from './mocks/folders.json';
import feeds from './mocks/feeds.json';
import ADrawer from './components/drawer';
import Feed from './components/feed';
import Login from './components/login';

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

  const { username, password } = useSelector((state) => state.user.credentials);
  const haveCredentials = !!(username && password);

  const getData = async () => {
    if (!haveCredentials) {
      return;
    }
    dispatch(setAllItems(items.items));
    dispatch(setFolders(folders.folders));
    dispatch(setFeeds(feeds.feeds));
    dispatch(setSelectedByUnread());
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        { haveCredentials
          ? (<ADrawer
            content={<Feed/>}
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
