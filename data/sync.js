import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import itemsMock from '../mocks/items.json';
import foldersMock from '../mocks/folders.json';
import feedsMock from '../mocks/feeds.json';
import {
  setAllItems, setFeeds, setFolders, setSelectedByUnread, setSyncing,
} from '../slices/newsSlice';
import {
  syncDataKey, syncStatusKey, syncStatusSynced,
} from '../constants';

import { initialSync, subsequentSync } from './news';

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

async function sync({ dispatch, mocked, credentials }) {
  dispatch(setSyncing(true));
  console.log('syncing');
  try {
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

    if (!(credentials.username
      && credentials.password
      && credentials.url)) {
      return;
    }

    let data = {};
    const syncStatus = await AsyncStorage.getItem(syncStatusKey);
    if (syncStatus === syncStatusSynced) {
      console.log('resync');
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
      newData.items.items = newData.items.items.filter((item) => item.unread || item.starred);
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
  } finally {
    console.log('done');
    dispatch(setSyncing(false));
  }
}

export default sync;
