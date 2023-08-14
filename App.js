import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  darkColors, lightColors, createTheme, ThemeProvider,
} from '@rneui/themed';
import { Platform, useColorScheme } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import CustomDrawer from './components/drawer';
import { store } from './store';
import { setItems, setFeeds, setFolders } from './slices/newsSlice';

import items from './mocks/items.json';
import folders from './mocks/folders.json';
import feeds from './mocks/feeds.json';

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
    dispatch(setItems(items.items));
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

export default function AppWrapper() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
