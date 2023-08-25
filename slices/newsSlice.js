/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allItems: [],
  feeds: [],
  folders: [],
  selectedItems: [],
  selectionType: '',
  selectionTitle: '',
  selectionId: -1,
  syncing: false,
};

const toggleStarred = (item, id) => {
  if (item.id === id) {
    return { ...item, starred: !item.starred };
  }
  return item;
};

const markRead = (item, id) => {
  if (item.id === id) {
    return { ...item, unread: false };
  }
  return item;
};

export const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setAllItems: (state, action) => {
      state.allItems = action.payload;
      state.selectedItems = action.payload;
    },
    setFeeds: (state, action) => {
      state.feeds = action.payload;
    },
    setFolders: (state, action) => {
      state.folders = action.payload;
    },
    setSelectedByFeedId: (state, action) => {
      const { id, name } = action.payload;
      state.selectedItems = state.allItems.filter((item) => (item.feedId === id));
      state.selectionId = id;
      state.selectionType = 'feed';
      state.selectionTitle = name;
    },
    setSelectedByFolderId: (state, action) => {
      const { id, name } = action.payload;

      const feedIds = state.feeds.filter(
        (feed) => (feed.folderId === id),
      ).map(
        ({ id: feedId }) => (feedId),
      );
      state.selectedItems = state.allItems.filter(
        (item) => feedIds.includes(item.feedId),
      );
      state.selectionId = id;
      state.selectionType = 'folder';
      state.selectionTitle = name;
    },
    setSelectedByUnread: (state) => {
      state.selectedItems = state.allItems.filter(
        (item) => (item.unread),
      );
      state.selectionId = undefined;
      state.selectionType = 'unread';
      state.selectionTitle = 'Unread';
    },
    setSelectedByStarred: (state) => {
      state.selectedItems = state.allItems.filter(
        (item) => (item.starred),
      );
      state.selectionId = undefined;
      state.selectionType = 'starred';
      state.selectionTitle = 'Starred';
    },
    setSyncing: (state, action) => {
      state.syncing = action.payload;
    },
    markItemRead: (state, action) => {
      const id = action.payload;
      state.allItems = state.allItems.map((item) => markRead(item, id));
      state.selectedItems = state.selectedItems.map((item) => markRead(item, id));
    },
    toggleStarredItem: (state, action) => {
      const id = action.payload;
      state.allItems = state.allItems.map((item) => toggleStarred(item, id));
      state.selectedItems = state.selectedItems.map((item) => toggleStarred(item, id));
    },
  },
});

export const {
  markItemRead,
  setAllItems,
  setFeeds,
  setFolders,
  setSelectedByFeedId,
  setSelectedByFolderId,
  setSelectedByUnread,
  setSelectedByStarred,
  setSyncing,
  toggleStarredItem,
} = newsSlice.actions;

export default newsSlice.reducer;
