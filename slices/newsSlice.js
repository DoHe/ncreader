/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allItems: [],
  feeds: [],
  folders: [],
  selectedItems: [],
  selectionType: '',
  selectionId: -1,
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
      state.selectionId = action.payload;
      state.selectionType = 'feed';
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
      state.selectionId = action.payload;
      state.selectionType = 'folder';
    },
    setSelectedByUnread: (state) => {
      state.selectedItems = state.allItems.filter(
        (item) => (item.unread),
      );
      state.selectionId = undefined;
      state.selectionType = 'unread';
    },
    setSelectedByStarred: (state) => {
      state.selectedItems = state.allItems.filter(
        (item) => (item.starred),
      );
      state.selectionId = undefined;
      state.selectionType = 'starred';
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
  setSelectedByStarred,
} = newsSlice.actions;

export default newsSlice.reducer;
