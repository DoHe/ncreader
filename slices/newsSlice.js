/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  feeds: [],
  folders: [],
};

export const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    setFeeds: (state, action) => {
      state.feeds = action.payload;
    },
    setFolders: (state, action) => {
      state.folders = action.payload;
    },
  },
});

export const { setItems, setFeeds, setFolders } = newsSlice.actions;

export default newsSlice.reducer;
