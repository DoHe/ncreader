import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  darkColors, lightColors, createTheme, ThemeProvider,
} from '@rneui/themed';
import {
  Platform, useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './store';
import {
  setAllItems, setFeeds, setFolders, setSelectedByUnread,
} from './slices/newsSlice';

import itemsMock from './mocks/items.json';
import foldersMock from './mocks/folders.json';
import feedsMock from './mocks/feeds.json';
import ADrawer from './components/drawer';
import Feed from './components/feed';
import Login from './components/login';
import { initialSync, subsequentSync } from './data/news';
import {
  credentialsKey, syncDataKey, syncStatusKey, syncStatusSynced,
} from './constants';
import { setCredentials } from './slices/userSlice';

const mocked = false;

const secureGetItem = Platform.OS === 'web' ? AsyncStorage.getItem : SecureStore.getItemAsync;

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

function alphabetical(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function sortData({ folders, feeds, items }) {
  items.items.sort((left, right) => right.pubDate - left.pubDate);
  feeds.feeds.sort((left, right) => alphabetical(left.title, right.title));
  folders.folders.sort((left, right) => alphabetical(left.name, right.name));
}

function dispatchData(dispatch, { folders, feeds, items }) {
  dispatch(setAllItems(items.items));
  dispatch(setFolders(folders.folders));
  dispatch(setFeeds(feeds.feeds));
  dispatch(setSelectedByUnread());
}

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

  const getCredentials = async () => {
    if (mocked || haveCredentials) {
      return;
    }

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
  };

  const getData = async () => {
    if (mocked) {
      const data = {
        folders: foldersMock,
        feeds: feedsMock,
        items: itemsMock,
      };
      sortData(data);
      dispatchData(dispatch, data);
      return;
    }

    if (!haveCredentials) {
      return;
    }

    let data = {};
    const syncStatus = await AsyncStorage.getItem(syncStatusKey);
    if (syncStatus === syncStatusSynced) {
      data = JSON.parse(await AsyncStorage.getItem(syncDataKey));

      dispatchData(dispatch, data);

      let lastModified = 0;
      data.items.items.forEach((item) => {
        if (item.lastModified > lastModified) {
          lastModified = item.lastModified;
        }
      });
      const newData = await subsequentSync(credentials, lastModified);
      for (const oldItem of data.items.items) {
        let isUpdated = false;
        for (const newItem of newData.items.items) {
          if (oldItem.id === newItem.id) {
            isUpdated = true;
            break;
          }
        }
        if (!isUpdated) {
          newData.items.items.push(oldItem);
        }
      }
      sortData(newData);
      AsyncStorage.setItem(syncDataKey, JSON.stringify(newData));
      dispatchData(dispatch, newData);
    } else {
      data = await initialSync(credentials);
      if (!(data?.folders?.folders?.length > 0)) {
        return;
      }
      sortData(data);
      AsyncStorage.setItem(syncDataKey, JSON.stringify(data));
      AsyncStorage.setItem(syncStatusKey, syncStatusSynced);

      dispatchData(dispatch, data);
    }
  };

  useEffect(() => {
    getCredentials();
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
