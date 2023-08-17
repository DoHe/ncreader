import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  darkColors, lightColors, createTheme, ThemeProvider,
} from '@rneui/themed';
import {
  Platform, useColorScheme,
} from 'react-native';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomDrawer from './components/nav-drawer';
import { store } from './store';
import {
  setAllItems, setFeeds, setFolders, setSelectedByUnread,
} from './slices/newsSlice';

import items from './mocks/items.json';
import folders from './mocks/folders.json';
import feeds from './mocks/feeds.json';
import ADrawer from './components/drawer';
import Feed from './components/feed';

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

const App = () => {
  const dispatch = useDispatch();

  const getData = async () => {
    dispatch(setAllItems(items.items));
    dispatch(setFolders(folders.folders));
    dispatch(setFeeds(feeds.feeds));
  };

  useEffect(() => {
    getData();
  }, []);

  theme.mode = useColorScheme();
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <CustomDrawer></CustomDrawer>
      </NavigationContainer>
    </ThemeProvider>
  );
};

const App2 = () => {
  const dispatch = useDispatch();

  const getData = async () => {
    dispatch(setAllItems(items.items));
    dispatch(setFolders(folders.folders));
    dispatch(setFeeds(feeds.feeds));
    dispatch(setSelectedByUnread());
  };

  useEffect(() => {
    getData();
  }, []);

  theme.mode = useColorScheme();
  const content = <Feed/>;
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <ADrawer content={content}></ADrawer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default function AppWrapper() {
  return (
    <ReduxProvider store={store}>
      <App2 />
    </ReduxProvider>
  );
}
