/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allItems: [],
  feeds: [],
  folders: [],
  selectedItems: [],
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
      state.selectedItems = state.allItems.filter((item) => (item.feedId === action.payload));
    },
    setSelectedByFolderId: (state, action) => {
      const feedIds = state.feeds.filter(
        (feed) => (feed.folderId === action.payload),
      ).map(
        ({ id }) => (id),
      );
      state.selectedItems = state.allItems.filter(
        (item) => feedIds.includes(item.feedId),
      );
    },
    setSelectedByUnread: (state) => {
      state.selectedItems = state.allItems.filter(
        (item) => (item.unread),
      );
    },
    unsetSelected: (state) => {
      state.selectedItems = state.allItems;
    },
  },
});

export const {
  setAllItems,
  setFeeds,
  setFolders,
  setSelectedByFeedId,
  setSelectedByFolderId,
  setSelectedByUnread,
  unsetSelected,
} = newsSlice.actions;

export default newsSlice.reducer;
